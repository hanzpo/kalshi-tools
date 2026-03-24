export type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

type LayoutShiftEntry = PerformanceEntry & {
  value: number;
  hadRecentInput: boolean;
};

type EventTimingEntry = PerformanceEntry & {
  duration: number;
};

type EventTimingObserverInit = PerformanceObserverInit & {
  durationThreshold?: number;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function sanitizeParams(params: AnalyticsParams): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
  ) as Record<string, string | number | boolean>;
}

export function trackEvent(name: string, params: AnalyticsParams = {}): void {
  if (typeof window === 'undefined') return;
  const gtag = window.gtag;
  if (typeof gtag !== 'function') return;
  gtag('event', name, sanitizeParams(params));
}

export function trackPageView(path: string, title?: string, referrer?: string): void {
  trackEvent('page_view', {
    page_path: path,
    page_title: title ?? document.title,
    page_location: typeof window !== 'undefined' ? window.location.href : undefined,
    page_referrer: referrer,
  });
}

export function trackException(description: string, fatal: boolean = false): void {
  trackEvent('exception', { description, fatal });
}

// Session tracking with UTM parameters
export function trackSessionStart(): void {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);

  trackEvent('session_start', {
    referrer: document.referrer || undefined,
    utm_source: urlParams.get('utm_source') || undefined,
    utm_medium: urlParams.get('utm_medium') || undefined,
    utm_campaign: urlParams.get('utm_campaign') || undefined,
    utm_content: urlParams.get('utm_content') || undefined,
    entry_page: window.location.pathname,
  });
}

// User engagement tracking - time spent and actions taken
let sessionStartTime: number | null = null;
let actionCount = 0;

export function startEngagementTracking(): () => void {
  if (typeof window === 'undefined') return () => {};

  sessionStartTime = Date.now();
  actionCount = 0;

  const trackEngagement = () => {
    if (sessionStartTime === null) return;

    const durationSeconds = Math.round((Date.now() - sessionStartTime) / 1000);
    const tool = window.location.pathname.replace('/', '') || 'home';

    trackEvent('tool_engagement', {
      tool,
      duration_seconds: durationSeconds,
      actions_count: actionCount,
    });
  };

  // Track on page hide/close
  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      trackEngagement();
    }
  };

  window.addEventListener('pagehide', trackEngagement, { once: true });
  document.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}

export function startScrollTracking(): () => void {
  if (typeof window === 'undefined') return () => {};

  const thresholds = [25, 50, 75, 90, 100];
  const fired = new Set<number>();
  let ticking = false;

  const checkScrollDepth = () => {
    ticking = false;
    const doc = document.documentElement;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    if (scrollHeight <= 0) {
      if (!fired.has(100)) {
        fired.add(100);
        trackEvent('scroll_depth', {
          percent: 100,
          page_path: window.location.pathname,
        });
      }
      return;
    }

    const scrollTop = window.scrollY || doc.scrollTop;
    const percent = Math.round((scrollTop / scrollHeight) * 100);

    thresholds.forEach((threshold) => {
      if (percent >= threshold && !fired.has(threshold)) {
        fired.add(threshold);
        trackEvent('scroll_depth', {
          percent: threshold,
          page_path: window.location.pathname,
        });
      }
    });
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(checkScrollDepth);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  checkScrollDepth();

  return () => window.removeEventListener('scroll', onScroll);
}

export function startOutboundLinkTracking(): () => void {
  if (typeof document === 'undefined') return () => {};

  const onClick = (event: MouseEvent) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a') as HTMLAnchorElement | null;
    if (!anchor?.href) return;

    const href = anchor.getAttribute('href') ?? '';
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

    let url: URL;
    try {
      url = new URL(anchor.href, window.location.origin);
    } catch {
      return;
    }

    if (url.origin === window.location.origin) return;

    const linkText = anchor.textContent?.trim().slice(0, 120);

    trackEvent('outbound_click', {
      link_url: url.href,
      link_domain: url.hostname,
      link_text: linkText || undefined,
      link_target: anchor.target || undefined,
    });
  };

  document.addEventListener('click', onClick);
  return () => document.removeEventListener('click', onClick);
}

export function startErrorTracking(): () => void {
  if (typeof window === 'undefined') return () => {};

  const onError = (event: ErrorEvent) => {
    const message = event.message || 'Unknown error';
    const location = event.filename ? `${event.filename}:${event.lineno ?? 0}:${event.colno ?? 0}` : '';
    const description = location ? `${message} @ ${location}` : message;
    trackException(description, false);
  };

  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    let reason = '';
    if (typeof event.reason === 'string') {
      reason = event.reason;
    } else {
      try {
        reason = JSON.stringify(event.reason);
      } catch {
        reason = String(event.reason);
      }
    }
    trackException(`Unhandled rejection: ${reason}`, false);
  };

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onUnhandledRejection);

  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onUnhandledRejection);
  };
}

export function startPerformanceTracking(): () => void {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
    return () => {};
  }

  let lcpValue: number | null = null;
  let clsValue = 0;
  let inpValue = 0;
  let reported = false;

  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    if (lastEntry) {
      lcpValue = lastEntry.startTime;
    }
  });

  const clsObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries() as LayoutShiftEntry[];
    entries.forEach((entry) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });
  });

  const inpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries() as EventTimingEntry[];
    entries.forEach((entry) => {
      if (entry.duration > inpValue) {
        inpValue = entry.duration;
      }
    });
  });

  try {
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (error) {
    void error;
  }

  try {
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (error) {
    void error;
  }

  try {
    inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 40 } as EventTimingObserverInit);
  } catch (error) {
    void error;
  }

  const reportVitals = () => {
    if (reported) return;
    reported = true;
    const pagePath = window.location.pathname;

    if (lcpValue !== null) {
      trackEvent('web_vitals', {
        metric: 'LCP',
        value: Math.round(lcpValue),
        unit: 'ms',
        page_path: pagePath,
      });
    }

    if (clsValue > 0) {
      trackEvent('web_vitals', {
        metric: 'CLS',
        value: Number(clsValue.toFixed(3)),
        unit: 'score',
        page_path: pagePath,
      });
    }

    if (inpValue > 0) {
      trackEvent('web_vitals', {
        metric: 'INP',
        value: Math.round(inpValue),
        unit: 'ms',
        page_path: pagePath,
      });
    }
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      reportVitals();
    }
  };

  window.addEventListener('pagehide', reportVitals, { once: true });
  document.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    lcpObserver.disconnect();
    clsObserver.disconnect();
    inpObserver.disconnect();
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}

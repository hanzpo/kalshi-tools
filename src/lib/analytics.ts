export type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

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


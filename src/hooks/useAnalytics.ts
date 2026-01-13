import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  startErrorTracking,
  startOutboundLinkTracking,
  startPerformanceTracking,
  startScrollTracking,
  trackPageView,
} from '../utils/analytics';

export function useAnalytics(): void {
  const location = useLocation();
  const previousPathRef = useRef<string | null>(null);
  const hasTrackedInitialRef = useRef(false);

  useEffect(() => {
    const path = `${location.pathname}${location.search}${location.hash}`;
    const referrer = previousPathRef.current
      ? `${window.location.origin}${previousPathRef.current}`
      : document.referrer || undefined;

    if (hasTrackedInitialRef.current) {
      trackPageView(path, document.title, referrer);
    } else {
      hasTrackedInitialRef.current = true;
    }
    previousPathRef.current = path;

    return startScrollTracking();
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const stopOutbound = startOutboundLinkTracking();
    const stopErrors = startErrorTracking();
    const stopPerf = startPerformanceTracking();

    return () => {
      stopOutbound();
      stopErrors();
      stopPerf();
    };
  }, []);
}

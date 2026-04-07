import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  startEngagementTracking,
  startErrorTracking,
  trackPageView,
  trackSessionStart,
} from '../lib/analytics';

export function useAnalytics(): void {
  const location = useLocation();
  const previousPathRef = useRef<string | null>(null);
  const hasTrackedInitialRef = useRef(false);

  // Track session start on first load
  useEffect(() => {
    trackSessionStart();
  }, []);

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
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const stopErrors = startErrorTracking();
    const stopEngagement = startEngagementTracking();

    return () => {
      stopErrors();
      stopEngagement();
    };
  }, []);
}

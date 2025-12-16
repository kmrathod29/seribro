// src/hooks/useAutoRefresh.js
// Custom hook for auto-refreshing dashboard data - Phase 3
// Polls the API every 30 seconds and updates dashboard automatically

import { useEffect, useCallback, useRef } from 'react';

/**
 * Hinglish: useAutoRefresh hook - status updates ko automatically detect karta hai
 * Agar admin ne approve/reject kiya toh student/company dashboard automatically update ho jata hai
 * 
 * @param {Function} fetchFn - API function to call for refreshing data
 * @param {Number} interval - Interval in milliseconds (default 30000 = 30 seconds)
 * @param {Boolean} enabled - Enable or disable auto-refresh (default true)
 */
export const useAutoRefresh = (fetchFn, interval = 30000, enabled = true) => {
  const intervalRef = useRef(null);

  const startAutoRefresh = useCallback(() => {
    if (!enabled || !fetchFn) return;

    // Hinglish: Pehle ek baar fetch karo
    fetchFn();

    // Hinglish: Phir har interval mein fetch karo
    intervalRef.current = setInterval(() => {
      fetchFn();
    }, interval);
  }, [fetchFn, interval, enabled]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start auto-refresh on mount
  useEffect(() => {
    startAutoRefresh();

    // Cleanup on unmount
    return () => {
      stopAutoRefresh();
    };
  }, [startAutoRefresh, stopAutoRefresh]);

  return { stopAutoRefresh, startAutoRefresh };
};

export default useAutoRefresh;

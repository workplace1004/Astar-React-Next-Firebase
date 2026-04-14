import { useEffect, useRef, useCallback } from "react";

const ACTIVITY_THROTTLE_MS = 1000;

/**
 * After `ms` without user activity, runs `onIdle` (e.g. logout).
 * Activity is detected via common window events, throttled to avoid excess work.
 */
export function useIdleLogout(options: {
  enabled: boolean;
  /** Time without activity before `onIdle` runs (default 10 minutes). */
  ms?: number;
  onIdle: () => void | Promise<void>;
}) {
  const { enabled, ms = 10 * 60 * 1000, onIdle } = options;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const armTimer = useCallback(() => {
    clearTimer();
    if (!enabled) return;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void onIdleRef.current();
    }, ms);
  }, [enabled, ms, clearTimer]);

  useEffect(() => {
    if (!enabled) {
      clearTimer();
      return;
    }

    armTimer();

    let lastActivity = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - lastActivity < ACTIVITY_THROTTLE_MS) return;
      lastActivity = now;
      armTimer();
    };

    const events: (keyof WindowEventMap)[] = [
      "mousedown",
      "mousemove",
      "keydown",
      "touchstart",
      "scroll",
      "wheel",
      "click",
    ];
    for (const ev of events) {
      window.addEventListener(ev, onActivity, { passive: true });
    }

    return () => {
      for (const ev of events) {
        window.removeEventListener(ev, onActivity);
      }
      clearTimer();
    };
  }, [enabled, ms, armTimer, clearTimer]);
}

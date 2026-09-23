// SECURITY LAYER: processes
// Cross-cutting session lifecycle: auto-logout after inactivity so a
// forgotten, unlocked device doesn't stay authenticated indefinitely.
import { tokenStorage } from '@shared/lib/tokenStorage';

const IDLE_LIMIT_MS = 15 * 60 * 1000; // 15 minutes
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll'] as const;

export function startIdleWatcher(onTimeout: () => void): () => void {
  let timer: ReturnType<typeof setTimeout>;

  function reset() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      tokenStorage.clear();
      onTimeout();
    }, IDLE_LIMIT_MS);
  }

  ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, reset));
  reset();

  // Cleanup function — call on unmount to avoid leaking listeners.
  return () => {
    clearTimeout(timer);
    ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, reset));
  };
}

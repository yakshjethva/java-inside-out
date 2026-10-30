/**
 * Registers the service worker that keeps the site usable offline after the
 * first visit (production builds only; see src/sw/service-worker.js).
 */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch(() => {
        // Offline support is an enhancement; the site works without it.
      });
  });
}

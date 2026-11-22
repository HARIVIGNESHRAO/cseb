// Run before hydration: a production worker on localhost must not serve old
// development chunks. Saved PDF bytes and metadata are deliberately retained.
export const developmentOfflineReset = `
(async () => {
  if (!('serviceWorker' in navigator)) return;
  const isPortalWorker = (url) => {
    try {
      const worker = new URL(url);
      return worker.origin === location.origin && worker.pathname === '/sw.js';
    } catch { return false; }
  };
  const controlled = isPortalWorker(navigator.serviceWorker.controller?.scriptURL);
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.filter((registration) =>
      [registration.active, registration.waiting, registration.installing]
        .some((worker) => worker && isPortalWorker(worker.scriptURL))
    ).map((registration) => registration.unregister()));
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.filter((name) =>
        /^dhurandhar-(pages|assets|shell)-/.test(name)
      ).map((name) => caches.delete(name)));
    }
    if (controlled) location.reload();
  } catch { /* Storage restrictions must not prevent development. */ }
})();
`;

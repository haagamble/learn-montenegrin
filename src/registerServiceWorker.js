const appBaseUrl = new URL(import.meta.env.BASE_URL, window.location.origin);

function getSameOriginAppResources() {
  return performance
    .getEntriesByType('resource')
    .map((entry) => entry.name)
    .filter((url) => {
      const resourceUrl = new URL(url);
      return resourceUrl.origin === window.location.origin && resourceUrl.pathname.startsWith(appBaseUrl.pathname);
    });
}

export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        `${import.meta.env.BASE_URL}service-worker.js`,
        {
          scope: import.meta.env.BASE_URL
        }
      );

      const readyRegistration = await navigator.serviceWorker.ready;
      const worker = readyRegistration.active ?? registration.active;
      const urlsToCache = [window.location.href, ...getSameOriginAppResources()];

      worker?.postMessage({
        type: 'CACHE_URLS',
        urls: urlsToCache
      });
    } catch {
      // Offline support is a progressive enhancement.
    }
  });
}

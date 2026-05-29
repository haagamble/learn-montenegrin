const CACHE_NAME = 'montenegrin-phrase-trainer-v1';
const APP_SHELL = ['.', 'index.html', 'manifest.webmanifest', 'icons/icon.svg'];

function appUrl(path) {
  return new URL(path, self.registration.scope).toString();
}

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(APP_SHELL.map(appUrl));
}

async function trimOldCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((cacheName) => cacheName !== CACHE_NAME)
      .map((cacheName) => caches.delete(cacheName))
  );
}

async function cacheUrls(urls) {
  const cache = await caches.open(CACHE_NAME);
  const requests = urls
    .map((url) => new URL(url, self.registration.scope))
    .filter((url) => url.origin === self.location.origin)
    .map((url) => new Request(url, { credentials: 'same-origin' }));

  await Promise.all(
    requests.map(async (request) => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response);
        }
      } catch {
        // A resource that fails to cache should not break offline setup.
      }
    })
  );
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(cacheAppShell());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await trimOldCaches();
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'CACHE_URLS' && Array.isArray(event.data.urls)) {
    event.waitUntil(cacheUrls(event.data.urls));
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(appUrl('.'), responseClone));
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match(appUrl('.'))) ?? cache.match(appUrl('index.html'));
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }

        return response;
      });
    })
  );
});

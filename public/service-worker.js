/* eslint-disable no-restricted-globals */

const CACHE_NAME = "telemed-cache-v2";
const CORE_FILES = [
  "/offline-telemedicine-pwa/",
  "/offline-telemedicine-pwa/index.html",
  "/offline-telemedicine-pwa/manifest.json",
  "/offline-telemedicine-pwa/favicon.ico"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return Promise.resolve();
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const responseCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put("/offline-telemedicine-pwa/index.html", responseCopy);
          });
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          return (
            cachedResponse ||
            caches.match("/offline-telemedicine-pwa/index.html")
          );
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) =>
          caches.open(CACHE_NAME).then((cache) => {
            if (event.request.url.startsWith(self.location.origin)) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
        )
        .catch(() => caches.match("/offline-telemedicine-pwa/index.html"));
    })
  );
});

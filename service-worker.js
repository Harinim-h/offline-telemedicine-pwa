/* eslint-disable no-restricted-globals */

const CACHE_NAME = "telemed-cache-v1";
const CORE_FILES = [
  "/offline-telemedicine-pwa/",
  "/offline-telemedicine-pwa/index.html",
  "/offline-telemedicine-pwa/manifest.json",
  "/offline-telemedicine-pwa/favicon.ico"
];

// Install SW & cache core files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Caching core files...");
      return cache.addAll(CORE_FILES);
    })
  );
  self.skipWaiting();
});

// Activate SW
self.addEventListener("activate", event => {
  console.log("Service Worker Activated");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch handler – cache first, then network, then fallback
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;

      // Try network and cache dynamically
      return fetch(event.request)
        .then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            // Only cache same-origin requests
            if (event.request.url.startsWith(self.location.origin)) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        })
        .catch(() => {
          // Fallback to core files if network fails
          return caches.match("/offline-telemedicine-pwa/index.html");
        });
    })
  );
});

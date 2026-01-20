/* eslint-disable no-restricted-globals */
const CACHE_NAME = "telemed-cache-v1";

// Core files to cache for offline
const urlsToCache = [
  "/offline-telemedicine-pwa/",
  "/offline-telemedicine-pwa/index.html",
  "/offline-telemedicine-pwa/manifest.json",
  "/offline-telemedicine-pwa/favicon.ico",
  "/offline-telemedicine-pwa/static/css/main.css", // optional
  "/offline-telemedicine-pwa/static/js/bundle.js"   // optional
];

// Install SW & cache core files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Caching core files for offline...");
      return cache.addAll(urlsToCache);
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
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch handler – cache-first strategy
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request)
          .then(fetchRes => {
            return caches.open(CACHE_NAME).then(cache => {
              // Cache only same-origin requests
              if (event.request.url.startsWith(self.location.origin)) {
                cache.put(event.request, fetchRes.clone());
              }
              return fetchRes;
            });
          })
          .catch(() => {
            // Optional: fallback to index.html
            return caches.match("/offline-telemedicine-pwa/index.html");
          })
      );
    })
  );
});

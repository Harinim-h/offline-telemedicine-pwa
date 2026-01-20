/* eslint-disable no-restricted-globals */

// Name of the cache
const CACHE_NAME = "telemed-cache-v1";

// Files to cache for offline
const urlsToCache = [
  `${process.env.PUBLIC_URL}/`,
  `${process.env.PUBLIC_URL}/index.html`,
  `${process.env.PUBLIC_URL}/favicon.ico`,
  `${process.env.PUBLIC_URL}/manifest.json`,
  // Main JS & CSS bundles (CRA generates hashed files)
  // We will cache all JS and CSS in static folder dynamically
];

// Install Service Worker & cache essential files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Caching essential files...");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activate SW immediately
});

// Activate SW and clean old caches if any
self.addEventListener("activate", event => {
  console.log("Service Worker Activated");
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of uncontrolled clients
});

// Fetch handler – respond from cache first, fallback to network
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response; // Return cached response
      }
      // Fetch from network and cache dynamically
      return fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          // Cache only GET requests for same origin
          if (event.request.url.startsWith(self.location.origin) && event.request.method === "GET") {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      });
    }).catch(() => {
      // Optional: fallback offline page
      return caches.match(`${process.env.PUBLIC_URL}/index.html`);
    })
  );
});

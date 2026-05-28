// Service worker for PWA offline support
const CACHE_NAME = "md-converter-v1";
const STATIC_ASSETS = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Return cached if available, otherwise fetch from network
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            // Cache successful responses for static assets
            if (response.status === 200 && event.request.url.startsWith(self.location.origin)) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                // Only cache if not already in cache to avoid bloat
                caches.match(event.request).then((existing) => {
                  if (!existing) {
                    cache.put(event.request, clone);
                  }
                });
              });
            }
            return response;
          })
          .catch(() => {
            // Offline fallback — return cached page for navigation
            if (event.request.mode === "navigate") {
              return caches.match("/");
            }
            return new Response("Offline", { status: 503 });
          })
      );
    }),
  );
});
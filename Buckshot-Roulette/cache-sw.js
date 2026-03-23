const CACHE_NAME = "game-cache-v1";
const ASSETS_TO_CACHE = [
  "/gameSite/assets/games/Buckshot-Roulette/index.html",
  "/gameSite/assets/games/Buckshot-Roulette/index.js",
  "/gameSite/assets/games/Buckshot-Roulette/index.pck",
  "/gameSite/assets/games/Buckshot-Roulette/index.wasm",
  "/gameSite/assets/games/Buckshot-Roulette/index.png",
  "/gameSite/assets/games/Buckshot-Roulette/index.audio.position.worklet.js",
  "/gameSite/assets/games/Buckshot-Roulette/index.audio.worklet.js",
];

self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("Caching assets...");
        return Promise.all(ASSETS_TO_CACHE.map((url) => {
          return fetch(url).then((response) => {
            if (response.ok) {
              return cache.put(url, response);
            } else {
              console.warn("Failed to fetch:", url);
            }
          }).catch((err) => {
            console.error("Network error fetching", url, err);
          });
        }));
      })
      .then(() => {
        console.log("Assets cached successfully.");
      })
      .catch((error) => {
        console.error("Error caching assets:", error);
      })
  );
  self.skipWaiting();
});


self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  console.log("Service Worker: Activated");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then(async (response) => {
        if (
          response.headers
            .get("Content-Type")
            .includes("application/octet-stream")
        ) {
          const blob = await response.blob();
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, new Response(blob));
          console.log("blob fetch intercepted by sw");
          return new Response(blob);
        }
        const cache_1 = await caches.open(CACHE_NAME);
        cache_1.put(event.request, response.clone());
        console.log("non-blob fetch intercepted by sw");
        return response;
      })
      .catch((error) => {
        console.error("Service Worker: Fetch failed", error);
      }),
  );
});

// Service Worker for TOEIC Vocabulary Tracker (toeic-app-Vorb)
// This SW only caches Vocabulary Tracker assets.
// It does NOT cache Grammar / PoS App files.

// Advance CACHE_NAME only when a deployed asset or production seed changes.
const CACHE_NAME = "toeic-vorb-v46";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./tracker.html",
  "./clear-sw.html",
  "./manifest.json",
  "./css/base.css",
  "./css/tracker.css",
  "./js/vocab-db.js",
  "./js/vocab-scoring.js",
  "./js/google-drive-sync-config.js",
  "./js/google-drive-sync-data.js",
  "./js/google-drive-sync-client.js",
  "./js/state.js",
  "./js/vocab-tracker.js",
  "./js/views/today.js",
  "./js/views/roadmap.js",
  "./js/views/lesson.js",
  "./js/views/mistakes.js",
  "./js/views/export.js",
  "./js/views/bank.js",
  "./js/views/settings.js",
  "./js/views/mastery.js",
  "./data/vocab/curriculum.json",
  "./data/vocab/vocab_items.json",
  "./data/vocab/grammar_links.json",
  "./data/vocab/questions_v0.json",
  "./data/vocab/questions_v1a.json",
  "./data/vocab/questions_v1b.json",
  "./data/vocab/questions_v1c.json",
  "./data/vocab/questions_v1d.json",
  "./data/vocab/questions_v1e.json",
  "./data/vocab/questions_v1f.json",
  "./data/vocab/questions_v2a.json",
  "./data/vocab/questions_v2b.json",
  "./data/vocab/questions_v2c.json",
  "./data/vocab/questions_v2d.json",
  "./data/vocab/questions_v2e.json",
  "./data/vocab/questions_v3a.json",
  "./data/vocab/questions_v3b.json",
  "./data/vocab/questions_v3c.json",
  "./data/vocab/questions_v3d.json",
  "./data/vocab/questions_v3e.json",
  "./data/vocab/questions_v3f.json",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

function isVocabDataRequest(requestUrl) {
  return requestUrl.origin === self.location.origin
    && /\/data\/vocab\/.+\.json$/i.test(requestUrl.pathname);
}

function fetchAndCache(request) {
  return caches.open(CACHE_NAME).then((cache) =>
    fetch(request).then((response) => {
      if (response && response.status === 200 && response.type === "basic") {
        cache.put(request, response.clone());
      }
      return response;
    })
  );
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) return;

  if (isVocabDataRequest(requestUrl)) {
    // Network-first for live vocab data reduces stale curriculum/question payloads when online.
    event.respondWith(
      fetchAndCache(event.request).catch(() =>
        caches.match(event.request).then((cached) => cached || Response.error())
      )
    );
    return;
  }

  // Stale-while-revalidate for shell assets keeps launcher/tracker responsive.
  const cacheUpdate = fetchAndCache(event.request).catch(() => null);

  event.respondWith(
    caches.match(event.request).then((cached) => (
      cached || cacheUpdate.then((response) => response || Response.error())
    ))
  );

  // Keep SW alive until background cache update completes.
  event.waitUntil(cacheUpdate);
});

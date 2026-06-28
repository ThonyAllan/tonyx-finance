const CACHE_NAME = 'tonyx-v1';

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/styles/tokens.css',
  '/assets/styles/themes.css',
  '/assets/styles/base.css',
  '/assets/styles/components.css',
  '/assets/icons/tonyx-icon.svg',
  '/assets/icons/tonyx-wordmark.svg',
  '/assets/icons/tonyx-icon.png',
  '/assets/icons/tonyx-icon-1024.png',
  '/src/app.js',
  '/src/router/router.js',
  '/src/core/store.js',
  '/src/core/db.js',
  '/src/core/schema.js',
  '/src/core/id.js',
  '/src/core/money.js',
  '/src/core/dates.js',
  '/src/core/events.js',
  '/src/models/categories.js',
  '/src/models/incomes.js',
  '/src/models/expenses.js',
  '/src/components/tabbar.js',
  '/src/components/modal.js',
  '/src/views/dashboard.js',
  '/src/views/incomes.js',
  '/src/views/expenses.js',
  '/src/views/settings.js',
  '/src/services/analytics.js',
  '/src/services/backup.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first strategy for app shell; network-first for everything else
self.addEventListener('fetch', event => {
  // Only handle same-origin GET requests
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

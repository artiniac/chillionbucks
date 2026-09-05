/* Chillion Bucks service worker: exists so the site can be installed and appear in a phone's Share sheet (Android).
   It stores nothing and passes every request straight to the network. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});

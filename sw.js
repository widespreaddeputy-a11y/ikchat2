// IKChat Service Worker - оффлайн + push
const CACHE = 'ikchat-v1';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(()=> self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=> self.clients.claim()));
});
self.addEventListener('fetch', e => {
  // Network first, fallback to cache (для чатов)
  e.respondWith(fetch(e.request).catch(()=> caches.match(e.request).then(r=> r || caches.match('/index.html'))));
});
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'IKChat', body: 'Новое сообщение' };
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200,100,200],
    data: { url: '/' }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || '/'));
});

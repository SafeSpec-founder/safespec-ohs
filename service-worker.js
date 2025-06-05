// This service worker is managed by Workbox via the VitePWA plugin
// It will be replaced during the build process
// This file serves as a placeholder for development

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Offline fallback
const FALLBACK_HTML_URL = '/offline.html';
const CACHED_FILES = [
  FALLBACK_HTML_URL,
  '/index.html',
  '/favicon.ico',
  '/manifest.json'
];

// Cache core assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('core-cache').then((cache) => {
      return cache.addAll(CACHED_FILES);
    })
  );
});

// Network-first strategy with fallback for navigation requests
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(FALLBACK_HTML_URL);
        })
    );
    return;
  }

  // For all other requests, try network first, then cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open('dynamic-cache').then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Handle background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-incidents') {
    event.waitUntil(syncIncidents());
  } else if (event.tag === 'sync-documents') {
    event.waitUntil(syncDocuments());
  } else if (event.tag === 'sync-inspections') {
    event.waitUntil(syncInspections());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/badge-72x72.png',
    data: {
      url: data.url
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Open the app when notification is clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.matchAll({type: 'window'}).then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});

// Sync functions (placeholders to be implemented)
async function syncIncidents() {
  // Implementation will be added during build
}

async function syncDocuments() {
  // Implementation will be added during build
}

async function syncInspections() {
  // Implementation will be added during build
}

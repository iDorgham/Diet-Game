// Service Worker for PWA support following Level 404 requirements
// Advanced caching strategies and offline functionality

const CACHE_NAME = 'nutriquest-v1.0.0';
const STATIC_CACHE = 'nutriquest-static-v1.0.0';
const DYNAMIC_CACHE = 'nutriquest-dynamic-v1.0.0';
const API_CACHE = 'nutriquest-api-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  // Add other critical assets
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/health',
  '/api/user/profile',
  '/api/user/progress',
  '/api/tasks/daily',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
  } else if (url.pathname.startsWith('/static/')) {
    event.respondWith(handleStaticRequest(request));
  } else {
    event.respondWith(handlePageRequest(request));
  }
});

// API request handling with network-first strategy
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed for API request, trying cache:', url.pathname);
    
    // Fall back to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for critical endpoints
    if (API_ENDPOINTS.includes(url.pathname)) {
      return new Response(
        JSON.stringify({ 
          error: 'Offline', 
          message: 'This data is not available offline' 
        }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
  }
}

// Static asset handling with cache-first strategy
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Failed to fetch static asset:', request.url);
    throw error;
  }
}

// Page request handling with network-first strategy
async function handlePageRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed for page request, trying cache:', request.url);
    
    // Fall back to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fall back to index.html for SPA routing
    if (request.mode === 'navigate') {
      const indexResponse = await caches.match('/');
      if (indexResponse) {
        return indexResponse;
      }
    }
    
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'nutriquest-sync') {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncOfflineActions() {
  try {
    // Get offline actions from IndexedDB or localStorage
    const offlineActions = await getOfflineActions();
    
    for (const action of offlineActions) {
      try {
        await syncAction(action);
        await removeOfflineAction(action.id);
      } catch (error) {
        console.error('Failed to sync action:', action, error);
      }
    }
    
    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from NutriQuest',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.ico'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('NutriQuest', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions
async function getOfflineActions() {
  // In a real implementation, this would read from IndexedDB
  return [];
}

async function syncAction(action) {
  // In a real implementation, this would sync with the server
  console.log('Syncing action:', action);
}

async function removeOfflineAction(actionId) {
  // In a real implementation, this would remove from IndexedDB
  console.log('Removing synced action:', actionId);
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('Service Worker: Loaded successfully');

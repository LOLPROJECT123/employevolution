const CACHE_NAME = 'streamline-v1.0.0';
const STATIC_CACHE_NAME = 'streamline-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'streamline-dynamic-v1.0.0';

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/jobs',
  '/profile',
  '/manifest.json',
  '/favicon.ico'
];

// API endpoints to cache for offline access
const CACHEABLE_APIS = [
  '/api/jobs',
  '/api/saved-jobs',
  '/api/applications',
  '/api/profile'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with appropriate cache strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    // Static assets - cache first
    if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
      event.respondWith(cacheFirst(request));
    }
    // API requests - network first with cache fallback
    else if (CACHEABLE_APIS.some(api => url.pathname.startsWith(api))) {
      event.respondWith(networkFirstWithCache(request));
    }
    // Other resources - stale while revalidate
    else {
      event.respondWith(staleWhileRevalidate(request));
    }
  }
});

// Cache strategies implementation
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Cache first failed:', error);
    return new Response('Offline content not available', { status: 503 });
  }
}

async function networkFirstWithCache(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network first failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response(JSON.stringify({ 
      error: 'Offline', 
      message: 'This content is not available offline' 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function staleWhileRevalidate(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    const networkResponsePromise = fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    });
    
    return cachedResponse || await networkResponsePromise;
  } catch (error) {
    console.log('Stale while revalidate failed:', error);
    return new Response('Content not available', { status: 503 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync-job-applications') {
    event.waitUntil(syncJobApplications());
  } else if (event.tag === 'background-sync-saved-jobs') {
    event.waitUntil(syncSavedJobs());
  }
});

async function syncJobApplications() {
  try {
    // Get pending applications from IndexedDB and sync them
    console.log('Syncing pending job applications');
    // Implementation would depend on your offline storage strategy
  } catch (error) {
    console.error('Failed to sync job applications:', error);
  }
}

async function syncSavedJobs() {
  try {
    // Get pending saved jobs from IndexedDB and sync them
    console.log('Syncing pending saved jobs');
    // Implementation would depend on your offline storage strategy
  } catch (error) {
    console.error('Failed to sync saved jobs:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New job matches available!',
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
        title: 'View Jobs',
        icon: '/lovable-uploads/job-icon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/lovable-uploads/close-icon.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Streamline Job Search', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/jobs')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

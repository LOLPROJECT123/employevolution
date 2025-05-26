
const CACHE_NAME = 'emploevolution-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';
const API_CACHE = 'api-v2';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.tsx',
  '/src/index.css',
  '/offline.html'
];

// API endpoints to cache
const API_CACHE_ENDPOINTS = [
  '/api/jobs',
  '/api/profile',
  '/api/applications'
];

// Install service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(urlsToCache)),
      caches.open(DYNAMIC_CACHE),
      caches.open(API_CACHE)
    ]).then(() => {
      console.log('Service Worker installed successfully');
      return self.skipWaiting();
    })
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheName.includes('v2')) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event with sophisticated caching strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    if (url.pathname.startsWith('/api/')) {
      // API requests - Network First with cache fallback
      event.respondWith(networkFirstStrategy(request));
    } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/)) {
      // Static assets - Cache First
      event.respondWith(cacheFirstStrategy(request));
    } else {
      // HTML pages - Stale While Revalidate
      event.respondWith(staleWhileRevalidateStrategy(request));
    }
  }
});

// Network First Strategy (for API calls)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request.url, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(
      JSON.stringify({ error: 'Offline - data not available' }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache First Strategy (for static assets)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request.url, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.log('Failed to fetch static asset:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate Strategy (for HTML pages)
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request.url, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // If network fails and we have no cache, return offline page
    if (!cachedResponse) {
      return caches.match('/offline.html');
    }
  });
  
  return cachedResponse || await fetchPromise;
}

// Background sync for job applications
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-job-applications') {
    event.waitUntil(syncJobApplications());
  }
});

async function syncJobApplications() {
  try {
    const applications = await getStoredApplications();
    
    for (const application of applications) {
      try {
        await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(application)
        });
        
        await removeStoredApplication(application.id);
      } catch (error) {
        console.log('Failed to sync application:', error);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'Emploevolution',
    body: 'New job opportunity available!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View Jobs',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/close.png'
      }
    ],
    requireInteraction: true
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.log('Failed to parse push data:', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const action = event.action;
  
  if (action === 'view') {
    event.waitUntil(
      clients.openWindow('/jobs')
    );
  } else if (action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync for job alerts
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'job-alerts') {
    event.waitUntil(checkJobAlerts());
  }
});

async function checkJobAlerts() {
  try {
    const response = await fetch('/api/job-alerts/check');
    const alerts = await response.json();
    
    for (const alert of alerts) {
      await self.registration.showNotification('New Job Alert', {
        body: `${alert.count} new jobs found for "${alert.query}"`,
        icon: '/favicon.ico',
        data: { alertId: alert.id }
      });
    }
  } catch (error) {
    console.log('Failed to check job alerts:', error);
  }
}

// Utility functions for IndexedDB operations
async function getStoredApplications() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('JobApplications', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['applications'], 'readonly');
      const store = transaction.objectStore('applications');
      const getAll = store.getAll();
      
      getAll.onsuccess = () => resolve(getAll.result);
      getAll.onerror = () => reject(getAll.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}

async function removeStoredApplication(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('JobApplications', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['applications'], 'readwrite');
      const store = transaction.objectStore('applications');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}

console.log('Service Worker loaded successfully');

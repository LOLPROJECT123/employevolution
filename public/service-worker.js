
// Service Worker for Push Notifications and Offline Support
const CACHE_NAME = 'joblift-cache-v1';
const OFFLINE_URL = '/offline.html';

// URLs to cache for offline access
const urlsToCache = [
  '/',
  '/offline.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/media/logo.png'
];

// Install event - cache important files for offline use
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker', event);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker', event);
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Removing old cache', cacheName);
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

// Fetch event - handle offline requests
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // For API requests, try network first, then fall back to offline response
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // For GET requests, try cache first, then network (cache-first strategy)
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached response and update cache in the background
            fetchAndUpdateCache(request);
            return cachedResponse;
          }
          
          // If not in cache, try to fetch from network
          return fetchAndCache(request);
        })
        .catch(() => {
          // If both cache and network fail, serve offline page
          return caches.match(OFFLINE_URL);
        })
    );
  }
});

// Function to fetch resource and update cache
function fetchAndUpdateCache(request) {
  // Fetch from network and update cache in the background
  fetch(request)
    .then((response) => {
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return;
      }

      caches.open(CACHE_NAME)
        .then((cache) => {
          cache.put(request, response.clone());
        });
    })
    .catch((error) => {
      console.error('[Service Worker] Failed to update cache', error);
    });
}

// Function to fetch resource and cache it if successful
function fetchAndCache(request) {
  return fetch(request)
    .then((response) => {
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }

      // Clone the response before caching it
      const responseToCache = response.clone();
      caches.open(CACHE_NAME)
        .then((cache) => {
          cache.put(request, responseToCache);
        });

      return response;
    })
    .catch((error) => {
      console.error('[Service Worker] Network fetch failed:', error);
      return caches.match(OFFLINE_URL);
    });
}

// Push notification event handler
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received:', event);
  
  let notificationData = {};
  
  try {
    if (event.data) {
      notificationData = event.data.json();
    }
  } catch (e) {
    console.error('[Service Worker] Error parsing push data', e);
  }

  // Default notification options
  const title = notificationData.title || 'JobLift Notification';
  const options = {
    body: notificationData.body || 'New notification from JobLift',
    icon: notificationData.icon || '/favicon.ico',
    badge: notificationData.badge || '/favicon.ico',
    data: notificationData.data || {},
    actions: notificationData.actions || [],
    tag: notificationData.tag || 'default',
    renotify: notificationData.renotify || false,
    requireInteraction: notificationData.requireInteraction || false
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click:', event);
  
  event.notification.close();
  
  // Handle notification click - open URL or focus window
  const notificationData = event.notification.data || {};
  const urlToOpen = notificationData.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Check if there is already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If no matching client, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Sync event for background synchronization
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync:', event);
  
  if (event.tag === 'sync-pending-actions') {
    event.waitUntil(syncPendingActions());
  }
});

// Function to sync pending actions
async function syncPendingActions() {
  try {
    // Retrieve pending actions from IndexedDB
    const pendingActions = await getPendingActionsFromDB();
    
    if (pendingActions.length === 0) {
      console.log('[Service Worker] No pending actions to sync');
      return;
    }
    
    console.log(`[Service Worker] Syncing ${pendingActions.length} pending actions`);
    
    // Process each pending action
    const results = await Promise.allSettled(
      pendingActions.map(async (action) => {
        try {
          // Mark action as syncing
          await updateActionStatus(action.id, 'syncing');
          
          // Perform the sync operation based on action type
          await performSyncOperation(action);
          
          // Mark as completed
          await updateActionStatus(action.id, 'completed');
          
          return { id: action.id, success: true };
        } catch (error) {
          console.error(`[Service Worker] Failed to sync action ${action.id}:`, error);
          
          // Update retry count and status
          const updatedAction = {
            ...action,
            retries: action.retries + 1,
            status: action.retries >= 2 ? 'failed' : 'pending'
          };
          
          await updateActionInDB(updatedAction);
          
          return { id: action.id, success: false, error };
        }
      })
    );
    
    // Remove completed actions
    const completedActionIds = results
      .filter(result => result.status === 'fulfilled' && result.value.success)
      .map(result => result.value.id);
    
    if (completedActionIds.length > 0) {
      await removeCompletedActions(completedActionIds);
    }
    
    // Broadcast sync completion to all clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'sync-completed',
        completedCount: completedActionIds.length,
        remainingCount: pendingActions.length - completedActionIds.length
      });
    });
    
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

// These functions would be implemented to work with IndexedDB
// For now, they are placeholders as IndexedDB operations are complex
async function getPendingActionsFromDB() {
  return []; // In real implementation, would fetch from IndexedDB
}

async function updateActionStatus(id, status) {
  // In real implementation, would update in IndexedDB
}

async function updateActionInDB(action) {
  // In real implementation, would update in IndexedDB
}

async function removeCompletedActions(ids) {
  // In real implementation, would remove from IndexedDB
}

async function performSyncOperation(action) {
  // In real implementation, would perform API calls based on action type
}

// Log service worker registration
console.log('[Service Worker] Service Worker registered');

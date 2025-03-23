// frontend/public/service-worker.js
/* eslint-disable no-restricted-globals */

// Version of the cache
const CACHE_NAME = 'notetime-cache-v1';

// Assets to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// API routes to cache
const API_CACHE_NAME = 'notetime-api-cache-v1';
const apiUrls = [
  '/api/notes',
  '/api/health'
];

// Install event - cache the static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to cache assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, API_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    if (request.method === 'GET') {
      // For GET requests, try the network first, then cache
      event.respondWith(
        fetch(request)
          .then((response) => {
            // Cache the response for future
            const responseToCache = response.clone();
            caches.open(API_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
            return response;
          })
          .catch(() => {
            // If network fails, try to serve from cache
            return caches.match(request);
          })
      );
    } else {
      // For non-GET API requests, try network and queue if offline
      event.respondWith(
        fetch(request)
          .catch(() => {
            // If offline, return a custom response
            return new Response(
              JSON.stringify({ 
                error: 'You are currently offline. This action will be synced when you are back online.' 
              }),
              { 
                headers: { 'Content-Type': 'application/json' },
                status: 503
              }
            );
          })
      );
    }
  } else {
    // For static assets, try cache first, then network
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          // Clone the request because it's a one-time use stream
          return fetch(request.clone())
            .then((response) => {
              // Check if we received a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Clone the response because it's a one-time use stream
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
                
              return response;
            });
        })
    );
  }
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
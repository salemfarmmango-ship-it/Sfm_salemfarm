// This runs in the background and handles push notifications even when the site is closed
// Also acts as the PWA service worker for installability

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install Event');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate Event');
    return self.clients.claim();
});

// PWA requirement: A fetch event handler is required for installability
self.addEventListener('fetch', (event) => {
    // Basic pass-through fetch handler
    event.respondWith(fetch(event.request));
});

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
// Note: These values must match your Firebase project configuration
firebase.initializeApp({
    apiKey: 'AIzaSyCJfOZb893RY9xM8AlKfZ4ErvlN1u3UWWo',
    authDomain: 'sfmo-5be58.firebaseapp.com',
    projectId: 'sfmo-5be58',
    storageBucket: 'sfmo-5be58.firebasestorage.app',
    messagingSenderId: '133122772580',
    appId: '1:133122772580:web:cf8168d8e9a6d3d612d971',
});

const messaging = firebase.messaging();

// Handle background messages (when site/browser is closed)
messaging.onBackgroundMessage((payload) => {
    console.log('[Service Worker] Background message received:', payload);

    const notificationTitle = payload.notification?.title || 'Salem Farm Mango';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: '/logo.png',
        badge: '/favicon.ico',
        tag: payload.data?.tag || 'default',
        data: payload.data,
        // Vibration pattern for mobile
        vibrate: [100, 50, 100],
        // Actions the user can take
        actions: [
            {
                action: 'open',
                title: 'Open',
            },
            {
                action: 'close',
                title: 'Dismiss',
            },
        ],
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked:', event);

    event.notification.close();

    // Get the URL to open from notification data or use default
    const urlToOpen = event.notification.data?.url || '/';

    // Handle action button clicks
    if (event.action === 'close') {
        return;
    }

    // Open the app/URL when notification is clicked
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If a window is already open, focus it
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise, open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Handle push events directly (fallback)
self.addEventListener('push', (event) => {
    if (event.data) {
        try {
            const data = event.data.json();
            console.log('[Service Worker] Push event:', data);
        } catch (e) {
            console.log('[Service Worker] Push event data:', event.data.text());
        }
    }
});

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

// Firebase configuration - Replace with your Firebase project credentials
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (only on client side)
let app: FirebaseApp | undefined;
let messaging: Messaging | undefined;

export function getFirebaseApp(): FirebaseApp | undefined {
    if (typeof window === 'undefined') return undefined;

    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApps()[0];
    }
    return app;
}

export function getFirebaseMessaging(): Messaging | undefined {
    if (typeof window === 'undefined') return undefined;

    // Check if browser supports notifications
    if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return undefined;
    }

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
        console.warn('Service workers are not supported');
        return undefined;
    }

    const app = getFirebaseApp();
    if (!app) return undefined;

    if (!messaging) {
        try {
            messaging = getMessaging(app);
        } catch (error) {
            console.error('Error initializing Firebase Messaging:', error);
            return undefined;
        }
    }
    return messaging;
}

// Request notification permission and get FCM token
export async function requestNotificationPermission(): Promise<string | null> {
    try {
        console.log('Requesting notification permission...');
        const permission = await Notification.requestPermission();
        console.log('Notification permission status:', permission);

        if (permission !== 'granted') {
            console.warn('Notification permission denied by user');
            return null;
        }

        const messagingInstance = getFirebaseMessaging();
        if (!messagingInstance) {
            console.error('Failed to get Firebase Messaging instance');
            return null;
        }

        // Register service worker if not already running
        console.log('Checking service worker registration...');
        let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');

        if (!registration) {
            console.log('Registering new service worker...');
            await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            registration = await navigator.serviceWorker.ready;
        }
        console.log('Service worker ready');

        // Get FCM token
        console.log('Fetching FCM token...');
        const token = await getToken(messagingInstance, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration,
        });

        console.log('FCM Token successfully retrieved:', token);
        return token;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return null;
    }
}

// Listen for foreground messages
export function onForegroundMessage(callback: (payload: any) => void): (() => void) | undefined {
    const messagingInstance = getFirebaseMessaging();
    if (!messagingInstance) return undefined;

    return onMessage(messagingInstance, (payload) => {
        console.log('Foreground message received:', payload);
        callback(payload);
    });
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { requestNotificationPermission, onForegroundMessage } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export type NotificationStatus = 'default' | 'granted' | 'denied' | 'unsupported';

interface UseNotificationsReturn {
    status: NotificationStatus;
    isSupported: boolean;
    isLoading: boolean;
    token: string | null;
    subscribe: () => Promise<boolean>;
    showPrompt: boolean;
    dismissPrompt: () => void;
}

const PROMPT_DISMISSED_KEY = 'sfm_notification_prompt_dismissed';
const PROMPT_DELAY_MS = 5000; // Show prompt after 5 seconds

export function useNotifications(): UseNotificationsReturn {
    const { user } = useAuth();
    const [status, setStatus] = useState<NotificationStatus>('default');
    const [isSupported, setIsSupported] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    // Check browser support and current permission status
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const checkSupport = () => {
            const supported = 'Notification' in window && 'serviceWorker' in navigator;
            console.log('Notification support checked:', {
                supported,
                permission: supported ? Notification.permission : 'unavailable'
            });
            setIsSupported(supported);

            if (supported) {
                setStatus(Notification.permission as NotificationStatus);
            } else {
                setStatus('unsupported');
            }
        };

        checkSupport();
    }, []);

    // Show prompt after delay if not already granted/denied
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!isSupported) return;
        if (status !== 'default') return;

        // Check if user has dismissed the prompt before
        let dismissed = null;
        try {
            dismissed = localStorage.getItem(PROMPT_DISMISSED_KEY);
        } catch (e) {
            console.warn('LocalStorage access denied for notification prompt', e);
        }

        console.log('Checking prompt display conditions:', { isSupported, status, dismissed });
        if (dismissed) return;

        const timer = setTimeout(() => {
            console.log('Displaying notification prompt after delay');
            setShowPrompt(true);
        }, PROMPT_DELAY_MS);

        return () => clearTimeout(timer);
    }, [isSupported, status]);

    // Listen for foreground messages
    useEffect(() => {
        if (status !== 'granted') return;

        const unsubscribe = onForegroundMessage((payload) => {
            // Show a toast notification for foreground messages
            if (payload.notification) {
                const { title, body } = payload.notification;

                // Create a custom toast notification
                if ('Notification' in window && Notification.permission === 'granted') {
                    try {
                        new Notification(title || 'Salem Farm Mango', {
                            body: body || 'You have a new notification',
                            icon: 'https://img.salemfarmmango.com/uploads/SFMLOGO.png',
                        });
                    } catch (e) {
                        console.error('Error showing notification', e);
                    }
                }
            }
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [status]);

    // Re-sync token when user changes
    useEffect(() => {
        if (token && user?.id) {
            saveTokenToDatabase(token, user.id).catch(err => 
                console.error('Failed to re-sync notification token on user change:', err)
            );
        }
    }, [token, user?.id]);

    // Subscribe to push notifications
    const subscribe = useCallback(async (): Promise<boolean> => {
        if (!isSupported) {
            console.warn('Notifications not supported');
            return false;
        }

        setIsLoading(true);

        try {
            const fcmToken = await requestNotificationPermission();

            if (fcmToken) {
                setToken(fcmToken);
                setStatus('granted');
                setShowPrompt(false);

                // Save token to DB with user ID if available
                saveTokenToDatabase(fcmToken, user?.id).catch(err =>
                    console.error('Background token save failed:', err)
                );

                return true;
            } else {
                if ('Notification' in window) {
                    setStatus(Notification.permission as NotificationStatus);
                }
                return false;
            }
        } catch (error) {
            console.error('Error subscribing to notifications:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isSupported, user?.id]);

    // Dismiss the prompt
    const dismissPrompt = useCallback(() => {
        setShowPrompt(false);
        try {
            localStorage.setItem(PROMPT_DISMISSED_KEY, 'true');
        } catch (e) {
            console.warn('Failed to save prompt dismissal', e);
        }
    }, []);

    return {
        status,
        isSupported,
        isLoading,
        token,
        subscribe,
        showPrompt,
        dismissPrompt,
    };
}

// Save FCM token to MySQL
async function saveTokenToDatabase(token: string, userId?: string): Promise<void> {
    try {
        // Get device info
        const deviceInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            timestamp: new Date().toISOString(),
        };

        // Call our API to save the token
        const response = await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token,
                deviceInfo,
                userId
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to save notification token');
        }

        console.log('FCM token saved to database');
    } catch (error) {
        console.error('Error saving token to database:', error);
    }
}

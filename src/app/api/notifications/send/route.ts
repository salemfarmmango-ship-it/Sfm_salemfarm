import { NextRequest, NextResponse } from 'next/server';
import { adminMessaging } from '@/lib/firebase-admin';

interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    url?: string;
    tag?: string;
}

interface SendRequest {
    // Send to specific tokens
    tokens?: string[];
    // Send to specific user IDs
    userIds?: string[];
    // Send to all subscribed users
    broadcast?: boolean;
    // Notification content
    notification: NotificationPayload;
    // Additional data
    data?: Record<string, string>;
}

export async function POST(request: NextRequest) {
    try {
        const body: SendRequest = await request.json();
        const { tokens, userIds, broadcast, notification, data } = body;

        const messaging = adminMessaging;
        if (!messaging) {
            console.error('Firebase Admin Messaging not initialized');
            return NextResponse.json(
                { error: 'Push service unavailable' },
                { status: 503 }
            );
        }

        if (!notification?.title || !notification?.body) {
            return NextResponse.json(
                { error: 'Notification title and body are required' },
                { status: 400 }
            );
        }

        // Collect target tokens
        let targetTokens: string[] = [];

        if (tokens && tokens.length > 0) {
            targetTokens = tokens;
        } else {
            // Fetch tokens from PHP backend instead of Supabase
            let url = 'http://salemfarmmango.com/api/notifications.php?action=list';
            if (userIds && userIds.length > 0) {
                url += `&userIds=${userIds.join(',')}`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const results = await response.json();
                // results is expected to be { count: X, subscriptions: [...] } based on what list might return
                // OR we just assume notifications.php handles listing if we added it.
                // For now, let's assume we need to add a list action or just fetch all.
                targetTokens = (results.subscriptions || []).map((t: any) => t.token);
            }
        }

        if (targetTokens.length === 0) {
            return NextResponse.json(
                { error: 'No notification tokens found' },
                { status: 404 }
            );
        }

        // Send notifications using Firebase Admin SDK (FCM v1)
        const message = {
            notification: {
                title: notification.title,
                body: notification.body,
            },
            data: {
                ...data,
                url: notification.url || '/',
                tag: notification.tag || 'default',
            },
            webpush: {
                notification: {
                    icon: notification.icon || 'https://img.salemfarmmango.com/uploads/SFMLOGO.png',
                    badge: '/favicon.ico',
                    click_action: notification.url || '/',
                },
                fcm_options: {
                    link: notification.url || '/',
                }
            },
        };

        let successful = 0;
        let failed = 0;
        const failedTokens: string[] = [];

        const responseSettled = await Promise.allSettled(
            targetTokens.map(async (token) => {
                try {
                    await messaging.send({
                        ...message,
                        token: token,
                    });
                    successful++;
                } catch (error: any) {
                    failed++;
                    if (error.code === 'messaging/registration-token-not-registered' ||
                        error.code === 'messaging/invalid-registration-token') {
                        failedTokens.push(token);
                    }
                    throw error;
                }
            })
        );

        // Clean up invalid tokens via PHP backend
        if (failedTokens.length > 0) {
            await fetch('http://salemfarmmango.com/api/notifications.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tokens: failedTokens })
            });
        }

        return NextResponse.json({
            success: true,
            message: `Sent ${successful} notifications, ${failed} failed`,
            stats: {
                total: targetTokens.length,
                successful,
                failed,
            },
        });
    } catch (error) {
        console.error('Error sending notifications:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const response = await fetch('http://salemfarmmango.com/api/notifications.php?action=list');
        const data = await response.json();

        return NextResponse.json({
            success: true,
            count: data.subscriptions?.length || 0,
            subscriptions: data.subscriptions || [],
        });
    } catch (error) {
        console.error('Error listing subscriptions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { adminMessaging } from '@/lib/firebase-admin';

// Use service role key for server-side operations
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

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
        } else if (userIds && userIds.length > 0) {
            // Get tokens for specific users
            const { data: tokenData, error } = await supabase
                .from('notification_tokens')
                .select('token')
                .in('user_id', userIds);

            if (error) {
                console.error('Error fetching user tokens:', error);
                return NextResponse.json(
                    { error: 'Failed to fetch user tokens' },
                    { status: 500 }
                );
            }

            targetTokens = tokenData?.map((t) => t.token) || [];
        } else if (broadcast) {
            // Get all tokens
            const { data: tokenData, error } = await supabase
                .from('notification_tokens')
                .select('token');

            if (error) {
                console.error('Error fetching all tokens:', error);
                return NextResponse.json(
                    { error: 'Failed to fetch tokens' },
                    { status: 500 }
                );
            }

            targetTokens = tokenData?.map((t) => t.token) || [];
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
                    icon: notification.icon || '/logo.png',
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

        // FCM dynamic batching (process in chunks of 500 if needed, here we do one by one for simplicity and token cleanup)
        // Note: For large scale, use sendEachForMulticast
        const response = await Promise.allSettled(
            targetTokens.map(async (token) => {
                try {
                    await messaging.send({
                        ...message,
                        token: token,
                    });
                    successful++;
                } catch (error: any) {
                    failed++;
                    // If token is invalid or not registered, mark for deletion
                    if (error.code === 'messaging/registration-token-not-registered' ||
                        error.code === 'messaging/invalid-registration-token') {
                        failedTokens.push(token);
                    }
                    throw error;
                }
            })
        );

        // Clean up invalid tokens from database
        if (failedTokens.length > 0) {
            await supabase
                .from('notification_tokens')
                .delete()
                .in('token', failedTokens);
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

// GET endpoint to list all subscribed devices (for admin)
export async function GET(request: NextRequest) {
    try {
        const { data, error } = await supabase
            .from('notification_tokens')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tokens:', error);
            return NextResponse.json(
                { error: 'Failed to fetch subscriptions' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            count: data?.length || 0,
            subscriptions: data,
        });
    } catch (error) {
        console.error('Error listing subscriptions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

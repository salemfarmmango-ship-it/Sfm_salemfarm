import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for server-side operations
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, deviceInfo, userId } = body;

        if (!token) {
            return NextResponse.json(
                { error: 'FCM token is required' },
                { status: 400 }
            );
        }

        // Upsert the token (update if exists, insert if new)
        const { data, error } = await supabase
            .from('notification_tokens')
            .upsert(
                {
                    token,
                    user_id: userId || null,
                    device_info: deviceInfo || {},
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: 'token',
                }
            )
            .select()
            .single();

        if (error) {
            console.error('Error saving notification token:', error);
            return NextResponse.json(
                { error: 'Failed to save notification token' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Notification token saved successfully',
            data,
        });
    } catch (error) {
        console.error('Error in notification subscribe:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET endpoint to check subscription status
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Token is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('notification_tokens')
            .select('*')
            .eq('token', token)
            .single();

        if (error) {
            return NextResponse.json({ subscribed: false });
        }

        return NextResponse.json({
            subscribed: true,
            data,
        });
    } catch (error) {
        console.error('Error checking subscription:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE endpoint to unsubscribe
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json(
                { error: 'Token is required' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('notification_tokens')
            .delete()
            .eq('token', token);

        if (error) {
            console.error('Error deleting notification token:', error);
            return NextResponse.json(
                { error: 'Failed to unsubscribe' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Unsubscribed successfully',
        });
    } catch (error) {
        console.error('Error in notification unsubscribe:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

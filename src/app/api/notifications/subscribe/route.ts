import { NextRequest, NextResponse } from 'next/server';

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

        // Forward to PHP backend
        const response = await fetch('http://127.0.0.1/SFM/backend/api/notifications.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, deviceInfo, userId })
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.error || 'Failed to save notification token' },
                { status: response.status }
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

        const response = await fetch(`http://127.0.0.1/SFM/backend/api/notifications.php?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ subscribed: false });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error checking subscription:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

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

        const response = await fetch('http://127.0.0.1/SFM/backend/api/notifications.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.error || 'Failed to unsubscribe' },
                { status: response.status }
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

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { credential } = body;

        if (!credential) {
            return NextResponse.json(
                { error: 'Google credential is required' },
                { status: 400 }
            );
        }

        // Forward to PHP backend
        const response = await fetch('http://127.0.0.1/SFM/backend/auth/google.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential })
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.error || 'Google login failed' },
                { status: response.status }
            );
        }

        // Create the response object
        const res = NextResponse.json({
            success: true,
            user: data.user,
            message: 'Login successful via Google'
        });

        // Store JWT token securely in HTTPOnly cookie
        if (data.session?.access_token) {
            res.cookies.set({
                name: 'sfm_token',
                value: data.session.access_token,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 // 1 week
            });
        }

        return res;

    } catch (error) {
        console.error('Google Auth proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Proxy to PHP backend for admin login (checks sfm.users with role='admin')
        const res = await fetch('http://salemfarmmango.com/auth/admin-login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ error: data.error || 'Invalid email or password' }, { status: res.status });
        }

        // Set admin session cookie
        const response = NextResponse.json({
            success: true,
            admin: data.admin
        });

        response.cookies.set('admin_session', data.admin.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        // Also set a JWT token so admin can use authenticated API routes
        if (data.token) {
            response.cookies.set('sfm_token', data.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7
            });
        }

        return response;

    } catch (error) {
        console.error('Admin login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

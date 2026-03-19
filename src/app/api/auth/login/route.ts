import { NextRequest, NextResponse } from 'next/server';



export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Forward to PHP backend
        const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/auth/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.error || 'Invalid credentials' }, { status: response.status });
        }

        const res = NextResponse.json({
            success: true,
            user: data.user,
            message: 'Login successful'
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
        console.error('Login proxy error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

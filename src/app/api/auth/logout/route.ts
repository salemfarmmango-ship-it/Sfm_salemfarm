import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
        
        // Clear the PHP auth cookie
        res.cookies.set({
            name: 'sfm_token',
            value: '',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 0 // Expire immediately
        });

        return res;

    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

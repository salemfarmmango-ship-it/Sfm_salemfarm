import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('sfm_token')?.value;

        if (!token) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        // Verify token with PHP backend
        const response = await fetch('http://salemfarmmango.com/auth/me.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            // Token is invalid or expired
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const data = await response.json();
        
        return NextResponse.json({
            authenticated: true,
            user: data.user
        });

    } catch (error) {
        console.error('Auth me error:', error);
        return NextResponse.json({ authenticated: false }, { status: 500 });
    }
}

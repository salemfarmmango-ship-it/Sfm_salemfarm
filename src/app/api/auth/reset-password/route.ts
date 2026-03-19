import { NextRequest, NextResponse } from 'next/server';



export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Forward to PHP backend
        const response = await fetch('http://salemfarmmango.com/auth/reset-password.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.error || 'Failed to reset password' }, { status: response.status });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Reset password proxy error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

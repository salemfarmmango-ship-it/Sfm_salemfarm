import { NextRequest, NextResponse } from 'next/server';



export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Forward to PHP backend
        const response = await fetch('http://127.0.0.1/SFM/backend/auth/signup.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.error || 'Signup failed' }, { status: response.status });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Signup proxy error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

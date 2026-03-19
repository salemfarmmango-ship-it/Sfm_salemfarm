import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        // Forward to PHP backend
        const response = await fetch('http://127.0.0.1/SFM/backend/api/subscribers.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            return NextResponse.json({ message: 'Subscribed successfully!' }, { status: 201 });
        } else {
             return NextResponse.json({ error: data.error || 'Subscription failed' }, { status: response.status });
        }

    } catch (error: any) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

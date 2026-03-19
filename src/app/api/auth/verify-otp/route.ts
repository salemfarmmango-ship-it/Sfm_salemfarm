import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';



export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Forward to PHP backend
        const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.error || 'Failed to verify OTP' }, { status: response.status });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Verify OTP proxy error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

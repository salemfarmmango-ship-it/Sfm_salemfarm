import { NextRequest, NextResponse } from 'next/server';



function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function isValidPhone(phone: string): boolean {
    return /^[6-9][0-9]{9}$/.test(phone);
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Forward to PHP backend
        const response = await fetch('http://salemfarmmango.com/auth/send-otp.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data.error || 'Failed to send OTP' }, { status: response.status });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Send OTP proxy error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

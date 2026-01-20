import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { to, subject, html } = await request.json();
        const apiKey = process.env.RESEND_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'Resend API Key missing' }, { status: 500 });
        }

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Salem Farm Mango <no-reply@salemfarmmango.com>', // Update this with verified domain later
                to: to,
                subject: subject,
                html: html,
            }),
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to send Email' }, { status: 500 });
    }
}

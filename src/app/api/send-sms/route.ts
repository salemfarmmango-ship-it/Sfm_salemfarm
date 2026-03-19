import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { phone, templateId, variables } = await request.json();
        const apiKey = process.env.FAST2SMS_API_KEY;

        console.log('Sending SMS to:', phone);
        console.log('Template ID:', templateId);

        if (!apiKey) {
            console.error('Fast2SMS API Key missing');
            return NextResponse.json({ error: 'Fast2SMS API Key missing' }, { status: 500 });
        }

        const payload = {
            route: 'dlt',
            sender_id: 'SFMO',
            message: templateId,
            variables_values: variables || '',
            flash: 0,
            numbers: phone,
        };

        console.log('Fast2SMS Payload:', JSON.stringify(payload));

        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: {
                'authorization': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log('Fast2SMS Response:', JSON.stringify(data));

        if (!data.return) {
            console.error('Fast2SMS API Error:', data.message || 'Unknown error');
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Failed to send SMS (Route Internal Error):', error);
        return NextResponse.json({ error: 'Failed to send SMS', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

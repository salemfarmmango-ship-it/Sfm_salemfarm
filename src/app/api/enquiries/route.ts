import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'bulk';
        const body = await request.json();

        // Use absolute URL to call the PHP backend running on XAMPP Apache
        // Using 127.0.0.1 explicitly to prevent Node 18+ IPv6 (::1) lookup failures
        const apiUrl = `http://127.0.0.1/SFM/backend/api/enquiries.php?type=${type}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Optional: Pass forward any auth cookies if needed by the backend
                'Cookie': request.headers.get('cookie') || ''
            },
            body: JSON.stringify(body),
        });

        const text = await response.text();

        if (!response.ok) {
            console.error('PHP Backend Error (Enquiries):', text);
            return NextResponse.json({ error: text || 'Failed to submit enquiry' }, { status: response.status });
        }

        try {
            const data = JSON.parse(text);
            return NextResponse.json(data);
        } catch (e) {
            console.error('Failed to parse Enquiries JSON:', text);
            return NextResponse.json({ error: 'Invalid JSON from backend' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Enquiry Proxy Error:', error);
        return NextResponse.json({ error: 'Internal server error while processing enquiry' }, { status: 500 });
    }
}

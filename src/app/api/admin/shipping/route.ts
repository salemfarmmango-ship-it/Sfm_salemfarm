import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, unauthorizedResponse } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) {
            return unauthorizedResponse();
        }

        const res = await fetch(`http://127.0.0.1/SFM/backend/api/shipping.php`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            }
        });

        const text = await res.text();
        if (!res.ok) {
            console.error('Shipping Rates API backend error:', text);
            return NextResponse.json({ error: text }, { status: res.status });
        }

        try {
            const data = JSON.parse(text);
            return NextResponse.json(data);
        } catch (e) {
            console.error('Failed to parse shipping rates JSON:', text);
            return NextResponse.json({ error: 'Invalid JSON from backend' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Error fetching shipping rates:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) {
            return unauthorizedResponse();
        }

        const body = await request.json();

        const res = await fetch(`http://127.0.0.1/SFM/backend/api/shipping.php`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            },
            body: JSON.stringify(body)
        });

        const text = await res.text();
        if (!res.ok) {
            console.error('Shipping Rates Update backend error:', text);
            return NextResponse.json({ error: text }, { status: res.status });
        }

        try {
            const data = JSON.parse(text);
            return NextResponse.json(data);
        } catch (e) {
            console.error('Failed to parse update shipping rates JSON:', text);
            return NextResponse.json({ error: 'Invalid JSON from backend' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Error updating shipping rate:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

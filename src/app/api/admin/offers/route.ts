import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, unauthorizedResponse } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const BACKEND_URL = 'http://salemfarmmango.com/api/offers.php';

export async function GET(request: NextRequest) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) return unauthorizedResponse();

        const res = await fetch(BACKEND_URL + '?all=1', {
            cache: 'no-store',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch offers');
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Offers GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) return unauthorizedResponse();

        const body = await request.json();
        const res = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create offer');
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Offers POST Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) return unauthorizedResponse();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const body = await request.json();

        const res = await fetch(BACKEND_URL + (id ? `?id=${id}` : ''), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update offer');
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Offers PUT Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) return unauthorizedResponse();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        const res = await fetch(BACKEND_URL + (id ? `?id=${id}` : ''), {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete offer');
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Offers DELETE Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

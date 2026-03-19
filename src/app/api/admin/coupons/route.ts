import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, unauthorizedResponse } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const BACKEND_URL = '${process.env.NEXT_PUBLIC_API_URL}/coupons.php';

export async function GET(request: NextRequest) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) return unauthorizedResponse();

        const res = await fetch(BACKEND_URL, {
            cache: 'no-store',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch coupons');

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Coupons GET Error:', error);
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
        if (!res.ok) throw new Error(data.error || 'Failed to create coupon');

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Coupons POST Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) return unauthorizedResponse();

        const body = await request.json();
        const res = await fetch(BACKEND_URL, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update coupon');

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Coupons PATCH Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) return unauthorizedResponse();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const body = await request.json().catch(() => ({}));
        
        const finalId = id || body.id;

        const res = await fetch(BACKEND_URL + (finalId ? `?id=${finalId}` : ''), {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete coupon');

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Coupons DELETE Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

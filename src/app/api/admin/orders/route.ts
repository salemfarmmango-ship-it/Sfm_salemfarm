import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, unauthorizedResponse } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) {
            return unauthorizedResponse();
        }

        const { searchParams } = new URL(request.url);
        const res = await fetch(`http://127.0.0.1/SFM/backend/api/orders.php?${searchParams.toString()}`, {
            cache: 'no-store',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Orders GET API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) {
            return unauthorizedResponse();
        }

        const body = await request.json();

        const res = await fetch('http://127.0.0.1/SFM/backend/api/orders.php', {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update order(s)');

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Orders PUT API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) {
            return unauthorizedResponse();
        }

        const body = await request.json();

        const res = await fetch('http://127.0.0.1/SFM/backend/api/orders.php', {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete order(s)');

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Orders DELETE API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

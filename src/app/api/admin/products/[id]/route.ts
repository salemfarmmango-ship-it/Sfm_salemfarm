import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, unauthorizedResponse } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) {
            return unauthorizedResponse();
        }

        const res = await fetch(`http://127.0.0.1/SFM/backend/api/products.php?id=${params.id}`, {
            cache: 'no-store',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            }
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json({ error: data.error || 'Failed to fetch product' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Product GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) {
            return unauthorizedResponse();
        }

        const body = await request.json();

        // Proxy to PHP backend
        const res = await fetch(`http://127.0.0.1/SFM/backend/api/products.php?id=${params.id}`, {
            method: 'PUT', // PHP endpoint uses PUT for updates
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ error: data.error || 'Failed to update product' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update product' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) {
            return unauthorizedResponse();
        }

        // Proxy to PHP backend
        const res = await fetch(`http://127.0.0.1/SFM/backend/api/products.php?id=${params.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            }
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ error: data.error || 'Failed to delete product' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete product' },
            { status: 500 }
        );
    }
}

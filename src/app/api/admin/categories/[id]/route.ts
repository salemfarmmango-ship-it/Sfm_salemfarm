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

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories.php?id=${params.id}`, {
            cache: 'no-store',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            }
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json({ error: data.error || 'Failed to fetch category' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Category GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories.php?id=${params.id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ error: data.error || 'Failed to update category' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Category PUT error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories.php?id=${params.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            }
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ error: data.error || 'Failed to delete category' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Category DELETE error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, unauthorizedResponse } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) {
            return unauthorizedResponse();
        }

        const id = params.id;
        const body = await request.json();

        const res = await fetch(`http://salemfarmmango.com/api/blogs.php?id=${id}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ error: data.error || 'Failed to update blog' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error updating blog:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update blog' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) {
            return unauthorizedResponse();
        }

        const id = params.id;

        const res = await fetch(`http://salemfarmmango.com/api/blogs.php?id=${id}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            }
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ error: data.error || 'Failed to delete blog' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error deleting blog:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete blog' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) {
            return unauthorizedResponse();
        }

        const id = params.id;

        const res = await fetch(`http://salemfarmmango.com/api/blogs.php?id=${id}`, {
            cache: 'no-store',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            }
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ error: data.error || 'Failed to fetch blog' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching blog:', error);
        return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
    }
}

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
        const res = await fetch(`http://salemfarmmango.com/api/blogs.php?${searchParams.toString()}`, {
            cache: 'no-store',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            }
        });

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching blogs:', error);
        return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) {
            return unauthorizedResponse();
        }

        const body = await request.json();

        const res = await fetch('http://salemfarmmango.com/api/blogs.php', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ error: data.error || 'Failed to create blog' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error creating blog:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create blog' },
            { status: 500 }
        );
    }
}

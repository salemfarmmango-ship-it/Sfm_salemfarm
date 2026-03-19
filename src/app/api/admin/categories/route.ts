import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, unauthorizedResponse } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) {
            return unauthorizedResponse();
        }

        const res = await fetch('http://127.0.0.1/SFM/backend/api/categories.php', {
            cache: 'no-store',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            }
        });

        if (!res.ok) {
            return NextResponse.json({ error: 'Failed to fetch categories' }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Categories GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) {
            return unauthorizedResponse();
        }

        const body = await request.json();

        // Proxy to PHP backend
        const res = await fetch('http://127.0.0.1/SFM/backend/api/categories.php', {
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
            return NextResponse.json({ error: data.error || 'Failed to create category' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Categories POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

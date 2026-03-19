import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, unauthorizedResponse } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) {
            return unauthorizedResponse();
        }

        const res = await fetch('http://salemfarmmango.com/api/stats.php', {
            cache: 'no-store',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            }
        });

        if (!res.ok) {
            return NextResponse.json({ error: 'Failed to fetch stats' }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Stats API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, unauthorizedResponse } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { authenticated } = await verifyAdmin(request);
        if (!authenticated) {
            return unauthorizedResponse();
        }

        const body = await request.json();

        // Proxy to PHP backend
        const res = await fetch('http://127.0.0.1/SFM/backend/auth/change-password.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json({ error: data.error || 'Failed to update password' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Change password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

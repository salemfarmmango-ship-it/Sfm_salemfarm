import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, unauthorizedResponse } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { authenticated, token } = await verifyAdmin(request);
        if (!authenticated) {
            return unauthorizedResponse();
        }

        const body = await request.json();
        const { orderId, tracking_id, courier_partner } = body;

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        const updateRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders.php`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-SFM-Token': token || ''
            },
            body: JSON.stringify({
                ids: [orderId],
                tracking_id,
                courier_partner
            })
        });

        const updateData = await updateRes.json();

        if (!updateRes.ok) throw new Error(updateData.error || 'Failed to update tracking');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Tracking update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

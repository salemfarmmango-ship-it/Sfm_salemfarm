import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const DELHIVERY_API_KEY = process.env.DELHIVERY_API_KEY;

export async function POST(request: Request) {
    try {
        if (!DELHIVERY_API_KEY) {
            return NextResponse.json({ error: 'Delhivery API Key not configured' }, { status: 500 });
        }

        const body = await request.json();
        const { waybill, orderId } = body;

        if (!waybill || !orderId) {
            return NextResponse.json({ error: 'Waybill and Order ID are required' }, { status: 400 });
        }

        // 1. Ask Delhivery for the slip
        // Delhivery's Packing Slip API: GET https://track.delhivery.com/api/p/packing_slip
        // Query param: wbill=WAYBILL1,WAYBILL2
        const isDemo = DELHIVERY_API_KEY.startsWith('demo_') || DELHIVERY_API_KEY.includes('test');
        const baseUrl = isDemo ? 'https://staging-express.delhivery.com' : 'https://track.delhivery.com';
        const url = `${baseUrl}/api/p/packing_slip?wbill=${waybill}`;

        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${DELHIVERY_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();

        if (data.packages_found === 0 || !data.packages || data.packages.length === 0) {
            return NextResponse.json({ error: 'Packing slip not found for this Waybill' }, { status: 404 });
        }

        const slipHtmlOrPdf = data.packages[0].pdf_download_link || data.packages[0].pdf_link;

        // 2. We will just save the Delhivery download link natively
        // so the frontend can redirect the user to Delhivery's hosted label
        if (!slipHtmlOrPdf) {
            return NextResponse.json({ error: 'No PDF link returned from Delhivery' }, { status: 400 });
        }

        const { error: dbUpdateError } = await supabaseAdmin
            .from('orders')
            .update({ label_url: slipHtmlOrPdf })
            .eq('id', orderId);

        if (dbUpdateError) {
            return NextResponse.json({ error: 'Label generated but failed to save URL in database', slipHtmlOrPdf }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            label_url: slipHtmlOrPdf
        });

    } catch (error: any) {
        console.error('Delhivery Label API error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error while fetching label' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Delhivery API config
const DELHIVERY_API_KEY = process.env.DELHIVERY_API_KEY;
const ORIGIN_PINCODE = process.env.NEXT_PUBLIC_STORE_PINCODE || '636001';

// Helper to extract weight in grams from size string (e.g., "1kg", "500g")
const parseWeight = (size: string): number => {
    if (!size) return 1000; // default 1kg
    const lower = size.toLowerCase();
    const match = lower.match(/(\d+\.?\d*)\s*(kg|g)/);
    if (match) {
        const val = parseFloat(match[1]);
        const unit = match[2];
        if (unit === 'kg') return val * 1000;
        return val;
    }
    return 1000; // default
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { state, pincode, items } = body;

        if (!state && !pincode) {
            return NextResponse.json({ fee: 150 });
        }

        const isLocalState = (state || '').toLowerCase() === 'tamil nadu' ||
            (state || '').toLowerCase() === 'tamilnadu' ||
            (state || '').toLowerCase() === 'puducherry' ||
            (state || '').toLowerCase() === 'pondicherry';

        if (isLocalState) {
            // Fetch from local Supabase rates
            const { data } = await supabase.from('shipping_rates').select('*').eq('is_active', true).eq('state_name', state).single();
            if (data) {
                return NextResponse.json({ fee: data.charge, source: 'local' });
            }
            // fallback
            return NextResponse.json({ fee: 150, source: 'local_default' });
        } else {
            // Use Delhivery for other states
            if (!DELHIVERY_API_KEY) {
                console.warn('Delhivery API key not found. Using default rate.');
                return NextResponse.json({ fee: 200, source: 'delhivery_fallback_missing_key' });
            }

            let totalWeightGrams = 0;
            const productIds = items?.map((i: any) => i.id) || [];
            if (productIds.length > 0) {
                const { data: products } = await supabase.from('products').select('id, size').in('id', productIds);

                items.forEach((item: any) => {
                    const product = products?.find(p => p.id === item.id);
                    const weight = parseWeight(product?.size);
                    totalWeightGrams += weight * item.quantity;
                });
            }

            if (totalWeightGrams === 0) totalWeightGrams = 1000;

            const md = 'S'; // Surface
            const o_pin = ORIGIN_PINCODE;
            const d_pin = pincode;
            const cgm = totalWeightGrams; // Weight in grams

            try {
                // Delhivery Freight Calculation API (B2C)
                const url = `https://track.delhivery.com/api/kinko/v1/invoice/charges.json?md=${md}&ss=Delivered&d_pin=${d_pin}&o_pin=${o_pin}&cgm=${cgm}&gl=0&is_cod=false`;

                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Token ${DELHIVERY_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (data && data.length > 0 && data[0].total_amount) {
                    const fee = data[0].total_amount;
                    return NextResponse.json({ fee: Math.ceil(fee), source: 'delhivery' });
                } else {
                    console.error('Delhivery pricing error:', data);
                    return NextResponse.json({ fee: 200, source: 'delhivery_fallback_internal' });
                }

            } catch (err) {
                console.error('Failed to fetch Delhivery price:', err);
                return NextResponse.json({ fee: 200, source: 'delhivery_fallback_error' });
            }
        }

    } catch (error: any) {
        console.error('Shipping calculation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

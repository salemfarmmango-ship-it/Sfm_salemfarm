import { NextResponse } from 'next/server';

// Delhivery API config
const DELHIVERY_API_KEY = process.env.DELHIVERY_API_KEY;
const ORIGIN_PINCODE = process.env.NEXT_PUBLIC_STORE_PINCODE || '636001';

// Helper to extract weight in grams from size string (e.g., "1kg", "500g", "3 Kg")
const parseWeight = (size: string): number => {
    if (!size) return 1000; // default 1kg
    const lower = size.toLowerCase();
    
    // Match "1 kg", "1kg", "3.5kg", "500g", "500 g"
    const match = lower.match(/(\d+\.?\d*)\s*(kg|g|litre|l)/);
    if (match) {
        const val = parseFloat(match[1]);
        const unit = match[2];
        if (unit === 'kg' || unit === 'litre' || unit === 'l') return val * 1000;
        return val; // grams
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

        // Calculate total weight from cart items (using item.weight which is set in ProductActions)
        let totalWeightGrams = 0;
        if (items && Array.isArray(items)) {
            items.forEach((item: any) => {
                // ProductActions saves variation label/size into 'weight' property
                const weightPerItem = parseWeight(item.weight);
                totalWeightGrams += weightPerItem * (item.quantity || 1);
            });
        }

        // Ensure at least 1kg if calculation fails
        if (totalWeightGrams === 0) totalWeightGrams = 1000;
        const totalWeightKg = totalWeightGrams / 1000;

        const normalizedState = (state || '').toLowerCase().replace(/\s/g, '');
        const isTN = normalizedState === 'tamilnadu';
        const isPY = normalizedState === 'puducherry' || normalizedState === 'pondicherry' || normalizedState === 'puthuchery';

        if (isTN || isPY) {
            // Fetch from local PHP backend using canonical names
            const queryState = isTN ? 'Tamil Nadu' : 'Puducherry';
            try {
                const res = await fetch(`http://127.0.0.1/SFM/backend/api/shipping_rates.php?state_name=${encodeURIComponent(queryState)}&is_active=1`, { cache: 'no-store' });
                if (res.ok) {
                    const dataArr = await res.json();
                    const data = dataArr[0]; // Get first match

                    if (data) {
                        // Rule: Charge = Base Rate * Weight in Kg
                        const baseCharge = parseFloat(data.charge);
                        const finalFee = Math.ceil(baseCharge * totalWeightKg);
                        return NextResponse.json({ 
                            fee: finalFee, 
                            source: 'local',
                            weight: totalWeightKg,
                            rate: baseCharge
                        });
                    }
                }
            } catch (e) {
                console.error('Failed to fetch shipping rates from PHP:', e);
            }
            // fallback local default (weight-based)
            return NextResponse.json({ fee: Math.ceil(50 * totalWeightKg), source: 'local_default' });
        } else {
            // Use Delhivery for other states
            if (!DELHIVERY_API_KEY) {
                console.warn('Delhivery API key not found. Using default rate.');
                return NextResponse.json({ fee: 200 * Math.ceil(totalWeightKg), source: 'delhivery_fallback_missing_key' });
            }

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
                    return NextResponse.json({ 
                        fee: Math.ceil(fee), 
                        source: 'delhivery',
                        weight: totalWeightKg
                    });
                } else {
                    console.error('Delhivery pricing error:', data);
                    // Fallback to 200 per kg for national
                    return NextResponse.json({ fee: 200 * Math.ceil(totalWeightKg), source: 'delhivery_fallback_internal' });
                }

            } catch (err) {
                console.error('Failed to fetch Delhivery price:', err);
                return NextResponse.json({ fee: 200 * Math.ceil(totalWeightKg), source: 'delhivery_fallback_error' });
            }
        }

    } catch (error: any) {
        console.error('Shipping calculation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

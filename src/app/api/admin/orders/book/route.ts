import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const DELHIVERY_API_KEY = process.env.DELHIVERY_API_KEY;
const PICKUP_LOCATION = process.env.DELHIVERY_PICKUP_LOCATION;

export async function POST(request: Request) {
    try {
        if (!DELHIVERY_API_KEY || !PICKUP_LOCATION) {
            console.error('[Delhivery] Missing env vars. API_KEY present:', !!DELHIVERY_API_KEY, 'PICKUP_LOCATION:', PICKUP_LOCATION);
            return NextResponse.json({ error: 'Delhivery API Key or Pickup Location not configured in .env' }, { status: 500 });
        }

        const body = await request.json();
        const { orderId } = body;
        console.log('[Delhivery] Booking request for Order ID:', orderId);

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        // 1. Fetch full order details using Admin role
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select(`
                *,
                profiles:user_id ( full_name ),
                order_items (
                    quantity,
                    price,
                    products ( name, size )
                )
            `)
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            console.error('[Delhivery] Order fetch error:', orderError);
            return NextResponse.json({ error: 'Order not found: ' + (orderError?.message || 'unknown') }, { status: 404 });
        }

        console.log('[Delhivery] Order found. Status:', order.status, 'is_delhivery_automated:', order.is_delhivery_automated);

        if (order.is_delhivery_automated) {
            return NextResponse.json({ error: 'This order is already booked with Delhivery', tracking_id: order.tracking_id }, { status: 400 });
        }

        // 2. Parse Shipping Address
        const address = order.shipping_address;
        console.log('[Delhivery] Shipping address:', JSON.stringify(address));

        if (!address) {
            return NextResponse.json({ error: 'No shipping address found on order' }, { status: 400 });
        }

        // Be flexible with address field names
        const customerName = address.full_name || address.name || 'Customer';
        const customerPhone = address.phone || address.mobile || '';
        const addressLine = address.address_line1 || address.address || address.street || '';
        const city = address.city || '';
        const state = address.state || '';
        const pincode = address.postal_code || address.pincode || address.zip || '';

        if (!pincode || !customerPhone || !addressLine) {
            console.error('[Delhivery] Incomplete address. phone:', customerPhone, 'address:', addressLine, 'pincode:', pincode);
            return NextResponse.json({ error: `Incomplete shipping address. Missing: ${!pincode ? 'pincode ' : ''}${!customerPhone ? 'phone ' : ''}${!addressLine ? 'address ' : ''}` }, { status: 400 });
        }

        // 3. Calculate Total Cart Weight
        let totalWeightGrams = 0;
        const productsList: string[] = [];

        order.order_items?.forEach((item: any) => {
            const sizeStr = item.products?.size || '1kg';
            productsList.push(`${item.quantity}x ${item.products?.name}`);

            let weight = 1000;
            const lowerSize = sizeStr.toLowerCase().replace(/\s/g, '');
            if (lowerSize.includes('kg')) {
                const num = parseFloat(lowerSize.replace('kg', ''));
                if (!isNaN(num)) weight = num * 1000;
            } else if (lowerSize.includes('g')) {
                const num = parseFloat(lowerSize.replace('g', ''));
                if (!isNaN(num)) weight = num;
            }
            totalWeightGrams += (weight * item.quantity);
        });

        if (totalWeightGrams === 0) totalWeightGrams = 1000;
        console.log('[Delhivery] Total weight (grams):', totalWeightGrams, 'Products:', productsList.join(', '));

        // 4. Construct Delhivery Shipment Payload
        const shipment = {
            name: customerName,
            add: addressLine + (address.address_line2 ? `, ${address.address_line2}` : ''),
            pin: String(pincode),
            city: city,
            state: state,
            country: "India",
            phone: String(customerPhone),
            order: `SFM-${order.id}`,
            payment_mode: "Prepaid",
            return_pin: process.env.NEXT_PUBLIC_STORE_PINCODE || "637103",
            return_city: "Salem",
            return_name: "Salem Farm Mango",
            products_desc: productsList.join(', ').substring(0, 150),
            hsn_code: "0804",
            cod_amount: "0",
            order_date: null,
            total_amount: String(order.total_amount || 0),
            weight: totalWeightGrams,
            pickup_location: {
                name: PICKUP_LOCATION.replace(/"/g, '') // Remove any surrounding quotes
            }
        };

        const payload = {
            shipments: [shipment],
            pickup_location: {
                name: PICKUP_LOCATION.replace(/"/g, '')
            }
        };

        console.log('[Delhivery] Sending payload:', JSON.stringify(payload, null, 2));

        // 5. Send Request - Delhivery expects application/x-www-form-urlencoded with format=json&data=JSON
        const endpointUrl = 'https://track.delhivery.com/api/cmu/create.json';
        const requestBody = `format=json&data=${encodeURIComponent(JSON.stringify(payload))}`;

        console.log('[Delhivery] Endpoint:', endpointUrl);
        console.log('[Delhivery] Request body:', requestBody.substring(0, 500));

        const delhiveryRes = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${DELHIVERY_API_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: requestBody
        });

        // Try to get response as text first for debugging
        const responseText = await delhiveryRes.text();
        console.log('[Delhivery] Raw response status:', delhiveryRes.status);
        console.log('[Delhivery] Raw response:', responseText.substring(0, 2000));

        let delhiveryResponseData;
        try {
            delhiveryResponseData = JSON.parse(responseText);
        } catch (e) {
            console.error('[Delhivery] Failed to parse response as JSON');
            return NextResponse.json({
                error: 'Delhivery returned non-JSON response. Status: ' + delhiveryRes.status,
                rawResponse: responseText.substring(0, 500)
            }, { status: 502 });
        }

        console.log('[Delhivery] Parsed response:', JSON.stringify(delhiveryResponseData, null, 2));

        // 6. Handle various error formats from Delhivery
        if (delhiveryRes.status === 401 || delhiveryRes.status === 403) {
            return NextResponse.json({ error: 'Delhivery API authentication failed. Please check your API key.', details: delhiveryResponseData }, { status: 401 });
        }

        if (delhiveryResponseData.rmk === 'error' || delhiveryResponseData.success === false) {
            const errMsg = delhiveryResponseData.data?.rmk || delhiveryResponseData.error || delhiveryResponseData.message || 'Delhivery rejected the request';
            return NextResponse.json({ error: errMsg, details: delhiveryResponseData }, { status: 400 });
        }

        // Check for package-level errors
        if (delhiveryResponseData.packages && delhiveryResponseData.packages.length > 0) {
            const pkg = delhiveryResponseData.packages[0];
            if (pkg.status === "Fail" || pkg.status === "fail") {
                const remarks = pkg.remarks || [];
                const errMsg = Array.isArray(remarks) ? remarks.join(', ') : String(remarks);
                return NextResponse.json({ error: errMsg || 'Shipment creation failed', details: delhiveryResponseData }, { status: 400 });
            }
        }

        // 7. Extract Waybill from success response
        const waybill = delhiveryResponseData.packages?.[0]?.waybill
            || delhiveryResponseData.upload_wbn
            || delhiveryResponseData.waybill;

        if (!waybill) {
            console.error('[Delhivery] No waybill in response. Full response:', JSON.stringify(delhiveryResponseData));
            return NextResponse.json({
                error: 'Delhivery returned OK but no waybill number found in response',
                details: delhiveryResponseData
            }, { status: 500 });
        }

        console.log('[Delhivery] SUCCESS! Waybill:', waybill);

        // 8. Save to Supabase
        const { error: dbUpdateError } = await supabaseAdmin
            .from('orders')
            .update({
                tracking_id: waybill,
                courier_partner: 'Delhivery',
                is_delhivery_automated: true
            })
            .eq('id', order.id);

        if (dbUpdateError) {
            console.error('[Delhivery] DB update error:', dbUpdateError);
            return NextResponse.json({ error: 'Shipment created but failed to save tracking ID in database', waybill }, { status: 500 });
        }

        console.log('[Delhivery] Tracking saved to database for order:', order.id);

        return NextResponse.json({
            success: true,
            tracking_id: waybill,
            message: 'Successfully booked with Delhivery'
        });

    } catch (error: any) {
        console.error('[Delhivery] Booking API error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error while booking' }, { status: 500 });
    }
}

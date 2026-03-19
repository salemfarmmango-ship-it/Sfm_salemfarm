import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { code, subtotal } = await request.json();

        if (!code) {
            return NextResponse.json({ error: 'Code is required' }, { status: 400 });
        }

        const token = cookies().get('sfm_token')?.value;

        // Proxy to PHP backend using the public validation parameter 'code'
        const res = await fetch(`http://127.0.0.1/SFM/backend/api/coupons.php?code=${encodeURIComponent(code)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-store'
        });
        
        const coupon = await res.json();
        
        if (!res.ok) {
            return NextResponse.json({ valid: false, message: coupon.error || 'Invalid coupon code' }, { status: res.status });
        }

        // Validate minimum order amount
        const minOrder = parseFloat(coupon.min_order_value || 0);
        if (subtotal < minOrder) {
            return NextResponse.json({ 
                valid: false, 
                message: `Minimum order amount for this coupon is ₹${minOrder}` 
            });
        }

        // Calculate discount
        let discount = 0;
        const discountValue = parseFloat(coupon.discount_value);
        if (coupon.discount_type === 'percentage') {
            discount = (subtotal * discountValue) / 100;
            const maxDiscount = coupon.max_discount_value ? parseFloat(coupon.max_discount_value) : null;
            if (maxDiscount && discount > maxDiscount) {
                discount = maxDiscount;
            }
        } else {
            discount = discountValue;
        }

        return NextResponse.json({
            valid: true,
            id: coupon.id,
            code: coupon.code,
            discount: Math.round(discount),
            type: coupon.discount_type,
            value: discountValue
        });

    } catch (error: any) {
        console.error('Coupon validation error:', error);
        return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
    }
}

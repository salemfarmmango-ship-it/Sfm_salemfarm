import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const BACKEND_URL = 'http://127.0.0.1/SFM/backend/api/reviews.php';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('product_id');
        
        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const res = await fetch(`${BACKEND_URL}?product_id=${productId}`, {
            cache: 'no-store'
        });
        
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Reviews GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = cookies().get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const res = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to submit review');

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Reviews POST Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

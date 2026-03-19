import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        
        const res = await fetch(`http://salemfarmmango.com/api/products.php?${searchParams.toString()}`, {
            cache: 'no-store'
        });

        const data = await res.json();
        
        if (!res.ok) {
            return NextResponse.json({ error: data.error || 'Failed to fetch products' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

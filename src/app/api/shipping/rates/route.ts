import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const res = await fetch(`http://salemfarmmango.com/api/shipping.php`, {
            cache: 'no-store'
        });

        const text = await res.text();
        if (!res.ok) {
            console.error('Public Shipping Rates API backend error:', text);
            return NextResponse.json({ error: text }, { status: res.status });
        }

        try {
            const data = JSON.parse(text);
            return NextResponse.json(data);
        } catch (e) {
            console.error('Failed to parse public shipping rates JSON:', text);
            return NextResponse.json({ error: 'Invalid JSON from backend' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Error fetching public shipping rates:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

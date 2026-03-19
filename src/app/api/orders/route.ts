import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
    try {
        let token = request.cookies.get('sfm_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const status = searchParams.get('status');
        const date = searchParams.get('date');
        const page = searchParams.get('page');
        const limit = searchParams.get('limit');

        let url = 'http://127.0.0.1/SFM/backend/api/orders.php';
        const params = new URLSearchParams();
        if (id) params.append('id', id);
        if (status) params.append('status', status);
        if (date) params.append('date', date);
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const phpResponse = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-store'
        });

        if (!phpResponse.ok) {
            const errorText = await phpResponse.text();
            return NextResponse.json({ error: errorText }, { status: phpResponse.status });
        }

        const data = await phpResponse.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching orders proxy:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        let token = request.cookies.get('sfm_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const phpResponse = await fetch('http://127.0.0.1/SFM/backend/api/orders.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const text = await phpResponse.text();
        
        if (!phpResponse.ok) {
            console.error('PHP Backend Error (Orders):', text);
            return NextResponse.json({ error: text }, { status: phpResponse.status });
        }

        try {
            const data = JSON.parse(text);
            return NextResponse.json(data);
        } catch (e) {
            console.error('Failed to parse Orders JSON:', text);
            return NextResponse.json({ error: 'Invalid JSON from backend' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Error creating order proxy:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const BACKEND_URL = 'http://127.0.0.1/SFM/backend/api/addresses.php';

async function getAuthHeaders() {
    const token = cookies().get('sfm_token')?.value;
    if (!token) return null;
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

export async function GET(request: NextRequest) {
    try {
        const headers = await getAuthHeaders();
        if (!headers) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');
        
        let url = BACKEND_URL;
        if (userId) url += `?user_id=${userId}`;

        const res = await fetch(url, {
            headers,
            cache: 'no-store'
        });
        
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Addresses GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const headers = await getAuthHeaders();
        if (!headers) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const res = await fetch(BACKEND_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Addresses POST Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const headers = await getAuthHeaders();
        if (!headers) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const body = await request.json();
        const res = await fetch(`${BACKEND_URL}?id=${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body)
        });

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Addresses PUT Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const headers = await getAuthHeaders();
        if (!headers) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const res = await fetch(`${BACKEND_URL}?id=${id}`, {
            method: 'DELETE',
            headers
        });

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Addresses DELETE Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

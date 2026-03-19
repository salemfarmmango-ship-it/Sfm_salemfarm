import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const BACKEND_URL = '${process.env.NEXT_PUBLIC_API_URL}/profiles.php';

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

        const res = await fetch(BACKEND_URL, {
            headers,
            cache: 'no-store'
        });
        
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Profile GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const headers = await getAuthHeaders();
        if (!headers) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const res = await fetch(BACKEND_URL, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body)
        });

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Profile PUT Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

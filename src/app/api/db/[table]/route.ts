import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { table: string } }
) {
    const table = params.table.endsWith('.php') ? params.table : `${params.table}.php`;
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const targetUrl = `http://127.0.0.1/SFM/backend/api/${table}${queryString ? `?${queryString}` : ''}`;

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': request.headers.get('Authorization') || '',
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error(`Proxy GET error for ${table}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { table: string } }
) {
    const table = params.table.endsWith('.php') ? params.table : `${params.table}.php`;
    const body = await request.json();
    const targetUrl = `http://127.0.0.1/SFM/backend/api/${table}`;

    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': request.headers.get('Authorization') || '',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error(`Proxy POST error for ${table}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { table: string } }
) {
    const table = params.table.endsWith('.php') ? params.table : `${params.table}.php`;
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const targetUrl = `http://127.0.0.1/SFM/backend/api/${table}${queryString ? `?${queryString}` : ''}`;

    try {
        const response = await fetch(targetUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': request.headers.get('Authorization') || '',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error(`Proxy PUT error for ${table}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { table: string } }
) {
    const table = params.table.endsWith('.php') ? params.table : `${params.table}.php`;
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const targetUrl = `http://127.0.0.1/SFM/backend/api/${table}${queryString ? `?${queryString}` : ''}`;

    try {
        const response = await fetch(targetUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': request.headers.get('Authorization') || '',
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error(`Proxy DELETE error for ${table}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        
        const res = await fetch(`http://127.0.0.1/SFM/backend/api/blogs.php?${searchParams.toString()}`, {
            cache: 'no-store'
        });

        const data = await res.json();
        
        if (!res.ok) {
            return NextResponse.json({ error: data.error || 'Failed to fetch blogs' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching blogs:', error);
        return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
    }
}

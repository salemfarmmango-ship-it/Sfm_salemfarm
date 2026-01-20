import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

async function verifyAdmin(request: NextRequest) {
    const adminId = request.cookies.get('admin_session')?.value;
    if (!adminId) return false;

    const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', adminId)
        .single();

    return !!data;
}

export async function GET(request: NextRequest) {
    try {
        // Allow unauthenticated GET? No, admin panel needs it. 
        // But checkout needs it too. Checkout handles it via public RLS.
        // This API is for Admin Panel usage, so verify admin.
        if (!await verifyAdmin(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('store_settings')
            .select('*');

        if (error) throw error;

        // Convert array to object for easier consumption
        const settings = data.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, any>);

        return NextResponse.json({ settings });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!await verifyAdmin(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { key, value } = body;

        if (!key) return NextResponse.json({ error: 'Key is required' }, { status: 400 });

        const { error } = await supabase
            .from('store_settings')
            .upsert({ key, value });

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

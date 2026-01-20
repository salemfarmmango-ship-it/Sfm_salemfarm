import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAdmin(request: NextRequest) {
    const adminId = request.cookies.get('admin_session')?.value;
    if (!adminId) return false;

    const { data } = await supabaseAdmin
        .from('admin_users')
        .select('id')
        .eq('id', adminId)
        .single();

    return !!data;
}

export async function GET(request: NextRequest) {
    try {
        const { data, error } = await supabaseAdmin
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return NextResponse.json(data);
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
        const { name, slug, image_url } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('categories')
            .insert([{ name, slug, image_url }])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

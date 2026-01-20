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

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        if (!await verifyAdmin(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const categoryId = params.id;
        const body = await request.json();

        const { data, error } = await supabaseAdmin
            .from('categories')
            .update({
                name: body.name,
                slug: body.slug,
                image_url: body.image_url
            })
            .eq('id', categoryId)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        if (!await verifyAdmin(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const categoryId = params.id;

        const { error } = await supabaseAdmin
            .from('categories')
            .delete()
            .eq('id', categoryId);

        if (error) {
            if (error.code === '23503') {
                return NextResponse.json(
                    { error: 'Cannot delete category because it contains products. Please delete or move those products first.' },
                    { status: 400 }
                );
            }
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

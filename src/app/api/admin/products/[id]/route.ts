import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const productId = params.id;
        const body = await request.json();

        const { data, error } = await supabaseAdmin
            .from('products')
            .update({
                name: body.name,
                description: body.description,
                price: body.price,
                stock: body.stock,
                category_id: body.category_id,
                size: body.size,
                is_featured: body.is_featured,
                season_over: body.season_over,
                original_price: body.original_price,
                images: body.images
            })
            .eq('id', productId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update product' },
            { status: 500 }
        );
    }
}

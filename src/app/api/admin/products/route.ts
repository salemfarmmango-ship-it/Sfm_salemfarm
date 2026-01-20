import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { data, error } = await supabaseAdmin
            .from('products')
            .insert({
                name: body.name,
                description: body.description,
                price: body.price,
                stock: body.stock,
                category_id: body.category_id,
                size: body.size,
                is_featured: body.is_featured || false,
                season_over: body.season_over || false,
                original_price: body.original_price, // Added Regular Price
                images: body.images || []
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create product' },
            { status: 500 }
        );
    }
}

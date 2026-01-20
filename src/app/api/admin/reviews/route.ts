import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Helper to safely get admin client
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
        throw new Error('Missing Supabase Environment Variables (URL or SUPABASE_SERVICE_KEY)');
    }

    return createClient(url, key);
}

// GET - Fetch reviews
export async function GET(request: Request) {
    try {
        const adminClient = getSupabaseAdmin();
        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter') || 'pending';

        console.log('Fetching reviews with filter:', filter);

        let query = adminClient
            .from('reviews')
            .select('*');

        if (filter === 'pending') {
            query = query.eq('is_approved', false);
        } else if (filter === 'approved') {
            query = query.eq('is_approved', true);
        }

        query = query.order('created_at', { ascending: false });

        const { data: reviews, error } = await query;

        if (error) {
            console.error('SUPABASE API ERROR:', error);
            return NextResponse.json({ error: error.message, details: error }, { status: 500 });
        }

        // Manual join to get product names safely
        let reviewsWithProducts = reviews || [];
        if (reviews && reviews.length > 0) {
            const productIds = Array.from(new Set(reviews.map((r: any) => r.product_id)));
            const { data: products } = await adminClient
                .from('products')
                .select('id, name')
                .in('id', productIds);

            const productMap = new Map((products || []).map((p: any) => [p.id, p]));

            reviewsWithProducts = reviews.map((r: any) => ({
                ...r,
                products: productMap.get(r.product_id) || { name: 'Unknown Product' }
            }));
        }

        console.log(`Found ${reviewsWithProducts.length} reviews`);
        return NextResponse.json({ reviews: reviewsWithProducts });

    } catch (e: any) {
        console.error('UNCAUGHT API ERROR:', e);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: e.message || String(e),
            hint: 'Check server logs for environment variable issues.'
        }, { status: 500 });
    }
}

// PATCH - Update review approval status (Single or Bulk)
export async function PATCH(request: Request) {
    try {
        const adminClient = getSupabaseAdmin();
        const { id, ids, is_approved } = await request.json();

        let query = adminClient.from('reviews').update({ is_approved });

        if (ids && Array.isArray(ids) && ids.length > 0) {
            query = query.in('id', ids);
        } else if (id) {
            query = query.eq('id', id);
        } else {
            return NextResponse.json({ error: 'Missing id or ids' }, { status: 400 });
        }

        const { error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE - Delete a review (Single or Bulk)
export async function DELETE(request: Request) {
    try {
        const adminClient = getSupabaseAdmin();
        const { id, ids } = await request.json();

        let query = adminClient.from('reviews').delete();

        if (ids && Array.isArray(ids) && ids.length > 0) {
            query = query.in('id', ids);
        } else if (id) {
            query = query.eq('id', id);
        } else {
            return NextResponse.json({ error: 'Missing id or ids' }, { status: 400 });
        }

        const { error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('store_settings')
            .select('*');

        if (error) throw error;

        // Convert array to object
        const settings = data.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, any>);

        return NextResponse.json({ settings });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

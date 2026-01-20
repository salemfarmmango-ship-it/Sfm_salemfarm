import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('newsletter_subscribers')
            .insert([{ email }]);

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ message: 'You are already subscribed!' }, { status: 200 });
            }
            throw error;
        }

        return NextResponse.json({ message: 'Subscribed successfully!' }, { status: 201 });

    } catch (error: any) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

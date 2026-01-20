import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { identifier, password } = await request.json();

        if (!identifier || !password) {
            return NextResponse.json({ error: 'Missing identifier or password' }, { status: 400 });
        }

        // Determine if it's email or phone
        const isPhone = /^[6-9][0-9]{9}$/.test(identifier);

        // For phone users, convert to the dummy email format
        const credentials = isPhone
            ? { email: `${identifier}@phone.salemfarmmango.local`, password }
            : { email: identifier, password };

        const { data, error } = await supabase.auth.signInWithPassword(credentials);

        if (error) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            session: data.session,
            user: data.user,
            message: 'Login successful'
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

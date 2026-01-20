import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Fetch admin user by email
        console.log('Looking for admin with email:', email);
        const { data: admin, error: fetchError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', email)
            .single();

        console.log('Fetch result:', { admin: admin ? { email: admin.email, has_hash: !!admin.password_hash } : null, error: fetchError });

        if (fetchError || !admin) {
            console.log('Admin not found or error:', fetchError);
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Verify password
        console.log('Comparing password with hash');
        const isValidPassword = await bcrypt.compare(password, admin.password_hash);
        console.log('Password valid:', isValidPassword);

        if (!isValidPassword) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Create session cookie (7 days expiry)
        const response = NextResponse.json({
            success: true,
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name
            }
        });

        response.cookies.set('admin_session', admin.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;

    } catch (error) {
        console.error('Admin login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

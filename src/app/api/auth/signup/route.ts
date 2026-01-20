import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { identifier, password, verificationToken, type } = await request.json();

        if (!identifier || !password || !verificationToken || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify token
        const { data: tokenData, error: tokenError } = await supabase
            .from('verification_tokens')
            .select('*')
            .eq('token', verificationToken)
            .eq('identifier', identifier)
            .eq('purpose', 'signup')
            .eq('used', false)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (tokenError || !tokenData) {
            return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 });
        }

        // Mark token as used
        await supabase
            .from('verification_tokens')
            .update({ used: true })
            .eq('id', tokenData.id);

        // Create user with password
        // Note: Phone auth uses dummy email since Supabase doesn't support Fast2SMS
        const authData: any = type === 'phone'
            ? {
                email: `${identifier}@phone.salemfarmmango.local`, // Dummy email for phone users
                password,
                email_confirm: true, // Auto-confirm since we verified via OTP
                user_metadata: {
                    phone: identifier,
                    auth_method: 'phone'
                }
            }
            : {
                email: identifier,
                password,
                email_confirm: true,
                user_metadata: {
                    auth_method: 'email'
                }
            };

        console.log('Creating user with data:', { ...authData, password: '[REDACTED]' });
        const { data, error } = await supabase.auth.admin.createUser(authData);

        if (error) {
            console.error('Create user error:', error);
            return NextResponse.json({ error: error.message || 'Failed to create account' }, { status: 500 });
        }

        console.log('User created successfully:', { id: data.user?.id, phone: data.user?.user_metadata?.phone, email: data.user?.email });

        return NextResponse.json({
            success: true,
            user: data.user,
            message: 'Account created successfully'
        });

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

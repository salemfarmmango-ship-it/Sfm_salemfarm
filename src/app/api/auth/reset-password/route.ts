import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { identifier, newPassword, verificationToken } = await request.json();

        if (!identifier || !newPassword || !verificationToken) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify token
        const { data: tokenData, error: tokenError } = await supabase
            .from('verification_tokens')
            .select('*')
            .eq('token', verificationToken)
            .eq('identifier', identifier)
            .eq('purpose', 'reset')
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

        // Find user
        const { data: users } = await supabase.auth.admin.listUsers();

        // Check if identifier is a phone number
        const isPhone = /^[6-9][0-9]{9}$/.test(identifier);
        const user = isPhone
            ? users?.users.find(u => u.email === `${identifier}@phone.salemfarmmango.local`)
            : users?.users.find(u => u.email === identifier);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update password
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
        );

        if (updateError) {
            console.error('Update password error:', updateError);
            return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

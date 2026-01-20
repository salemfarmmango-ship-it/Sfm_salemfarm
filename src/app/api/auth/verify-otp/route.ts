import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { identifier, code, purpose } = await request.json();

        if (!identifier || !code || !purpose) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Find valid OTP
        const { data: otpData, error: otpError } = await supabase
            .from('otp_verifications')
            .select('*')
            .eq('identifier', identifier)
            .eq('code', code)
            .eq('verified', false)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (otpError || !otpData) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        // Mark OTP as verified
        await supabase
            .from('otp_verifications')
            .update({ verified: true })
            .eq('id', otpData.id);

        // Generate verification token (15 min expiry)
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Store verification token
        const { error: tokenError } = await supabase
            .from('verification_tokens')
            .upsert({
                identifier,
                token,
                purpose,
                expires_at: expiresAt.toISOString(),
                used: false
            }, {
                onConflict: 'identifier,purpose'
            });

        if (tokenError) {
            console.error('Token error:', tokenError);
            return NextResponse.json({ error: `Failed to create verification token: ${tokenError.message}` }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            verificationToken: token,
            message: 'OTP verified successfully'
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

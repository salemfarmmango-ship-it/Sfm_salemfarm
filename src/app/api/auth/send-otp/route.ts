import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function isValidPhone(phone: string): boolean {
    return /^[6-9][0-9]{9}$/.test(phone);
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
    try {
        const { identifier, type, purpose } = await request.json();

        if (!identifier || !type || !purpose) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!['signup', 'reset'].includes(purpose)) {
            return NextResponse.json({ error: 'Purpose must be signup or reset' }, { status: 400 });
        }

        // Validate
        if (type === 'phone' && !isValidPhone(identifier)) {
            return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
        }
        if (type === 'email' && !isValidEmail(identifier)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        // Check if user exists
        const { data: users } = await supabase.auth.admin.listUsers();
        const userExists = type === 'phone'
            ? users?.users.some(u => u.email === `${identifier}@phone.salemfarmmango.local`)
            : users?.users.some(u => u.email === identifier);

        // Validate based on purpose
        if (purpose === 'signup' && userExists) {
            return NextResponse.json({ error: 'User already exists. Please login.' }, { status: 400 });
        }
        if (purpose === 'reset' && !userExists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const code = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Delete old OTPs
        await supabase
            .from('otp_verifications')
            .delete()
            .eq('identifier', identifier)
            .eq('verified', false);

        // Store OTP
        const { error: dbError } = await supabase
            .from('otp_verifications')
            .insert({
                identifier,
                type,
                code,
                expires_at: expiresAt.toISOString()
            });

        if (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json({ error: 'Failed to store OTP' }, { status: 500 });
        }

        // Send OTP using Fast2SMS DLT route
        if (type === 'phone') {
            const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
                method: 'POST',
                headers: {
                    'authorization': process.env.FAST2SMS_API_KEY!,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    route: 'dlt',
                    sender_id: 'SFMO',
                    message: '207630', // Template ID for OTP
                    variables_values: code,
                    flash: 0,
                    numbers: identifier
                })
            });

            const result = await response.json();
            if (!response.ok || !result.return) {
                console.error('Fast2SMS error:', result);
                return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
            }
        } else {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'Salem Farm <no-reply@salemfarmmango.com>',
                    to: identifier,
                    subject: purpose === 'signup' ? 'Verify Your Account' : 'Reset Your Password',
                    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>${purpose === 'signup' ? 'Welcome to Salem Farm!' : 'Password Reset'}</h2>
              <p>Your verification code is:</p>
              <h1 style="color: #f59e0b; font-size: 32px; letter-spacing: 5px;">${code}</h1>
              <p>This code will expire in 5 minutes.</p>
            </div>
          `
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Resend error:', errorText);
                return NextResponse.json({ error: `Failed to send email: ${errorText}` }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true, message: 'OTP sent successfully' });

    } catch (error) {
        console.error('Send OTP error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

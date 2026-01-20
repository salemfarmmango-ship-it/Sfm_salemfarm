import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const adminId = request.cookies.get('admin_session')?.value;

        if (!adminId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
        }

        // Fetch admin
        const { data: admin, error: fetchError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', adminId)
            .single();

        if (fetchError || !admin) {
            return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, admin.password_hash);
        if (!isValidPassword) {
            return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Update password
        const { error: updateError } = await supabase
            .from('admin_users')
            .update({
                password_hash: newPasswordHash,
                updated_at: new Date().toISOString()
            })
            .eq('id', adminId);

        if (updateError) {
            console.error('Password update error:', updateError);
            return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

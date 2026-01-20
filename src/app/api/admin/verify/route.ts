import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(request: NextRequest) {
    try {
        const adminId = request.cookies.get('admin_session')?.value;

        if (!adminId) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        // Verify admin exists
        const { data: admin, error } = await supabase
            .from('admin_users')
            .select('id, email, name')
            .eq('id', adminId)
            .single();

        if (error || !admin) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        return NextResponse.json({
            authenticated: true,
            admin
        });

    } catch (error) {
        console.error('Admin verify error:', error);
        return NextResponse.json({ authenticated: false }, { status: 500 });
    }
}

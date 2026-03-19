import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const adminId = request.cookies.get('admin_session')?.value;

        if (!adminId) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        // Verify admin exists in MySQL sfm.users table via PHP backend
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin-verify.php?id=${encodeURIComponent(adminId)}`, {
            cache: 'no-store'
        });

        if (!res.ok) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const data = await res.json();

        if (!data.authenticated) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        return NextResponse.json({
            authenticated: true,
            admin: data.admin
        });

    } catch (error) {
        console.error('Admin verify error:', error);
        return NextResponse.json({ authenticated: false }, { status: 500 });
    }
}

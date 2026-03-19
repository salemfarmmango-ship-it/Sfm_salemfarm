import { NextRequest, NextResponse } from 'next/server';

/**
 * Verifies if the request is from an authenticated admin.
 * Uses the PHP backend to check the session against the MySQL database.
 */
export async function verifyAdmin(request: NextRequest): Promise<{ authenticated: boolean; admin?: any; token?: string }> {
    try {
        const adminId = request.cookies.get('admin_session')?.value;
        const token = request.cookies.get('sfm_token')?.value;

        if (!adminId || !token) {
            return { authenticated: false };
        }

        // Call the PHP verification endpoint
        const res = await fetch(`http://salemfarmmango.com/api/admin-verify.php?id=${encodeURIComponent(adminId)}`, {
            cache: 'no-store'
        });

        if (!res.ok) {
            return { authenticated: false };
        }

        const data = await res.json();
        return {
            authenticated: !!data.authenticated,
            admin: data.admin,
            token: data.token || token
        };
    } catch (error) {
        console.error('Admin Auth Helper Error:', error);
        return { authenticated: false };
    }
}

/**
 * Standard unauthorized response for admin routes.
 */
export function unauthorizedResponse() {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
}

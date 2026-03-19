import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true });

    // Clear admin session cookie and general auth token
    response.cookies.set('admin_session', '', { maxAge: 0, path: '/' });
    response.cookies.set('sfm_token', '', { maxAge: 0, path: '/' });

    return response;
}

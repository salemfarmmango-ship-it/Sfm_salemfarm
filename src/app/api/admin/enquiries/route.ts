
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export async function GET(request: NextRequest) {
    try {
        const adminSession = cookies().get('admin_session');
        if (!adminSession) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type') || 'bulk';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const date = searchParams.get('date');
        const offset = (page - 1) * limit;

        const table = type === 'bulk' ? 'bulk_enquiries' : 'corporate_enquiries';

        let query = supabase
            .from(table)
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status && status !== 'all') {
            if (status === 'new') {
                // Strict "Unread" view: Only 'new' and legacy active statuses
                // Excludes: read, accepted, rejected, resolved, completed
                if (type === 'bulk') {
                    query = query.in('status', ['new', 'contacted']);
                } else {
                    query = query.in('status', ['new', 'in-progress']);
                }
            } else {
                query = query.eq('status', status);
            }
        }

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query = query.gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString());
        }

        const { data, count, error } = await query;

        if (error) {
            console.error(`Error fetching ${type} enquiries:`, error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            data,
            count,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit)
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const adminSession = cookies().get('admin_session');
        if (!adminSession) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const body = await request.json();
        const { id, ids, status, type } = body;

        if ((!id && (!ids || ids.length === 0)) || !status || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const table = type === 'bulk' ? 'bulk_enquiries' : 'corporate_enquiries';

        let query = supabase.from(table).update({ status });

        if (ids && ids.length > 0) {
            query = query.in('id', ids);
        } else {
            query = query.eq('id', id);
        }

        const { error } = await query;

        if (error) {
            console.error(`Error updating ${type} enquiry status:`, error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const adminSession = cookies().get('admin_session');
        if (!adminSession) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const body = await request.json();
        const { ids, type } = body;

        if (!ids || ids.length === 0 || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const table = type === 'bulk' ? 'bulk_enquiries' : 'corporate_enquiries';

        const { error } = await supabase
            .from(table)
            .delete()
            .in('id', ids);

        if (error) {
            console.error(`Error deleting ${type} enquiries:`, error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

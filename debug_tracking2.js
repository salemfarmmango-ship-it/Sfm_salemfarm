const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://cqqoahxkhzzpnpvjhtui.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcW9haHhraHp6cG5wdmpodHVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODE0MzM0OSwiZXhwIjoyMDgzNzE5MzQ5fQ.kqn-oEVyzZSlVwbCjiK5Akd4wnuCg09fhv7qHiZGujg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase.from('orders').select('*').limit(1);

    let result = {};
    if (error) {
        result = { error };
    } else if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        result = {
            has_tracking_id: columns.includes('tracking_id'),
            has_courier_partner: columns.includes('courier_partner'),
            columns: columns
        };
    } else {
        result = { status: 'no_orders_found' };
    }

    fs.writeFileSync('db_check.json', JSON.stringify(result, null, 2));
}

test();

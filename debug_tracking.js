const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://cqqoahxkhzzpnpvjhtui.supabase.co';
// Use the service key to bypass RLS
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcW9haHhraHp6cG5wdmpodHVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODE0MzM0OSwiZXhwIjoyMDgzNzE5MzQ5fQ.kqn-oEVyzZSlVwbCjiK5Akd4wnuCg09fhv7qHiZGujg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Fetching one order to check columns...');
    const { data, error } = await supabase.from('orders').select('*').limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        if (data && data.length > 0) {
            console.log('Columns in orders table:');
            console.log(Object.keys(data[0]));
            if (Object.keys(data[0]).includes('tracking_id')) {
                console.log('SUCCESS: tracking_id column exists!');
            } else {
                console.log('FAILED: tracking_id column DOES NOT exist!');
            }
        } else {
            console.log('No orders found to test columns.');
        }
    }
}

test();

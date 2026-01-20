
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually parse .env
const envPath = path.resolve(__dirname, '.env');
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};

    const lines = envContent.split(/\r?\n/);
    lines.forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        const idx = line.indexOf('=');
        if (idx !== -1) {
            const key = line.substring(0, idx).trim();
            let value = line.substring(idx + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            envVars[key] = value;
        }
    });

    const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = envVars.SUPABASE_SERVICE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing env vars');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    async function check() {
        console.log('--- Detailed Bulk Enquiries Analysis ---');

        const { data, error, count } = await supabase
            .from('bulk_enquiries')
            .select('*', { count: 'exact' });

        if (error) {
            console.error('Error:', error.message);
            return;
        }

        console.log(`Total Bulk Records: ${count}`);

        if (data && data.length > 0) {
            console.log('Status Breakdown:');
            const counts = {};
            data.forEach(r => {
                counts[r.status] = (counts[r.status] || 0) + 1;
            });
            console.log(JSON.stringify(counts, null, 2));

            console.log('\nTop 5 Records (ID - Status - CreatedAt):');
            data.slice(0, 5).forEach(r => {
                console.log(`${r.id} - ${r.status} - ${r.created_at}`);
            });
        } else {
            console.log('No records found.');
        }
    }

    check();

} catch (err) {
    console.error('Error:', err);
}

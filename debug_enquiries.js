
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually parse .env
const envPath = path.resolve(__dirname, '.env');
console.log('Reading .env from:', envPath);

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};

    // Handle both \r\n and \n
    const lines = envContent.split(/\r?\n/);

    lines.forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;

        // Split by first equals sign
        const idx = line.indexOf('=');
        if (idx !== -1) {
            const key = line.substring(0, idx).trim();
            let value = line.substring(idx + 1).trim();

            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            envVars[key] = value;
            // console.log(`Parsed key: ${key}`); // Debug
        }
    });

    const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = envVars.SUPABASE_SERVICE_KEY;

    console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
    console.log('Key:', supabaseKey ? 'Found' : 'Missing');
    console.log('Service Key:', supabaseServiceKey ? 'Found' : 'Missing');

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing env vars');
        process.exit(1);
    }

    // Client 1: Anon
    const supabaseAnon = createClient(supabaseUrl, supabaseKey);

    // Client 2: Admin/Service Role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

    async function check() {
        console.log('--- Debugging Bulk Enquiries ---');

        // 1. Check with Service Role
        console.log('1. Fetching with Service Role...');
        const { data: adminData, error: adminError, count: adminCount } = await supabaseAdmin
            .from('bulk_enquiries')
            .select('*', { count: 'exact' });

        if (adminError) {
            console.error('Admin Fetch Error:', adminError);
        } else {
            console.log(`Admin Fetch Success: Found ${adminCount} records.`);
            if (adminData && adminData.length > 0) {
                console.log('Sample record status:', adminData[0].status);
            }
        }

        // 2. Check with Anon Role
        console.log('2. Fetching with Anon Role...');
        const { data: anonData, error: anonError, count: anonCount } = await supabaseAnon
            .from('bulk_enquiries')
            .select('*', { count: 'exact' });

        if (anonError) {
            console.error('Anon Fetch Error:', anonError);
        } else {
            console.log(`Anon Fetch Result: Found ${anonCount} records.`);
        }
    }

    check();

} catch (err) {
    console.error('Error reading .env:', err);
    process.exit(1);
}

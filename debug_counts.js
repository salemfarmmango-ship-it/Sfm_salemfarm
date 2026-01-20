
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
        console.log('--- Debugging Enquiries Statuses ---');

        // Check Bulk
        const { data: bulkData, error: bulkError } = await supabase
            .from('bulk_enquiries')
            .select('status');

        if (bulkError) console.error('Bulk Error:', bulkError.message);
        else {
            const counts = {};
            bulkData.forEach(r => counts[r.status] = (counts[r.status] || 0) + 1);
            console.log('Bulk Enquiries Counts by Status:', counts);
        }

        // Check Corporate
        const { data: corpData, error: corpError } = await supabase
            .from('corporate_enquiries')
            .select('status');

        if (corpError) console.error('Corporate Error:', corpError.message);
        else {
            const counts = {};
            corpData.forEach(r => counts[r.status] = (counts[r.status] || 0) + 1);
            console.log('Corporate Enquiries Counts by Status:', counts);
        }
    }

    check();

} catch (err) {
    console.error('Error:', err);
}


const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse .env
const envPath = path.resolve(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split(/\r?\n/).forEach(line => {
    const idx = line.indexOf('=');
    if (idx !== -1) envVars[line.substring(0, idx).trim()] = line.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_KEY);

async function checkUsers() {
    console.log('--- Checking Supabase Users ---');
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error('Error listing users:', error.message);
    } else {
        console.log('Total Users in Supabase:', users.length);
        users.slice(0, 5).forEach(u => {
            console.log(`- Email: ${u.email}, ID: ${u.id}, Phone: ${u.phone}`);
        });
    }
}

checkUsers();

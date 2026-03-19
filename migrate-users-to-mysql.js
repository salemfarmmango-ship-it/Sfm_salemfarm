
const { createClient } = require('@supabase/supabase-js');
const mysql = require('mysql2/promise');
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

async function migrate() {
    console.log('--- Starting User Migration ---');
    
    // Supabase
    const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_KEY);
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error('Supabase Error:', error.message);
        return;
    }
    console.log(`Fetched ${users.length} users from Supabase.`);

    // MySQL
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'sfm'
    });

    let migrated = 0;
    let skipped = 0;

    for (const u of users) {
        const [rows] = await connection.execute('SELECT id FROM users WHERE email = ?', [u.email]);
        if (rows.length > 0) {
            // Already exists by email
            skipped++;
            continue;
        }

        const [rowsById] = await connection.execute('SELECT id FROM users WHERE id = ?', [u.id]);
        if (rowsById.length > 0) {
            // Already exists by ID
            skipped++;
            continue;
        }

        // Try to get name from metadata
        const fullName = u.user_metadata?.full_name || u.user_metadata?.name || null;

        await connection.execute(
            'INSERT INTO users (id, email, full_name, role) VALUES (?, ?, ?, ?)',
            [u.id, u.email, fullName, 'customer']
        );
        migrated++;
    }

    console.log(`Migration completed. Migrated: ${migrated}, Skipped: ${skipped}`);
    await connection.end();
}

migrate();

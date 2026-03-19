<?php
// backend/migrate-users.php
require_once 'config.php';

// Manually parse .env from root
$envFile = __DIR__ . '/../.env';
$env = [];
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $env[trim($name)] = trim($value, " \t\n\r\0\x0B\"'");
    }
}

$supabaseUrl = $env['NEXT_PUBLIC_SUPABASE_URL'] ?? '';
$supabaseKey = $env['SUPABASE_SERVICE_KEY'] ?? '';

if (!$supabaseUrl || !$supabaseKey) {
    die("Missing Supabase credentials in .env\n");
}

echo "--- Starting User Migration (PHP) ---\n";

// Fetch users from Supabase Admin API
// GET /auth/v1/admin/users
$ch = curl_init($supabaseUrl . "/auth/v1/admin/users");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "apikey: " . $supabaseKey,
    "Authorization: Bearer " . $supabaseKey
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    die("Failed to fetch users from Supabase. HTTP Code: $httpCode\nResponse: $response\n");
}

$data = json_decode($response, true);
$users = $data['users'] ?? [];

echo "Found " . count($users) . " users in Supabase.\n";

$migrated = 0;
$skipped = 0;

foreach ($users as $u) {
    $email = $u['email'];
    $id = $u['id'];
    $fullName = $u['user_metadata']['full_name'] ?? $u['user_metadata']['name'] ?? null;

    // Check if exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR id = ?");
    $stmt->execute([$email, $id]);
    if ($stmt->fetch()) {
        $skipped++;
        continue;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO users (id, email, full_name, role) VALUES (?, ?, ?, 'customer')");
        $stmt->execute([$id, $email, $fullName]);
        $migrated++;
    } catch (Exception $e) {
        echo "Error migrating $email: " . $e->getMessage() . "\n";
    }
}

echo "Migration completed.\nMigrated: $migrated\nSkipped: $skipped\n";
?>

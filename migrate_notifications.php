<?php
// migrate_notifications.php
require_once 'backend/config.php';

// Robust .env parsing
$supabaseUrl = '';
$supabaseKey = '';
if (file_exists('.env')) {
    $lines = file('.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = array_pad(explode('=', $line, 2), 2, null);
        if ($name === 'NEXT_PUBLIC_SUPABASE_URL') $supabaseUrl = trim($value);
        if ($name === 'SUPABASE_SERVICE_KEY') $supabaseKey = trim($value);
    }
}

if (!$supabaseUrl || !$supabaseKey) {
    die("Supabase credentials not found in .env\n");
}

echo "Fetching notification tokens from Supabase...\n";

$url = $supabaseUrl . "/rest/v1/notification_tokens?select=*";
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "apikey: $supabaseKey",
    "Authorization: Bearer $supabaseKey"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    die("Error fetching from Supabase: HTTP $httpCode\n$response\n");
}

$tokens = json_decode($response, true);
if (!is_array($tokens)) {
    die("Invalid response from Supabase: $response\n");
}

echo "Found " . count($tokens) . " tokens. Importing to MySQL...\n";

$stmt = $pdo->prepare("INSERT IGNORE INTO notification_tokens (token, user_id, device_info, created_at, updated_at) VALUES (?, ?, ?, ?, ?)");

$count = 0;
foreach ($tokens as $t) {
    $deviceInfo = is_array($t['device_info']) ? json_encode($t['device_info']) : $t['device_info'];
    
    // Convert Supabase UUID to MySQL string if needed (though both are strings here)
    $userId = $t['user_id'];
    
    try {
        $stmt->execute([
            $t['token'],
            $userId,
            $deviceInfo,
            $t['created_at'],
            $t['updated_at']
        ]);
        if ($stmt->rowCount() > 0) $count++;
    } catch (Exception $e) {
        echo "Error importing token " . substr($t['token'], 0, 10) . "...: " . $e->getMessage() . "\n";
    }
}

echo "Migration completed. Imported $count new tokens.\n";
?>

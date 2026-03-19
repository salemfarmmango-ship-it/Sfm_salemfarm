<?php
// backend/test-email.php
require_once 'config.php';

// Manually parse .env from root
$envFile = __DIR__ . '/../.env';
$env = [];
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $env[trim($parts[0])] = trim($parts[1], " \t\n\r\0\x0B\"'");
        }
    }
}

$apiKey = $env['RESEND_API_KEY'] ?? '';
echo "API Key Found: " . ($apiKey ? substr($apiKey, 0, 8) . "..." : "NONE") . "\n";

if (!$apiKey) {
    die("Error: RESEND_API_KEY not found in .env\n");
}

$testEmail = "prasannab.tech40@gmail.com"; // From your Supabase list
$subject = "Test Email from Salem Farm Mango";
$html = "<h1>Test Email</h1><p>If you see this, the Resend API is working correctly.</p>";

$postData = json_encode([
    'from' => 'Salem Farm <no-reply@salemfarmmango.com>',
    'to' => $testEmail,
    'subject' => $subject,
    'html' => $html
]);

$ch = curl_init('https://api.resend.com/emails');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";
if ($curlError) {
    echo "CURL Error: $curlError\n";
}
?>

<?php
// backend/api/public-settings.php
// Public read-only endpoint for store settings needed on public-facing pages (e.g. Contact Us)
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['error' => 'Method not allowed'], 405);
}

// Only expose safe, public-facing keys
$publicKeys = [
    'store_name',
    'store_phone',
    'store_email',
    'store_address',
    'store_location',
    'store_hours',
    'whatsapp_number',
    'instagram_posts',
    'top_bar_content',
    'top_bar_enabled',
    'payment_cod_enabled',
];

$placeholders = implode(',', array_fill(0, count($publicKeys), '?'));
$stmt = $pdo->prepare("SELECT setting_key, setting_value FROM store_settings WHERE setting_key IN ($placeholders)");
$stmt->execute($publicKeys);
$rows = $stmt->fetchAll();

$settings = [];
foreach ($rows as $row) {
    $val = $row['setting_value'];
    if ($val === 'true') $val = true;
    if ($val === 'false') $val = false;
    $settings[$row['setting_key']] = $val;
}

sendJson(['settings' => $settings]);
?>

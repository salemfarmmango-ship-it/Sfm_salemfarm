<?php
/**
 * API Endpoints Check
 * Access: https://salemfarmmango.com/api/check-endpoints.php
 */

header('Content-Type: application/json');

$apiDir = __DIR__;
$files = [];

// Get all PHP files in api directory
$phpFiles = glob($apiDir . '/*.php');
if ($phpFiles) {
    foreach ($phpFiles as $file) {
        $filename = basename($file);
        $files['root'][] = $filename;
    }
}

// Check subdirectories
$subdirs = glob($apiDir . '/*', GLOB_ONLYDIR);
if ($subdirs) {
    foreach ($subdirs as $dir) {
        $dirname = basename($dir);
        $subfiles = glob($dir . '/*.php');
        if ($subfiles) {
            foreach ($subfiles as $file) {
                $filename = basename($file);
                $files[$dirname][] = $filename;
            }
        }
    }
}

// List of expected endpoints
$expectedEndpoints = [
    'root' => [
        'products.php',
        'categories.php',
        'orders.php',
        'settings.php',
        'hero-slides.php',
        'coupons.php',
        'enquiries.php',
        'notifications.php'
    ],
    'auth' => [
        'login.php',
        'signup.php',
        'me.php',
        'logout.php'
    ]
];

// Check what's missing
$missing = [];
foreach ($expectedEndpoints as $location => $endpoints) {
    foreach ($endpoints as $endpoint) {
        if (!isset($files[$location]) || !in_array($endpoint, $files[$location])) {
            if (!isset($missing[$location])) $missing[$location] = [];
            $missing[$location][] = $endpoint;
        }
    }
}

echo json_encode([
    'status' => 'endpoint_check',
    'found_files' => $files,
    'missing_files' => $missing,
    'api_directory' => $apiDir
], JSON_PRETTY_PRINT);
?>

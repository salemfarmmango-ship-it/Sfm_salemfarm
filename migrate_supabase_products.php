<?php
// migrate_supabase_products.php
require 'backend/config.php';

$envContent = file_get_contents('.env');
preg_match('/NEXT_PUBLIC_SUPABASE_URL=(.*)/', $envContent, $urlMatch);
preg_match('/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/', $envContent, $keyMatch);
$url = trim($urlMatch[1] ?? '');
$key = trim($keyMatch[1] ?? '');

echo "Supabase URL: $url\n";

function fetchSupabase($table, $url, $key) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$url/rest/v1/$table?select=*");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "apikey: $key",
        "Authorization: Bearer $key"
    ]);
    
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        echo "Failed to fetch $table. HTTP $httpCode\n";
        echo $result . "\n";
        return [];
    }
    
    return json_decode($result, true) ?: [];
}

try {
    $pdo->beginTransaction();
    
    // We will just fetch and dump the first item to see the architecture
    $categories = fetchSupabase('categories', $url, $key);
    echo "Found " . count($categories) . " categories.\n";
    if (count($categories) > 0) print_r($categories[0]);
    
    $products = fetchSupabase('products', $url, $key);
    echo "Found " . count($products) . " products.\n";
    if (count($products) > 0) print_r($products[0]);
    
    $variations = fetchSupabase('product_variations', $url, $key);
    echo "Found " . count($variations) . " variations.\n";
    if (count($variations) > 0) print_r($variations[0]);
    
    $pdo->commit();
} catch (Exception $e) {
    $pdo->rollBack();
    echo "Error: " . $e->getMessage() . "\n";
}

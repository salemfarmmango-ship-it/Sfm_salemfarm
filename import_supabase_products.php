<?php
// import_supabase_products.php
require 'backend/config.php';

// Load env credentials manually
$envContent = file_get_contents('.env');
preg_match('/NEXT_PUBLIC_SUPABASE_URL=(.*)/', $envContent, $urlMatch);
preg_match('/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/', $envContent, $keyMatch);
$url = trim($urlMatch[1] ?? '');
$key = trim($keyMatch[1] ?? '');

if (!$url || !$key) {
    die("Error: Supabase credentials not found in .env\n");
}

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
        return [];
    }
    
    return json_decode($result, true) ?: [];
}

try {
    echo "Fetching data from Supabase...\n";
    $categories = fetchSupabase('categories', $url, $key);
    $products = fetchSupabase('products', $url, $key);

    echo "Found " . count($categories) . " categories and " . count($products) . " products.\n";

    $pdo->beginTransaction();
    
    // Disable FK checks to seamlessly insert IDs
    $pdo->exec("SET FOREIGN_KEY_CHECKS=0");

    // 1. Import Categories
    $catStmt = $pdo->prepare("
        INSERT INTO categories (id, name, slug, image_url, created_at) 
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            name=VALUES(name), slug=VALUES(slug), image_url=VALUES(image_url)
    ");

    $importedCats = 0;
    foreach ($categories as $cat) {
        $catStmt->execute([
            $cat['id'],
            $cat['name'],
            $cat['slug'],
            $cat['image_url'] ?? null,
            $cat['created_at'] ?? date('Y-m-d H:i:s')
        ]);
        $importedCats++;
    }
    echo "✅ Imported/Updated $importedCats Categories.\n";

    // 2. Import Products
    $prodStmt = $pdo->prepare("
        INSERT INTO products (
            id, category_id, name, description, price, original_price, stock, 
            images, highlights, specifications, size, stock_status, is_featured, 
            is_seasonal, season_over, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            category_id=VALUES(category_id), name=VALUES(name), description=VALUES(description),
            price=VALUES(price), original_price=VALUES(original_price), stock=VALUES(stock),
            images=VALUES(images), highlights=VALUES(highlights), specifications=VALUES(specifications),
            size=VALUES(size), stock_status=VALUES(stock_status), is_featured=VALUES(is_featured),
            is_seasonal=VALUES(is_seasonal), season_over=VALUES(season_over)
    ");

    $importedProds = 0;
    foreach ($products as $prod) {
        // Enforce types safely mapped from JSON
        $images = isset($prod['images']) ? (is_array($prod['images']) ? json_encode($prod['images']) : $prod['images']) : '[]';
        $highlights = isset($prod['highlights']) ? (is_array($prod['highlights']) ? json_encode($prod['highlights']) : $prod['highlights']) : '[]';
        $specs = isset($prod['specifications']) ? (is_array($prod['specifications']) ? json_encode($prod['specifications']) : $prod['specifications']) : '[]';

        $prodStmt->execute([
            $prod['id'],
            $prod['category_id'] ?? null,
            $prod['name'],
            $prod['description'] ?? '',
            $prod['price'] ?? 0,
            $prod['original_price'] ?? null,
            $prod['stock'] ?? 0,
            $images,
            $highlights,
            $specs,
            $prod['size'] ?? '',
            $prod['stock_status'] ?? 'In Stock',
            isset($prod['is_featured']) && $prod['is_featured'] ? 1 : 0,
            isset($prod['is_seasonal']) && $prod['is_seasonal'] ? 1 : 0,
            isset($prod['season_over']) && $prod['season_over'] ? 1 : 0,
            $prod['created_at'] ?? date('Y-m-d H:i:s')
        ]);
        $importedProds++;
    }
    echo "✅ Imported/Updated $importedProds Products.\n";

    $pdo->exec("SET FOREIGN_KEY_CHECKS=1");
    $pdo->commit();

    echo "\n🎉 Migration completed successfully!\n";

} catch (Exception $e) {
    $pdo->rollBack();
    $pdo->exec("SET FOREIGN_KEY_CHECKS=1");
    echo "❌ Error during migration: " . $e->getMessage() . "\n";
}

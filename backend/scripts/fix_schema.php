<?php
// backend/scripts/fix_schema.php
require_once __DIR__ . '/../config.php';

try {
    // Check if columns exist
    $stmt = $pdo->query("DESCRIBE products");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $requiredColumns = [
        'highlights' => 'ALTER TABLE products ADD COLUMN highlights JSON AFTER origin_price',
        'specifications' => 'ALTER TABLE products ADD COLUMN specifications JSON AFTER highlights'
    ];

    // Wait, origin_price might be original_price
    $originalPriceCol = in_array('original_price', $columns) ? 'original_price' : 'price';

    if (!in_array('highlights', $columns)) {
        echo "Adding highlights column...\n";
        $pdo->exec("ALTER TABLE products ADD COLUMN highlights JSON AFTER $originalPriceCol");
    }
    
    if (!in_array('specifications', $columns)) {
        echo "Adding specifications column...\n";
        $pdo->exec("ALTER TABLE products ADD COLUMN specifications JSON AFTER highlights");
    }

    echo "Schema check completed successfully.\n";

} catch (Exception $e) {
    echo "Error updating schema: " . $e->getMessage() . "\n";
}
?>

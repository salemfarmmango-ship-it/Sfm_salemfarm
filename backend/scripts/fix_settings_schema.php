<?php
// backend/scripts/fix_settings_schema.php
require_once __DIR__ . '/../config.php';

try {
    echo "Updating store_settings table to key-value structure...\n";
    
    // Check if it's the old structure
    $res = $pdo->query("SHOW TABLES LIKE 'store_settings'");
    if ($res->rowCount() > 0) {
        $stmt = $pdo->query("DESCRIBE store_settings");
        $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
        if (in_array('announcement_text', $cols)) {
            echo "Dropping old store_settings table...\n";
            $pdo->exec("DROP TABLE IF EXISTS store_settings");
        }
    }

    echo "Creating new store_settings table...\n";
    $pdo->exec("CREATE TABLE IF NOT EXISTS store_settings (
        `setting_key` VARCHAR(100) PRIMARY KEY,
        `setting_value` TEXT,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    // Insert defaults
    echo "Inserting defaults...\n";
    $pdo->exec("INSERT IGNORE INTO store_settings (`setting_key`, `setting_value`) VALUES ('top_bar_content', 'Welcome to Salem Farm Mango!')");
    $pdo->exec("INSERT IGNORE INTO store_settings (`setting_key`, `setting_value`) VALUES ('top_bar_enabled', 'true')");
    $pdo->exec("INSERT IGNORE INTO store_settings (`setting_key`, `setting_value`) VALUES ('payment_cod_enabled', 'false')");

    echo "Settings schema updated successfully.\n";

} catch (Exception $e) {
    echo "Error updating settings schema: " . $e->getMessage() . "\n";
}
?>

<?php
require_once '../config.php';

try {
    // Check if columns exist
    $pdo->exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_partner VARCHAR(50)");
    $pdo->exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_delhivery_automated BOOLEAN DEFAULT FALSE");
    $pdo->exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS label_url VARCHAR(255)");
    
    echo json_encode(["success" => true, "message" => "Orders table updated with Delhivery columns"]);
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo json_encode(["success" => true, "message" => "Columns already exist"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>

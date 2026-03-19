<?php
require_once 'config.php';
try {
    $stmt = $pdo->query("SELECT phone FROM addresses WHERE phone IS NOT NULL LIMIT 20");
    echo "Phone formats in addresses:\n";
    while($row = $stmt->fetch()) {
        echo "- '" . $row['phone'] . "'\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>

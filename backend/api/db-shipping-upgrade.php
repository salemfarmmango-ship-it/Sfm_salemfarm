<?php
// backend/api/db-shipping-upgrade.php
require_once '../config.php';

try {
    // Update Tamil Nadu rate to 50
    $stmt1 = $pdo->prepare("UPDATE shipping_rates SET charge = 50 WHERE state_name = 'Tamil Nadu'");
    $stmt1->execute();

    // Update Puducherry rate to 50
    $stmt2 = $pdo->prepare("UPDATE shipping_rates SET charge = 50 WHERE state_name = 'Puducherry'");
    $stmt2->execute();

    sendJson(['success' => true, 'message' => 'Shipping rates updated successfully.']);
} catch (Exception $e) {
    sendJson(['error' => $e->getMessage()], 500);
}
?>

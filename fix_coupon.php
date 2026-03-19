<?php
require_once 'backend/config.php';

$code = 'MANGO20';
$stmt = $pdo->prepare("UPDATE coupons SET min_order_amount = 0, max_discount = NULL, is_active = 1 WHERE code = ?");
$stmt->execute([$code]);

echo "Coupon $code updated successfully.";
?>

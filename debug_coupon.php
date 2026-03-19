<?php
require_once 'backend/config.php';

$code = 'MANGO20';
$stmt = $pdo->prepare("SELECT * FROM coupons WHERE code = ?");
$stmt->execute([$code]);
$coupon = $stmt->fetch();

if ($coupon) {
    echo json_encode($coupon, JSON_PRETTY_PRINT);
} else {
    echo "Coupon $code not found.";
}
?>

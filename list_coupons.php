<?php
require_once 'backend/config.php';
$stmt = $pdo->query('SELECT * FROM coupons');
echo json_encode($stmt->fetchAll(), JSON_PRETTY_PRINT);
?>

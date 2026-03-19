<?php
require_once 'backend/config.php';

$stmt = $pdo->prepare('UPDATE products SET season_over = ?, is_featured = ? WHERE id = 1');
$stmt->execute([1, 1]);

$stmt2 = $pdo->query('SELECT is_featured, season_over FROM products WHERE id=1');
echo json_encode($stmt2->fetch());

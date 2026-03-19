<?php
require_once 'config.php';
echo "PHP Time: " . date('Y-m-d H:i:s') . "\n";
$stmt = $pdo->query("SELECT NOW() as now");
$row = $stmt->fetch();
echo "MySQL Time (NOW()): " . $row['now'] . "\n";
?>

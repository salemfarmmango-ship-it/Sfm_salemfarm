<?php
require 'backend/config.php';
$stmt = $pdo->query("SELECT id, email, full_name, role FROM users LIMIT 10");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($users);

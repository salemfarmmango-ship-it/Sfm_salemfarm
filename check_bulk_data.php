<?php
require 'backend/config.php';
$stmt = $pdo->query("SELECT * FROM bulk_enquiries ORDER BY created_at DESC LIMIT 5");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

<?php
require 'backend/config.php';
$stmt = $pdo->query("DESCRIBE bulk_enquiries");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

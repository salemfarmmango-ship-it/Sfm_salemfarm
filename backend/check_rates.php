<?php
$host = 'localhost';
$db   = 'sfm';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $stmt = $pdo->query("SELECT * FROM shipping_rates");
    $rates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    header('Content-Type: application/json');
    echo json_encode($rates);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>

<?php
require_once 'config.php';
try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute(['322abfa9-6e8a-4763-a898-47dfca23ddfd']);
    $user = $stmt->fetch();
    echo "User 322abfa9... Search Result:\n";
    if ($user) {
        print_r($user);
    } else {
        echo "Not found in users table.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>

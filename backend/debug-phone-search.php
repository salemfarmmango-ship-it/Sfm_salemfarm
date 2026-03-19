<?php
require_once 'config.php';
try {
    $phones = ['7548898551', '6383702551', '9992376523', '9892557902', '9677750456', '9741636001', '9443102715'];
    echo "Searching for phone-based emails in 'users' table:\n";
    foreach ($phones as $p) {
        $e = "{$p}@phone.salemfarmmango.local";
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$e]);
        $user = $stmt->fetch();
        if ($user) {
            echo "- Found: $p -> " . $user['email'] . "\n";
        } else {
            echo "- NOT Found: $p -> $e\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>

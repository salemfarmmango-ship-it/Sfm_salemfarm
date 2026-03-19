<?php
require_once 'config.php';
try {
    $stmt = $pdo->query("SELECT DISTINCT phone FROM addresses");
    $phones = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Testing " . count($phones) . " unique phone numbers from addresses...\n";
    
    $failCount = 0;
    foreach ($phones as $p) {
        $identifier = $p;
        $type = 'phone';
        $purpose = 'reset';
        
        $emailToCheck = "{$identifier}@phone.salemfarmmango.local";
        $stmt2 = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt2->execute([$emailToCheck]);
        $userExists = $stmt2->fetch();
        
        $found = false;
        if ($userExists) {
            $found = true;
        } else {
            $stmt3 = $pdo->prepare("SELECT user_id FROM addresses WHERE phone = ? LIMIT 1");
            $stmt3->execute([$identifier]);
            if ($stmt3->fetch()) {
                $found = true;
            }
        }
        
        if (!$found) {
            echo "FAILURE for phone: |$p|\n";
            $failCount++;
        }
    }
    echo "Test completed. Total Failures: $failCount\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>

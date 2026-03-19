<?php
require_once 'c:/xampp/htdocs/SFM/backend/config.php';

try {
    $stmt = $pdo->query("SHOW TABLES LIKE 'blogs'");
    $exists = $stmt->fetch();
    if (!$exists) {
        echo "Table 'blogs' does NOT exist.\n";
        exit;
    }
    echo "Table 'blogs' exists.\n";

    $stmt = $pdo->query("SELECT COUNT(*) as count FROM blogs");
    $total = $stmt->fetch();
    echo "Total blogs: " . $total['count'] . "\n";

    $stmt = $pdo->query("SELECT COUNT(*) as count FROM blogs WHERE status = 'published'");
    $published = $stmt->fetch();
    echo "Published blogs: " . $published['count'] . "\n";

    $stmt = $pdo->query("SELECT * FROM blogs LIMIT 5");
    $rows = $stmt->fetchAll();
    echo "First 5 blogs:\n";
    print_r($rows);

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>

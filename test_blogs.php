<?php
require 'backend/config.php';
$stmt = $pdo->query("SELECT id, title, content FROM blogs LIMIT 3");
$blogs = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach($blogs as $b) {
    echo "ID: " . $b['id'] . "\nTitle: " . $b['title'] . "\nContent starts with: " . substr($b['content'], 0, 200) . "\n\n";
}

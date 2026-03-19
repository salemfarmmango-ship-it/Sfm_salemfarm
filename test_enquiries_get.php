<?php
require 'backend/config.php';
// Mock $_GET and $method to test enquiries.php logic exactly as it is without HTTP overhead
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['type'] = 'bulk';
$_GET['status'] = 'new';
$_GET['page'] = 1;

// We must bypass requireAuth for the test script
// Normally requireAuth throws an error or dies.
// Let's just create a modified copy of enquiries.php locally to test the query logic.

$table = 'bulk_enquiries';
$page = 1;
$limit = 10;
$status = 'new';
$date = null;
$offset = ($page - 1) * $limit;

$query = "SELECT * FROM {$table} WHERE 1=1";
$countQuery = "SELECT COUNT(*) FROM {$table} WHERE 1=1";
$params = [];

if ($status !== 'all') {
    $query .= " AND status = ?";
    $countQuery .= " AND status = ?";
    $params[] = $status;
}

$stmtCount = $pdo->prepare($countQuery);
$stmtCount->execute($params);
$totalCount = $stmtCount->fetchColumn();

$query .= " ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
$stmt = $pdo->prepare($query);
$stmt->execute($params);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

print_r(['total' => $totalCount, 'data' => count($data)]);

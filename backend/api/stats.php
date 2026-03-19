<?php
// backend/api/stats.php
require_once '../config.php';
require_once '../jwt.php';

// Only admins can access stats
$user = requireAuth();
if ($user['role'] !== 'admin') {
    sendJson(['error' => 'Forbidden'], 403);
}

try {
    // 1. Total Revenue (Paid orders)
    $revenueStmt = $pdo->query("SELECT SUM(total_amount) as total FROM orders WHERE payment_status = 'paid'");
    $revenue = $revenueStmt->fetch()['total'] ?? 0;

    // 2. Total Orders
    $ordersStmt = $pdo->query("SELECT COUNT(*) as total FROM orders");
    $totalOrders = $ordersStmt->fetch()['total'] ?? 0;

    // 3. Total Products
    $productsStmt = $pdo->query("SELECT COUNT(*) as total FROM products");
    $totalProducts = $productsStmt->fetch()['total'] ?? 0;

    // 4. Total Customers (Unique users with roles='user')
    $customersStmt = $pdo->query("SELECT COUNT(*) as total FROM users WHERE role = 'user'");
    $totalCustomers = $customersStmt->fetch()['total'] ?? 0;

    // 5. Recent Orders
    $recentOrdersStmt = $pdo->query("SELECT o.*, u.full_name as customer_name FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5");
    $recentOrders = $recentOrdersStmt->fetchAll();

    // 6. Recent Reviews
    $recentReviewsStmt = $pdo->query("SELECT r.*, p.name as product_name FROM reviews r JOIN products p ON r.product_id = p.id ORDER BY r.created_at DESC LIMIT 5");
    $recentReviews = $recentReviewsStmt->fetchAll();

    sendJson([
        'revenue' => (float)$revenue,
        'orders' => (int)$totalOrders,
        'products' => (int)$totalProducts,
        'customers' => (int)$totalCustomers,
        'recentOrders' => $recentOrders,
        'recentReviews' => $recentReviews
    ]);

} catch (Exception $e) {
    sendJson(['error' => $e->getMessage()], 500);
}
?>

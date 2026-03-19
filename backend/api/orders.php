<?php
// backend/api/orders.php
require_once '../config.php';
require_once '../jwt.php';

$user = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            // Get single order with items
            $stmt = $pdo->prepare("SELECT o.*, u.full_name as customer_name, u.email as customer_email FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?");
            $stmt->execute([$id]);
            $order = $stmt->fetch();
            
            if (!$order) {
                sendJson(['error' => 'Order not found'], 404);
            }

            // Check permission
            if ($user['role'] !== 'admin' && $order['user_id'] !== $user['sub']) {
                sendJson(['error' => 'Forbidden'], 403);
            }

            $order['shipping_address'] = json_decode($order['shipping_address'], true);

            // Fetch Items
            $itemStmt = $pdo->prepare("SELECT oi.*, p.name, p.images, p.size FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?");
            $itemStmt->execute([$id]);
            $items = $itemStmt->fetchAll();
            
            foreach ($items as &$item) {
                $item['images'] = json_decode($item['images'], true) ?: [];
            }
            $order['order_items'] = $items;

            sendJson($order);
        } else {
            // List / Search orders
            $status = $_GET['status'] ?? null;
            $date = $_GET['date'] ?? null;
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $pageSize = isset($_GET['limit']) ? (int)$_GET['limit'] : 15;
            $offset = ($page - 1) * $pageSize;

            $query = "SELECT o.*, u.full_name as customer_name FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE 1=1";
            $countQuery = "SELECT COUNT(*) FROM orders o WHERE 1=1";
            $params = [];

            if ($user['role'] !== 'admin') {
                $query .= " AND o.user_id = ?";
                $countQuery .= " AND o.user_id = ?";
                $params[] = $user['sub'];
            }

            if ($status) {
                $query .= " AND o.status = ?";
                $countQuery .= " AND o.status = ?";
                $params[] = $status;
            }

            if ($date) {
                $query .= " AND DATE(o.created_at) = ?";
                $countQuery .= " AND DATE(o.created_at) = ?";
                $params[] = $date;
            }

            // Get count for pagination
            $stmtCount = $pdo->prepare($countQuery);
            $stmtCount->execute($params);
            $totalCount = $stmtCount->fetchColumn();

            $query .= " ORDER BY o.created_at DESC LIMIT $pageSize OFFSET $offset";
            
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $orders = $stmt->fetchAll();

            foreach ($orders as &$o) {
                $o['shipping_address'] = json_decode($o['shipping_address'], true);
                // For frontend compatibility
                $o['profiles'] = ['full_name' => $o['customer_name']];
            }

            sendJson([
                'data' => $orders,
                'count' => (int)$totalCount,
                'page' => $page,
                'limit' => $pageSize,
                'totalPages' => ceil($totalCount / $pageSize)
            ]);
        }
        break;

    case 'POST':
        // Regular user create order
        $input = json_decode(file_get_contents('php://input'), true);
        $totalAmount = $input['total_amount'] ?? 0;
        $shippingAddress = isset($input['shipping_address']) ? json_encode($input['shipping_address']) : null;
        $items = $input['items'] ?? []; 
        $paymentStatus = $input['payment_status'] ?? 'processing';
        $paymentId = $input['payment_id'] ?? null;

        if (!$totalAmount || empty($items)) {
            sendJson(['error' => 'Invalid order data'], 400);
        }

        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("INSERT INTO orders (user_id, total_amount, status, payment_status, payment_id, shipping_address) VALUES (?, ?, 'pending', ?, ?, ?)");
            $stmt->execute([$user['sub'], $totalAmount, $paymentStatus, $paymentId, $shippingAddress]);
            $orderId = $pdo->lastInsertId();

            $itemStmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
            foreach ($items as $item) {
                $itemStmt->execute([$orderId, $item['product_id'], $item['quantity'], $item['price']]);
            }

            $pdo->commit();
            sendJson(['success' => true, 'id' => (int)$orderId]);
        } catch (Exception $e) {
            $pdo->rollBack();
            sendJson(['error' => 'Failed to create order: ' . $e->getMessage()], 500);
        }
        break;

    case 'PUT':
    case 'PATCH':
        // Admin update status or details
        if ($user['role'] !== 'admin') {
            sendJson(['error' => 'Forbidden'], 403);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $ids = $input['ids'] ?? ($id ? [$id] : []);
        
        if (empty($ids)) {
            sendJson(['error' => 'Missing order ID(s)'], 400);
        }

        $status = $input['status'] ?? null;
        $paymentStatus = $input['payment_status'] ?? null;
        $trackingId = $input['tracking_id'] ?? null;
        $courierPartner = $input['courier_partner'] ?? null;
        $isDelhiveryAutomated = isset($input['is_delhivery_automated']) ? ($input['is_delhivery_automated'] ? 1 : 0) : null;
        $labelUrl = $input['label_url'] ?? null;

        $fields = [];
        $params = [];
        
        if ($status) { $fields[] = "status = ?"; $params[] = $status; }
        if ($paymentStatus) { $fields[] = "payment_status = ?"; $params[] = $paymentStatus; }
        if ($trackingId !== null) { $fields[] = "tracking_id = ?"; $params[] = $trackingId; }
        if ($courierPartner !== null) { $fields[] = "courier_partner = ?"; $params[] = $courierPartner; }
        if ($isDelhiveryAutomated !== null) { $fields[] = "is_delhivery_automated = ?"; $params[] = $isDelhiveryAutomated; }
        if ($labelUrl !== null) { $fields[] = "label_url = ?"; $params[] = $labelUrl; }

        if (empty($fields)) {
            sendJson(['error' => 'Nothing to update'], 400);
        }

        try {
            // Build bulk update query
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $sql = "UPDATE orders SET " . implode(', ', $fields) . " WHERE id IN ($placeholders)";
            
            // Merge params: field values then IDs
            $finalParams = array_merge($params, $ids);
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($finalParams);
            
            sendJson(['success' => true, 'updated' => $stmt->rowCount()]);
        } catch (Exception $e) {
            sendJson(['error' => $e->getMessage()], 500);
        }
        break;

    case 'DELETE':
        if ($user['role'] !== 'admin') {
            sendJson(['error' => 'Forbidden'], 403);
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $ids = $input['ids'] ?? ($id ? [$id] : []);

        if (empty($ids)) {
            sendJson(['error' => 'Missing ID(s)'], 400);
        }

        try {
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $stmt = $pdo->prepare("DELETE FROM orders WHERE id IN ($placeholders)");
            $stmt->execute($ids);
            sendJson(['success' => true]);
        } catch (Exception $e) {
            sendJson(['error' => $e->getMessage()], 500);
        }
        break;

    default:
        sendJson(['error' => 'Method not allowed'], 405);
}
?>

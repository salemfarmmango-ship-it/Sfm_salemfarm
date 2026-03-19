<?php
// backend/api/coupons.php
require_once '../config.php';
require_once '../jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        // If code is provided, it's a public validation request
        $validateCode = $_GET['code'] ?? null;
        if ($validateCode) {
            $stmt = $pdo->prepare("SELECT id, code, discount_type, discount_value, max_discount, min_order_amount, is_active FROM coupons WHERE code = ? AND is_active = 1 LIMIT 1");
            $stmt->execute([strtoupper($validateCode)]);
            $coupon = $stmt->fetch();
            
            if (!$coupon) {
                sendJson(['error' => 'Invalid or expired coupon code'], 404);
            }

            // Get restricted products if any
            $stmt = $pdo->prepare("SELECT product_id FROM coupon_products WHERE coupon_id = ?");
            $stmt->execute([$coupon['id']]);
            $coupon['product_ids'] = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            // Format for frontend
            $coupon['min_order_value'] = (float)$coupon['min_order_amount'];
            $coupon['max_discount_value'] = $coupon['max_discount'] !== null ? (float)$coupon['max_discount'] : null;
            $coupon['discount_value'] = (float)$coupon['discount_value'];
            $coupon['is_active'] = (bool)$coupon['is_active'];
            
            sendJson($coupon);
            break;
        }

        // Otherwise, require admin auth for listing
        $user = requireAuth();
        if ($user['role'] !== 'admin') sendJson(['error' => 'Forbidden'], 403);

        $stmt = $pdo->query("SELECT id, code, discount_type, discount_value, max_discount, min_order_amount, is_active, created_at FROM coupons ORDER BY created_at DESC");
        $coupons = $stmt->fetchAll();

        // Map database fields to frontend expected fields and fetch product IDs
        foreach ($coupons as &$c) {
            $c['min_order_value'] = (float)$c['min_order_amount'];
            $c['max_discount_value'] = $c['max_discount'] !== null ? (float)$c['max_discount'] : null;
            $c['discount_value'] = (float)$c['discount_value'];
            $c['is_active'] = (bool)$c['is_active'];

            // Fetch associated product IDs
            $stmt = $pdo->prepare("SELECT product_id FROM coupon_products WHERE coupon_id = ?");
            $stmt->execute([$c['id']]);
            $c['product_ids'] = $stmt->fetchAll(PDO::FETCH_COLUMN);
        }

        sendJson($coupons);
        break;

    case 'POST':
        $user = requireAuth();
        if ($user['role'] !== 'admin') sendJson(['error' => 'Forbidden'], 403);

        $input = json_decode(file_get_contents('php://input'), true);
        $code = strtoupper($input['code'] ?? '');
        $discount_type = $input['discount_type'] ?? 'percentage';
        $discount_value = $input['discount_value'] ?? 0;
        $min_order_amount = $input['min_order_value'] ?? 0;
        $max_discount = $input['max_discount_value'] ?? null;
        $is_active = isset($input['is_active']) ? (bool)$input['is_active'] : true;

        if (!$code || !$discount_value) {
            sendJson(['error' => 'Missing required fields'], 400);
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount, is_active) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$code, $discount_type, $discount_value, $min_order_amount, $max_discount, $is_active ? 1 : 0]);
            $newId = $pdo->lastInsertId();

            // Save product associations if provided
            if (isset($input['product_ids']) && is_array($input['product_ids'])) {
                $assocStmt = $pdo->prepare("INSERT INTO coupon_products (coupon_id, product_id) VALUES (?, ?)");
                foreach ($input['product_ids'] as $productId) {
                    $assocStmt->execute([$newId, $productId]);
                }
            }
            
            // Return the created coupon mapping fields back
            sendJson([
                'id' => $newId,
                'code' => $code,
                'discount_type' => $discount_type,
                'discount_value' => (float)$discount_value,
                'min_order_value' => (float)$min_order_amount,
                'max_discount_value' => $max_discount !== null ? (float)$max_discount : null,
                'is_active' => $is_active,
                'product_ids' => $input['product_ids'] ?? [],
                'created_at' => date('Y-m-d H:i:s')
            ]);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                sendJson(['error' => 'Coupon code already exists'], 409);
            } else {
                sendJson(['error' => $e->getMessage()], 500);
            }
        }
        break;

    case 'PATCH':
    case 'PUT':
        $user = requireAuth();
        if ($user['role'] !== 'admin') sendJson(['error' => 'Forbidden'], 403);

        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? $id;

        if (!$id) sendJson(['error' => 'Missing coupon ID'], 400);

        $fields = [];
        $params = [];

        if (isset($input['is_active'])) {
            $fields[] = "is_active = ?";
            $params[] = $input['is_active'] ? 1 : 0;
        }
        if (isset($input['discount_value'])) {
            $fields[] = "discount_value = ?";
            $params[] = $input['discount_value'];
        }
        if (isset($input['code'])) {
            $fields[] = "code = ?";
            $params[] = strtoupper($input['code']);
        }

        if (empty($fields)) sendJson(['error' => 'No fields to update'], 400);

        $params[] = $id;
        $sql = "UPDATE coupons SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        // Update product associations if provided
        if (isset($input['product_ids']) && is_array($input['product_ids'])) {
            // Remove existing
            $stmt = $pdo->prepare("DELETE FROM coupon_products WHERE coupon_id = ?");
            $stmt->execute([$id]);

            // Add new
            if (!empty($input['product_ids'])) {
                $assocStmt = $pdo->prepare("INSERT INTO coupon_products (coupon_id, product_id) VALUES (?, ?)");
                foreach ($input['product_ids'] as $productId) {
                    $assocStmt->execute([$id, $productId]);
                }
            }
        }

        sendJson(['success' => true]);
        break;

    case 'DELETE':
        $user = requireAuth();
        if ($user['role'] !== 'admin') sendJson(['error' => 'Forbidden'], 403);

        $input = json_decode(file_get_contents('php://input'), true);
        $ids = $input['ids'] ?? ($id ? [$id] : []);
        
        if (empty($ids)) sendJson(['error' => 'Missing ID(s)'], 400);

        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $pdo->prepare("DELETE FROM coupons WHERE id IN ($placeholders)");
        $stmt->execute($ids);

        sendJson(['success' => true]);
        break;

    default:
        sendJson(['error' => 'Method not allowed'], 405);
}
?>

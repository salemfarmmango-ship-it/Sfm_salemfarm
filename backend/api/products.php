<?php
// backend/api/products.php
require_once '../config.php';
require_once '../jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

// Helper: fetch variations for a product id
function fetchVariations($pdo, $productId) {
    $stmt = $pdo->prepare("SELECT * FROM product_variations WHERE product_id = ? ORDER BY sort_order ASC, id ASC");
    $stmt->execute([$productId]);
    $vars = $stmt->fetchAll();
    foreach ($vars as &$v) {
        $v['images']         = json_decode($v['images'] ?? '[]', true) ?: [];
        $v['highlights']     = json_decode($v['highlights'] ?? '[]', true) ?: [];
        $v['specifications'] = json_decode($v['specifications'] ?? '[]', true) ?: [];
    }
    return $vars;
}

// Helper: save variations for a product (delete existing then insert new)
function saveVariations($pdo, $productId, $variations) {
    // Delete existing variations for this product
    $del = $pdo->prepare("DELETE FROM product_variations WHERE product_id = ?");
    $del->execute([$productId]);

    if (!empty($variations)) {
        $sortOrder = 0;
        foreach ($variations as $v) {
            $stmt = $pdo->prepare("INSERT INTO product_variations
                (product_id, variation_label, size, name, description, price, original_price, stock, stock_status,
                 images, highlights, specifications, sort_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $productId,
                $v['variation_label'] ?? '',
                $v['size'] ?? null,
                $v['name'] ?? null,
                $v['description'] ?? null,
                $v['price'] ?? 0,
                !empty($v['original_price']) ? $v['original_price'] : null,
                $v['stock'] ?? 0,
                $v['stock_status'] ?? 'In Stock',
                isset($v['images']) ? json_encode($v['images']) : '[]',
                isset($v['highlights']) ? json_encode($v['highlights']) : '[]',
                isset($v['specifications']) ? json_encode($v['specifications']) : '[]',
                $sortOrder++
            ]);
        }
    }
}

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare("SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?");
            $stmt->execute([$id]);
            $product = $stmt->fetch();
            if ($product) {
                $product['images']         = json_decode($product['images'] ?? '[]', true) ?: [];
                $product['highlights']     = json_decode($product['highlights'] ?? '[]', true) ?: [];
                $product['specifications'] = json_decode($product['specifications'] ?? '[]', true) ?: [];
                $product['variations']     = fetchVariations($pdo, $id);
                $product['categories']     = null;

                if ($product['category_id']) {
                    $catStmt = $pdo->prepare("SELECT id, name, slug FROM categories WHERE id = ?");
                    $catStmt->execute([$product['category_id']]);
                    $product['categories'] = $catStmt->fetch() ?: null;
                }

                sendJson($product);
            } else {
                sendJson(['error' => 'Product not found'], 404);
            }
        } else {
            // Check for category filter and other filters
            $categoryId = $_GET['category_id'] ?? null;
            $isFeatured = isset($_GET['is_featured']) ? filter_var($_GET['is_featured'], FILTER_VALIDATE_BOOLEAN) : null;
            $isSeasonal = isset($_GET['is_seasonal']) ? filter_var($_GET['is_seasonal'], FILTER_VALIDATE_BOOLEAN) : null;
            $search = $_GET['search'] ?? null;

            $query = "SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1";
            $params = [];

            if ($search) {
                $query .= " AND (p.name LIKE ? OR p.description LIKE ?)";
                $params[] = "%$search%";
                $params[] = "%$search%";
            }
            if ($categoryId) {
                $query .= " AND p.category_id = ?";
                $params[] = $categoryId;
            }
            if ($isFeatured !== null) {
                $query .= " AND p.is_featured = ?";
                $params[] = $isFeatured ? 1 : 0;
            }
            if ($isSeasonal !== null) {
                $query .= " AND p.is_seasonal = ?";
                $params[] = $isSeasonal ? 1 : 0;
            }

            $query .= " ORDER BY p.created_at DESC";

            // Pagination
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : null;
            $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
            
            if ($limit !== null) {
                $query .= " LIMIT ? OFFSET ?";
                $params[] = $limit;
                $params[] = $offset;
            }

            $stmt = $pdo->prepare($query);
            
            // Bind parameters manually to ensure LIMIT/OFFSET are integers
            $paramIndex = 1;
            foreach ($params as $param) {
                // Determine if it's one of the last two params (limit/offset)
                if ($limit !== null && $paramIndex > count($params) - 2) {
                    $stmt->bindValue($paramIndex, $param, PDO::PARAM_INT);
                } else {
                    $stmt->bindValue($paramIndex, $param);
                }
                $paramIndex++;
            }
            
            $stmt->execute();
            $products = $stmt->fetchAll();

            foreach ($products as &$p) {
                $p['images']         = json_decode($p['images'] ?? '[]', true) ?: [];
                $p['highlights']     = json_decode($p['highlights'] ?? '[]', true) ?: [];
                $p['specifications'] = json_decode($p['specifications'] ?? '[]', true) ?: [];
                $p['variations']     = fetchVariations($pdo, $p['id']);
                if (isset($p['category_name'])) {
                    $p['categories'] = ['id' => $p['category_id'], 'name' => $p['category_name'], 'slug' => $p['category_slug']];
                } else {
                    $p['categories'] = null;
                }
            }

            sendJson($products);
        }
        break;

    case 'POST':
    case 'PUT':
    case 'PATCH':
    case 'DELETE':
        $user = requireAuth();
        if ($user['role'] !== 'admin') {
            sendJson(['error' => 'Forbidden'], 403);
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if ($method === 'DELETE') {
            $ids = $input['ids'] ?? ($id ? [$id] : []);
            if (empty($ids))
                sendJson(['error' => 'Missing product ID(s)'], 400);

            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $stmt = $pdo->prepare("DELETE FROM products WHERE id IN ($placeholders)");
            $stmt->execute($ids);
            sendJson(['success' => true, 'deleted' => $stmt->rowCount()]);
            break;
        }

        if ($method === 'POST') {
            $name        = $input['name'] ?? '';
            $categoryId  = $input['category_id'] ?? null;
            $description = $input['description'] ?? '';
            $price       = $input['price'] ?? 0;
            $originalPrice = $input['original_price'] ?? null;
            $stock       = $input['stock'] ?? 0;
            $images      = isset($input['images']) ? json_encode($input['images']) : '[]';
            $highlights  = isset($input['highlights']) ? json_encode($input['highlights']) : '[]';
            $specifications = isset($input['specifications']) ? json_encode($input['specifications']) : '[]';
            $size        = $input['size'] ?? '';
            $stockStatus = $input['stock_status'] ?? 'In Stock';
            $isFeatured  = isset($input['is_featured']) ? (int) $input['is_featured'] : 0;
            $isSeasonal  = isset($input['is_seasonal']) ? (int) $input['is_seasonal'] : 0;
            $seasonOver  = isset($input['season_over']) ? (int) $input['season_over'] : 0;
            $variationsInput = $input['variations'] ?? [];

            if (!$name || !$price)
                sendJson(['error' => 'Name and price are required'], 400);

            $stmt = $pdo->prepare("INSERT INTO products (category_id, name, description, price, original_price, stock, images, highlights, specifications, size, stock_status, is_featured, is_seasonal, season_over) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$categoryId, $name, $description, $price, $originalPrice, $stock, $images, $highlights, $specifications, $size, $stockStatus, $isFeatured, $isSeasonal, $seasonOver]);

            $newProductId = $pdo->lastInsertId();

            // Save the extra variations (variation 2, 3, ...) to product_variations table
            saveVariations($pdo, $newProductId, $variationsInput);

            sendJson(['success' => true, 'id' => $newProductId]);
        }

        if ($method === 'PUT' || $method === 'PATCH') {
            $ids = $input['ids'] ?? ($id ? [$id] : []);
            if (empty($ids))
                sendJson(['error' => 'Missing product ID(s)'], 400);

            $variationsInput = $input['variations'] ?? null;

            // Allowed fields for partial updates
            $allowedFields = [
                'category_id',
                'name',
                'description',
                'price',
                'original_price',
                'stock',
                'images',
                'highlights',
                'specifications',
                'size',
                'stock_status',
                'is_featured',
                'is_seasonal',
                'season_over'
            ];

            $updateFields = [];
            $updateParams = [];

            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $input)) {
                    $updateFields[] = "`$field` = ?";
                    $val = $input[$field];
                    if (in_array($field, ['images', 'highlights', 'specifications']) && is_array($val)) {
                        $val = json_encode($val);
                    } elseif (in_array($field, ['is_featured', 'is_seasonal', 'season_over'])) {
                        $val = $val ? 1 : 0;
                    }
                    $updateParams[] = $val;
                }
            }

            if (!empty($updateFields)) {
                $placeholders = implode(',', array_fill(0, count($ids), '?'));
                $sql = "UPDATE products SET " . implode(', ', $updateFields) . " WHERE id IN ($placeholders)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute(array_merge($updateParams, $ids));
            }

            // If variations were sent, update them for each product ID
            if ($variationsInput !== null) {
                foreach ($ids as $pid) {
                    saveVariations($pdo, $pid, $variationsInput);
                }
            }

            sendJson(['success' => true]);
        }
        break;

    default:
        sendJson(['error' => 'Method not allowed'], 405);
}
?>
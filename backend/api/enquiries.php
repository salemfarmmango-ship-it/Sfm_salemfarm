<?php
// backend/api/enquiries.php
require_once '../config.php';
require_once '../jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$type = $_GET['type'] ?? 'bulk'; // 'bulk' or 'corporate'
$id = $_GET['id'] ?? null;

// Ensure type is valid
if (!in_array($type, ['bulk', 'corporate'])) {
    sendJson(['error' => 'Invalid enquiry type'], 400);
}

$table = $type === 'bulk' ? 'bulk_enquiries' : 'corporate_enquiries';

switch ($method) {
    case 'GET':
        $user = requireAuth();
        if ($user['role'] !== 'admin') {
            sendJson(['error' => 'Forbidden'], 403);
        }

        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $status = $_GET['status'] ?? 'all';
        $date = $_GET['date'] ?? null;
        $offset = ($page - 1) * $limit;

        $query = "SELECT * FROM {$table} WHERE 1=1";
        $countQuery = "SELECT COUNT(*) FROM {$table} WHERE 1=1";
        $params = [];

        if ($status !== 'all') {
            $query .= " AND status = ?";
            $countQuery .= " AND status = ?";
            $params[] = $status;
        }

        if ($date) {
            $query .= " AND DATE(created_at) = ?";
            $countQuery .= " AND DATE(created_at) = ?";
            $params[] = $date;
        }

        // Get total count
        $stmtCount = $pdo->prepare($countQuery);
        $stmtCount->execute($params);
        $totalCount = $stmtCount->fetchColumn();

        $query .= " ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $data = $stmt->fetchAll();

        sendJson([
            'data' => $data,
            'totalPages' => ceil($totalCount / $limit),
            'count' => (int)$totalCount
        ]);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        
        if ($type === 'bulk') {
            $name = $input['name'] ?? '';
            $email = $input['email'] ?? '';
            $phone = $input['phone'] ?? '';
            $quantity = $input['quantity'] ?? '';
            $message = $input['message'] ?? '';

            if (!$name || !$phone) sendJson(['error' => 'Name and phone required'], 400);

            $stmt = $pdo->prepare("INSERT INTO bulk_enquiries (name, email, phone, quantity, message) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$name, $email, $phone, $quantity, $message]);
        } else {
            $companyName = $input['company_name'] ?? '';
            $contactPerson = $input['contact_person'] ?? '';
            $email = $input['email'] ?? '';
            $phone = $input['phone'] ?? '';
            $requirements = $input['requirements'] ?? '';

            if (!$companyName || !$contactPerson || !$phone) sendJson(['error' => 'Missing fields'], 400);

            $stmt = $pdo->prepare("INSERT INTO corporate_enquiries (company_name, contact_person, email, phone, requirements) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$companyName, $contactPerson, $email, $phone, $requirements]);
        }
        sendJson(['success' => true, 'message' => 'Enquiry submitted']);
        break;

    case 'PUT':
    case 'PATCH':
    case 'DELETE':
        $user = requireAuth();
        if ($user['role'] !== 'admin') sendJson(['error' => 'Forbidden'], 403);
        
        $input = json_decode(file_get_contents('php://input'), true);
        $ids = $input['ids'] ?? ($input['id'] ?? ($id ? [$id] : []));
        if (!is_array($ids)) $ids = [$ids];

        if (empty($ids)) sendJson(['error' => 'Missing ID(s)'], 400);

        if ($method === 'DELETE') {
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $stmt = $pdo->prepare("DELETE FROM {$table} WHERE id IN ($placeholders)");
            $stmt->execute($ids);
        } else {
            $status = $input['status'] ?? null;
            if ($status) {
                $placeholders = implode(',', array_fill(0, count($ids), '?'));
                $stmt = $pdo->prepare("UPDATE {$table} SET status = ? WHERE id IN ($placeholders)");
                $stmt->execute(array_merge([$status], $ids));
            }
        }
        sendJson(['success' => true]);
        break;

    default:
        sendJson(['error' => 'Method not allowed'], 405);
}
?>

<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once __DIR__ . '/../config/db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // GET /api/items or /api/items?id=xx
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $stmt = $connect->prepare('SELECT * FROM product WHERE product_id = ?');
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $item = $result->fetch_assoc();
            echo json_encode(['success' => true, 'item' => $item]);
        } else {
            $result = $connect->query('SELECT * FROM product');
            $items = [];
            while ($row = $result->fetch_assoc()) {
                $items[] = $row;
            }
            echo json_encode(['success' => true, 'items' => $items]);
        }
        break;
    case 'POST':
        // Thêm sản phẩm mới
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $connect->prepare('INSERT INTO product (product_name, product_image, brand_id, categories_id, quantity, minStock, unit, store, rate, active, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->bind_param(
            'ssiiisssdii',
            $data['product_name'],
            $data['product_image'],
            $data['brand_id'],
            $data['categories_id'],
            $data['quantity'],
            $data['minStock'],
            $data['unit'],
            $data['store'],
            $data['rate'],
            $data['active'],
            $data['status']
        );
        $success = $stmt->execute();
        if ($success) {
            echo json_encode(['success' => true, 'product_id' => $connect->insert_id]);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Insert failed', 'error' => $stmt->error]);
        }
        break;
    case 'PUT':
        // Sửa sản phẩm
        parse_str(file_get_contents('php://input'), $put_vars);
        $id = $put_vars['product_id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing product_id']);
            exit;
        }
        $data = json_decode(json_encode($put_vars), true);
        // Add all fields to the update statement
        $stmt = $connect->prepare('UPDATE product SET product_name=?, product_image=?, brand_id=?, categories_id=?, quantity=?, minStock=?, unit=?, store=?, rate=?, active=?, status=? WHERE product_id=?');
        $stmt->bind_param(
            'ssiiisssdiii',
            $data['product_name'],
            $data['product_image'],
            $data['brand_id'],
            $data['categories_id'],
            $data['quantity'],
            $data['minStock'],
            $data['unit'],
            $data['store'],
            $data['rate'],
            $data['active'],
            $data['status'],
            $id
        );
        $success = $stmt->execute();
        if ($success) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Update failed', 'error' => $stmt->error]);
        }
        break;
    case 'DELETE':
        // Xóa sản phẩm
        parse_str(file_get_contents('php://input'), $del_vars);
        $id = $del_vars['product_id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing product_id']);
            exit;
        }
        $stmt = $connect->prepare('DELETE FROM product WHERE product_id = ?');
        $stmt->bind_param('i', $id);
        $success = $stmt->execute();
        if ($success) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Delete failed']);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once __DIR__ . '/../config/db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $stmt = $connect->prepare('SELECT * FROM product WHERE product_id = ?');
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $product = $result->fetch_assoc();
            echo json_encode(['success' => true, 'product' => $product]);
        } else {
            $result = $connect->query('SELECT * FROM product');
            $products = [];
            while ($row = $result->fetch_assoc()) {
                $products[] = $row;
            }
            echo json_encode(['success' => true, 'products' => $products]);
        }
        break;
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $connect->prepare('INSERT INTO product (product_name, product_image, brand_id, categories_id, quantity, rate, active, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->bind_param('ssiiisii', $data['product_name'], $data['product_image'], $data['brand_id'], $data['categories_id'], $data['quantity'], $data['rate'], $data['active'], $data['status']);
        $success = $stmt->execute();
        echo json_encode(['success' => $success, 'product_id' => $connect->insert_id]);
        break;
    case 'PUT':
        parse_str(file_get_contents('php://input'), $put_vars);
        $id = $put_vars['product_id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing product_id']);
            exit;
        }
        $stmt = $connect->prepare('UPDATE product SET product_name=?, product_image=?, brand_id=?, categories_id=?, quantity=?, rate=?, active=?, status=? WHERE product_id=?');
        $stmt->bind_param('ssiiisiii', $put_vars['product_name'], $put_vars['product_image'], $put_vars['brand_id'], $put_vars['categories_id'], $put_vars['quantity'], $put_vars['rate'], $put_vars['active'], $put_vars['status'], $id);
        $success = $stmt->execute();
        echo json_encode(['success' => $success]);
        break;
    case 'DELETE':
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
        echo json_encode(['success' => $success]);
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

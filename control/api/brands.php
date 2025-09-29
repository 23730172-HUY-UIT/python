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
            $stmt = $connect->prepare('SELECT * FROM brands WHERE brand_id = ?');
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $brand = $result->fetch_assoc();
            echo json_encode(['success' => true, 'brand' => $brand]);
        } else {
            $result = $connect->query('SELECT * FROM brands');
            $brands = [];
            while ($row = $result->fetch_assoc()) {
                $brands[] = $row;
            }
            echo json_encode(['success' => true, 'brands' => $brands]);
        }
        break;
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        // Kiểm tra trùng tên brand
        $check_stmt = $connect->prepare('SELECT COUNT(*) as cnt FROM brands WHERE brand_name = ?');
        $check_stmt->bind_param('s', $data['brand_name']);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        $row = $check_result->fetch_assoc();
        if ($row && $row['cnt'] > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Brand name already exists']);
            exit;
        }
        $stmt = $connect->prepare('INSERT INTO brands (brand_name, brand_active, brand_status) VALUES (?, ?, ?)');
        $stmt->bind_param('sii', $data['brand_name'], $data['brand_active'], $data['brand_status']);
        $success = $stmt->execute();
        echo json_encode(['success' => $success, 'brand_id' => $connect->insert_id]);
        break;
    case 'PUT':
        parse_str(file_get_contents('php://input'), $put_vars);
        $id = $put_vars['brand_id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing brand_id']);
            exit;
        }
        $stmt = $connect->prepare('UPDATE brands SET brand_name=?, brand_active=?, brand_status=? WHERE brand_id=?');
        $stmt->bind_param('siii', $put_vars['brand_name'], $put_vars['brand_active'], $put_vars['brand_status'], $id);
        $success = $stmt->execute();
        echo json_encode(['success' => $success]);
        break;
    case 'DELETE':
        parse_str(file_get_contents('php://input'), $del_vars);
        $id = $del_vars['brand_id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing brand_id']);
            exit;
        }
        $stmt = $connect->prepare('DELETE FROM brands WHERE brand_id = ?');
        $stmt->bind_param('i', $id);
        $success = $stmt->execute();
        echo json_encode(['success' => $success]);
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

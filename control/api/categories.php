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
            $stmt = $connect->prepare('SELECT * FROM categories WHERE categories_id = ?');
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $category = $result->fetch_assoc();
            echo json_encode(['success' => true, 'category' => $category]);
        } else {
            $result = $connect->query('SELECT * FROM categories');
            $categories = [];
            while ($row = $result->fetch_assoc()) {
                $categories[] = $row;
            }
            echo json_encode(['success' => true, 'categories' => $categories]);
        }
        break;
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $connect->prepare('INSERT INTO categories (categories_name, categories_active, categories_status) VALUES (?, ?, ?)');
        $stmt->bind_param('sii', $data['categories_name'], $data['categories_active'], $data['categories_status']);
        $success = $stmt->execute();
        echo json_encode(['success' => $success, 'categories_id' => $connect->insert_id]);
        break;
    case 'PUT':
        parse_str(file_get_contents('php://input'), $put_vars);
        $id = $put_vars['categories_id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing categories_id']);
            exit;
        }
        $stmt = $connect->prepare('UPDATE categories SET categories_name=?, categories_active=?, categories_status=? WHERE categories_id=?');
        $stmt->bind_param('siii', $put_vars['categories_name'], $put_vars['categories_active'], $put_vars['categories_status'], $id);
        $success = $stmt->execute();
        echo json_encode(['success' => $success]);
        break;
    case 'DELETE':
        parse_str(file_get_contents('php://input'), $del_vars);
        $id = $del_vars['categories_id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing categories_id']);
            exit;
        }
        $stmt = $connect->prepare('DELETE FROM categories WHERE categories_id = ?');
        $stmt->bind_param('i', $id);
        $success = $stmt->execute();
        echo json_encode(['success' => $success]);
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

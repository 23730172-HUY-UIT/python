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
            $stmt = $connect->prepare('SELECT * FROM issues WHERE issue_id = ?');
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $issue = $result->fetch_assoc();
            echo json_encode(['success' => true, 'issue' => $issue]);
        } else {
            $result = $connect->query('SELECT * FROM issues');
            $issues = [];
            while ($row = $result->fetch_assoc()) {
                $issues[] = $row;
            }
            echo json_encode(['success' => true, 'issues' => $issues]);
        }
        break;
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $connect->prepare('INSERT INTO issues (order_id, product_id, quantity, reason, created_at) VALUES (?, ?, ?, ?, NOW())');
        $stmt->bind_param('iiis', $data['order_id'], $data['product_id'], $data['quantity'], $data['reason']);
        $success = $stmt->execute();
        echo json_encode(['success' => $success, 'issue_id' => $connect->insert_id]);
        break;
    case 'PUT':
        parse_str(file_get_contents('php://input'), $put_vars);
        $id = $put_vars['issue_id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing issue_id']);
            exit;
        }
        $stmt = $connect->prepare('UPDATE issues SET order_id=?, product_id=?, quantity=?, reason=? WHERE issue_id=?');
        $stmt->bind_param('iiisi', $put_vars['order_id'], $put_vars['product_id'], $put_vars['quantity'], $put_vars['reason'], $id);
        $success = $stmt->execute();
        echo json_encode(['success' => $success]);
        break;
    case 'DELETE':
        parse_str(file_get_contents('php://input'), $del_vars);
        $id = $del_vars['issue_id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing issue_id']);
            exit;
        }
        $stmt = $connect->prepare('DELETE FROM issues WHERE issue_id = ?');
        $stmt->bind_param('i', $id);
        $success = $stmt->execute();
        echo json_encode(['success' => $success]);
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

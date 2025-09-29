<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Lấy danh sách log, có thể filter theo user, entity, action, ...
        $where = [];
        $params = [];
        $types = '';
        if (isset($_GET['user_id'])) {
            $where[] = 'user_id = ?';
            $params[] = $_GET['user_id'];
            $types .= 'i';
        }
        if (isset($_GET['entity_type'])) {
            $where[] = 'entity_type = ?';
            $params[] = $_GET['entity_type'];
            $types .= 's';
        }
        if (isset($_GET['action_type'])) {
            $where[] = 'action_type = ?';
            $params[] = $_GET['action_type'];
            $types .= 's';
        }
        $sql = 'SELECT * FROM transactions';
        if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
        $sql .= ' ORDER BY created_at DESC LIMIT 200';
        $stmt = $connect->prepare($sql);
        if ($params) $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        $logs = [];
        while ($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }
        echo json_encode(['success'=>true, 'logs'=>$logs]);
        break;
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $user_id = $data['user_id'] ?? null;
        $action_type = $data['action_type'] ?? '';
        $entity_type = $data['entity_type'] ?? '';
        $entity_id = $data['entity_id'] ?? null;
        $data_before = isset($data['data_before']) ? json_encode($data['data_before']) : null;
        $data_after = isset($data['data_after']) ? json_encode($data['data_after']) : null;
        $description = $data['description'] ?? null;
        $sql = 'INSERT INTO transactions (user_id, action_type, entity_type, entity_id, data_before, data_after, description) VALUES (?, ?, ?, ?, ?, ?, ?)';
        $stmt = $connect->prepare($sql);
        $stmt->bind_param('issssss', $user_id, $action_type, $entity_type, $entity_id, $data_before, $data_after, $description);
        $success = $stmt->execute();
        echo json_encode(['success'=>$success, 'id'=>$connect->insert_id]);
        break;
    default:
        http_response_code(405);
        echo json_encode(['success'=>false, 'message'=>'Method not allowed']);
}
        $success = $stmt->execute();

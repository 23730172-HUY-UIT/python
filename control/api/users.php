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
            $stmt = $connect->prepare('SELECT * FROM users WHERE user_id = ?');
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();
            echo json_encode(['success' => true, 'user' => $user]);
        } else {
            $result = $connect->query('SELECT * FROM users');
            $users = [];
            while ($row = $result->fetch_assoc()) {
                $users[] = $row;
            }
            echo json_encode(['success' => true, 'users' => $users]);
        }
        break;
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        $stmt = $connect->prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
        $stmt->bind_param('sss', $data['username'], $data['email'], $hashedPassword);
        $success = $stmt->execute();
        echo json_encode(['success' => $success, 'user_id' => $connect->insert_id]);
        break;
    case 'PUT':
        parse_str(file_get_contents('php://input'), $put_vars);
        $id = $put_vars['user_id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing user_id']);
            exit;
        }

        // Lấy user hiện tại
        $stmt = $connect->prepare('SELECT * FROM users WHERE user_id=?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();
        if (!$user) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found']);
            exit;
        }

        $username = $put_vars['username'] ?? $user['username'];
        $email = $put_vars['email'] ?? $user['email'];
        $password = $user['password'];

        // Đổi mật khẩu nếu có currentPassword & newPassword
        if (!empty($put_vars['currentPassword']) && !empty($put_vars['newPassword'])) {
            $debug = [
                'currentPassword' => $put_vars['currentPassword'],
                'db_hash' => $user['password'],
                'verify_result' => password_verify($put_vars['currentPassword'], $user['password'])
            ];
            if (!password_verify($put_vars['currentPassword'], $user['password'])) {
                echo json_encode(['success' => false, 'message' => 'Current password incorrect', 'debug' => $debug]);
                exit;
            }
            $password = password_hash($put_vars['newPassword'], PASSWORD_DEFAULT);
        } elseif (!empty($put_vars['password'])) {
            $password = password_hash($put_vars['password'], PASSWORD_DEFAULT);
        }

        $stmt = $connect->prepare('UPDATE users SET username=?, email=?, password=? WHERE user_id=?');
        $stmt->bind_param('sssi', $username, $email, $password, $id);
        $success = $stmt->execute();
        echo json_encode(['success' => $success]);
        break;
    case 'DELETE':
        parse_str(file_get_contents('php://input'), $del_vars);
        $id = $del_vars['user_id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing user_id']);
            exit;
        }
        $stmt = $connect->prepare('DELETE FROM users WHERE user_id = ?');
        $stmt->bind_param('i', $id);
        $success = $stmt->execute();
        echo json_encode(['success' => $success]);
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

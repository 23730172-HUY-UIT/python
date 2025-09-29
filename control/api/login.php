<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once __DIR__ . '/../config/db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);

$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Username and password required']);
    exit;
}

$sql = "SELECT * FROM users WHERE username = ? OR email = ?";
$stmt = $connect->prepare($sql);
$stmt->bind_param('ss', $username, $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows === 1) {
    $user = $result->fetch_assoc();
    $db_password = $user['password'];
    $password_matched = false;

    // Check if the password from the DB is a modern hash.
    // A simple heuristic: length >= 60 and starts with '$'.
    if (strlen($db_password) >= 60 && strpos($db_password, '$') === 0) {
        if (password_verify($password, $db_password)) {
            $password_matched = true;
        }
    } else {
        // Fallback for plain text passwords from data.sql
        if ($password === $db_password) {
            $password_matched = true;
        }
    }

    if ($password_matched) {
        session_start();
        $_SESSION['userId'] = $user['user_id'];
        // Trả về thông tin user cần thiết
        echo json_encode([
            'success' => true,
            'user' => [
                'userId' => $user['user_id'],
                'username' => $user['username'],
                'role' => $user['role'] ?? '',
                'email' => $user['email'] ?? ''
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
    }
} else {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
}
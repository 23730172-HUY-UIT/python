<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

// Session timeout 2 phút
$timeout = 3000; // giây
if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > $timeout)) {
    session_unset();
    session_destroy();
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Session expired']);
    exit;
}
$_SESSION['LAST_ACTIVITY'] = time();

if (!isset($_SESSION['userId'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

require_once __DIR__ . '/../config/db_connect.php';
$stmt = $connect->prepare('SELECT user_id, username, name, email, role, status, avatar FROM users WHERE user_id=?');
$stmt->bind_param('i', $_SESSION['userId']);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
if ($user) {
    echo json_encode(['success' => true, 'user' => $user]);
} else {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'User not found']);
}
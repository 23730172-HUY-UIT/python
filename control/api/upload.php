<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$targetDir = __DIR__ . '/../uploads/';
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No file uploaded']);
        exit;
    }
    $file = $_FILES['file'];
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!in_array(strtolower($ext), $allowed)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid file type']);
        exit;
    }
    $filename = uniqid('img_', true) . '.' . $ext;
    $targetFile = $targetDir . $filename;
    if (move_uploaded_file($file['tmp_name'], $targetFile)) {
        $url = '/uploads/' . $filename;
        echo json_encode(['success' => true, 'url' => $url]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);

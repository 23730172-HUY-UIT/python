<?php
header('Content-Type: application/json');
require_once '../php_action/db_connect.php';

// Báo cáo tổng số đơn hàng và tổng doanh thu
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT COUNT(*) as total_orders, SUM(grand_total) as total_revenue FROM orders";
    $result = $connect->query($sql);
    $report = $result->fetch_assoc();
    echo json_encode($report);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
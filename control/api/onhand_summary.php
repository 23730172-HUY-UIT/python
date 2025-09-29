<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once __DIR__ . '/../config/db_connect.php';

// Đếm số item low stock (quantity < minStock)
$lowStockSql = "SELECT COUNT(*) as low_stock_count FROM product WHERE quantity < minStock";
$lowStockResult = $connect->query($lowStockSql);
$lowStockCount = 0;
if ($lowStockResult && $row = $lowStockResult->fetch_assoc()) {
    $lowStockCount = (int)$row['low_stock_count'];
}

// Tổng hợp số lượng hàng hóa theo từng location
$locationSql = "SELECT location, SUM(quantity) as total_quantity FROM product GROUP BY location";
$locationResult = $connect->query($locationSql);
$locations = [];
while ($row = $locationResult->fetch_assoc()) {
    $locations[] = [
        'location' => $row['location'],
        'total_quantity' => (int)$row['total_quantity']
    ];
}

echo json_encode([
    'success' => true,
    'lowStockCount' => $lowStockCount,
    'locations' => $locations
]);

<?php
header('Content-Type: application/json');
require_once '../php_action/db_connect.php';

$id = $_GET['id'] ?? null;

// Lấy danh sách product hoặc 1 product
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($id) {
        $sql = "SELECT * FROM product WHERE product_id = ?";
        $stmt = $connect->prepare($sql);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($product = $result->fetch_assoc()) {
            echo json_encode($product);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Product not found']);
        }
    } else {
        $sql = "SELECT * FROM product";
        $result = $connect->query($sql);
        $products = [];
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
        echo json_encode($products);
    }
    exit;
}

// Tạo product mới
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $product_name = $data['product_name'] ?? '';
    $brand_id = $data['brand_id'] ?? null;
    $categories_id = $data['categories_id'] ?? null;
    $quantity = $data['quantity'] ?? 0;
    $rate = $data['rate'] ?? 0;
    $active = $data['active'] ?? 1;
    $product_image = $data['product_image'] ?? null; // New field for product image
    if (!$product_name || !$brand_id || !$categories_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit;
    }
    $sql = "INSERT INTO product (product_name, brand_id, categories_id, quantity, rate, active, product_image) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $connect->prepare($sql);
    $stmt->bind_param('siiidis', $product_name, $brand_id, $categories_id, $quantity, $rate, $active, $product_image);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'product_id' => $stmt->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Insert failed']);
    }
    exit;
}

// Sửa product
if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $id) {
    $data = json_decode(file_get_contents('php://input'), true);
    $product_name = $data['product_name'] ?? '';
    $brand_id = $data['brand_id'] ?? null;
    $categories_id = $data['categories_id'] ?? null;
    $quantity = $data['quantity'] ?? 0;
    $rate = $data['rate'] ?? 0;
    $active = $data['active'] ?? 1;
    $sql = "UPDATE product SET product_name = ?, brand_id = ?, categories_id = ?, quantity = ?, rate = ?, active = ? WHERE product_id = ?";
    $stmt = $connect->prepare($sql);
    $stmt->bind_param('siiidii', $product_name, $brand_id, $categories_id, $quantity, $rate, $active, $id);
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Update failed']);
    }
    exit;
}

// Xóa product
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $id) {
    $sql = "DELETE FROM product WHERE product_id = ?";
    $stmt = $connect->prepare($sql);
    $stmt->bind_param('i', $id);
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Delete failed']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
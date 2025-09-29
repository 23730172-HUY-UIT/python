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
            $stmt = $connect->prepare('SELECT * FROM orders WHERE order_id = ?');
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $order = $result->fetch_assoc();

            if ($order) {
                $items_stmt = $connect->prepare('
                    SELECT oi.*, p.product_name 
                    FROM order_item oi
                    JOIN product p ON oi.product_id = p.product_id
                    WHERE oi.order_id = ?
                ');
                $items_stmt->bind_param('i', $id);
                $items_stmt->execute();
                $items_result = $items_stmt->get_result();
                $items = [];
                while ($row = $items_result->fetch_assoc()) {
                    $items[] = $row;
                }
                $order['items'] = $items;
            }

            echo json_encode(['success' => true, 'order' => $order]);
        } else {
            $result = $connect->query('SELECT * FROM orders');
            $orders = [];
            while ($row = $result->fetch_assoc()) {
                $orders[] = $row;
            }
            echo json_encode(['success' => true, 'orders' => $orders]);
        }
        break;
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $connect->prepare('INSERT INTO orders (order_date, client_name, client_contact, sub_total, vat, total_amount, discount, grand_total, paid, due, payment_type, payment_status, payment_place, gstn, order_status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->bind_param('ssssssssssssssii', $data['order_date'], $data['client_name'], $data['client_contact'], $data['sub_total'], $data['vat'], $data['total_amount'], $data['discount'], $data['grand_total'], $data['paid'], $data['due'], $data['payment_type'], $data['payment_status'], $data['payment_place'], $data['gstn'], $data['order_status'], $data['user_id']);
        $success = $stmt->execute();

        if ($success) {
            $order_id = $connect->insert_id;
            if (isset($data['items']) && is_array($data['items'])) {
                $item_stmt = $connect->prepare('INSERT INTO order_item (order_id, product_id, quantity, rate, total) VALUES (?, ?, ?, ?, ?)');
                foreach ($data['items'] as $item) {
                    $item_stmt->bind_param('iiidd', $order_id, $item['product_id'], $item['quantity'], $item['rate'], $item['total']);
                    $item_stmt->execute();
                }
            }
        }
        echo json_encode(['success' => $success, 'order_id' => $order_id]);
        break;
    case 'PUT':
        parse_str(file_get_contents('php://input'), $put_vars);
        $id = $put_vars['order_id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing order_id']);
            exit;
        }
        $stmt = $connect->prepare('UPDATE orders SET order_date=?, client_name=?, client_contact=?, sub_total=?, vat=?, total_amount=?, discount=?, grand_total=?, paid=?, due=?, payment_type=?, payment_status=?, payment_place=?, gstn=?, order_status=?, user_id=? WHERE order_id=?');
        $stmt->bind_param('ssssssssssssssiii', $put_vars['order_date'], $put_vars['client_name'], $put_vars['client_contact'], $put_vars['sub_total'], $put_vars['vat'], $put_vars['total_amount'], $put_vars['discount'], $put_vars['grand_total'], $put_vars['paid'], $put_vars['due'], $put_vars['payment_type'], $put_vars['payment_status'], $put_vars['payment_place'], $put_vars['gstn'], $put_vars['order_status'], $put_vars['user_id'], $id);
        $success = $stmt->execute();
        echo json_encode(['success' => $success]);
        break;
    case 'DELETE':
        parse_str(file_get_contents('php://input'), $del_vars);
        $id = $del_vars['order_id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing order_id']);
            exit;
        }
        $stmt = $connect->prepare('DELETE FROM orders WHERE order_id = ?');
        $stmt->bind_param('i', $id);
        $success = $stmt->execute();
        echo json_encode(['success' => $success]);
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

<?php
// Script này chỉ chạy 1 lần để cập nhật mật khẩu user_id=1 thành hash
require_once __DIR__ . '/../config/db_connect.php';

$user_id = 1; // Thay đổi nếu cần
$newPassword = '123456'; // Mật khẩu mới
$hashed = password_hash($newPassword, PASSWORD_DEFAULT);

$stmt = $connect->prepare('UPDATE users SET password=? WHERE user_id=?');
$stmt->bind_param('si', $hashed, $user_id);
if ($stmt->execute()) {
    echo "Đã cập nhật mật khẩu user_id=$user_id thành công!";
} else {
    echo "Lỗi: " . $stmt->error;
}

<?php 	
$localhost = "db"; // tên service MySQL trong docker-compose
$username = "myuser";
$password = "mypassword";
$dbname = "ims";
$store_url = "http://localhost:8001"; // sửa lại cho đúng port và không có dấu '/'

// db connection
$connect = new mysqli($localhost, $username, $password, $dbname);
$connect->set_charset("utf8mb4");
// check connection
if($connect->connect_error) {
  die("Connection Failed : " . $connect->connect_error);
}
?>
-- =========================
-- DATABASE STRUCTURE (schema)
-- =========================

-- 1. Table: brands
CREATE TABLE IF NOT EXISTS brands (
  brand_id INT AUTO_INCREMENT PRIMARY KEY,
  brand_name VARCHAR(255) NOT NULL,
  brand_active INT NOT NULL DEFAULT 0,
  brand_status INT NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table: categories
CREATE TABLE IF NOT EXISTS categories (
  categories_id INT AUTO_INCREMENT PRIMARY KEY,
  categories_name VARCHAR(255) NOT NULL,
  categories_active INT NOT NULL DEFAULT 0,
  categories_status INT NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table: users
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Active',
  avatar VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Table: product (items)
CREATE TABLE IF NOT EXISTS product (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(255),
  brand_id INT NOT NULL,
  categories_id INT NOT NULL,
  quantity INT NOT NULL,
  minStock INT DEFAULT 0,
  unit VARCHAR(50),
  store VARCHAR(255),
  rate DECIMAL(12,2) NOT NULL,
  active INT NOT NULL DEFAULT 0,
  status INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Table: orders
CREATE TABLE IF NOT EXISTS orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  order_date DATE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_contact VARCHAR(255) NOT NULL,
  sub_total DECIMAL(12,2) NOT NULL,
  vat DECIMAL(12,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  discount DECIMAL(12,2) NOT NULL,
  grand_total DECIMAL(12,2) NOT NULL,
  paid DECIMAL(12,2) NOT NULL,
  due DECIMAL(12,2) NOT NULL,
  payment_type INT NOT NULL,
  payment_status INT NOT NULL,
  payment_place INT NOT NULL,
  gstn VARCHAR(255),
  order_status INT NOT NULL DEFAULT 0,
  tag VARCHAR(50),
  user_id INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Table: order_item
CREATE TABLE IF NOT EXISTS order_item (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  rate DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  order_item_status INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Table: onHandItems
CREATE TABLE IF NOT EXISTS onHandItems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  image VARCHAR(255),
  model VARCHAR(50),
  location VARCHAR(255),
  quantity INT,
  minBalance INT,
  expiryDate DATE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Table: transactions (audit log)
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  action_type VARCHAR(32) NOT NULL,
  entity_type VARCHAR(32) NOT NULL,
  entity_id VARCHAR(64) DEFAULT NULL,
  data_before JSON DEFAULT NULL,
  data_after JSON DEFAULT NULL,
  description VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Table: tasks
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR(255),
  assignedTo VARCHAR(255),
  priority VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Table: issues
CREATE TABLE IF NOT EXISTS issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item VARCHAR(50),
  reportedBy VARCHAR(255),
  issue VARCHAR(255),
  status VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Table: issue (legacy)
CREATE TABLE IF NOT EXISTS issue (
  issue_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  reason VARCHAR(255) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- SAMPLE DATA IMPORT
-- =========================

-- USERS
INSERT INTO users (user_id, username, password, email, name, role, status, avatar)
VALUES
(2, 'admin2', '21232f297a57a5a743894a0e4a801fc3', '', 'Admin', 'supervisor', 'Active', 'https://i.pravatar.cc/40?u=admin'),
(3, 'john.doe', 'e10adc3949ba59abbe56e057f20f883e', 'john.doe@example.com', 'John Doe', 'Manager', 'Active', 'https://i.pravatar.cc/40?u=john'),
(4, 'jane.smith', 'e10adc3949ba59abbe56e057f20f883e', 'jane.smith@example.com', 'Jane Smith', 'Technician', 'Active', 'https://i.pravatar.cc/40?u=jane'),
(5, 'mike.j', 'e10adc3949ba59abbe56e057f20f883e', 'mike.j@example.com', 'Mike Johnson', 'Technician', 'Inactive', 'https://i.pravatar.cc/40?u=mike');

-- BRANDS
INSERT INTO brands (brand_id, brand_name, brand_active, brand_status)
VALUES
(1, 'Generic Inc.', 1, 1),
(2, 'TechCorp', 1, 1),
(3, 'Innovate LLC', 1, 1);

-- CATEGORIES
INSERT INTO categories (categories_id, categories_name, categories_active, categories_status)
VALUES
(1, 'Gas Kitting', 1, 1),
(2, 'Condet', 1, 1),
(3, 'Fittings', 1, 1);

-- PRODUCT (ITEMS)
INSERT INTO product (product_id, product_name, product_image, brand_id, categories_id, quantity, minStock, unit, store, rate, active, status)
VALUES
(1, 'Gas Kitting Kit 1', 'https://i.pravatar.cc/40?u=1', 1, 1, 1, 5, 'pcs', '22 House Store', 62.13, 0, 1),
(2, 'Condet Kit 2', 'https://i.pravatar.cc/40?u=2', 2, 2, 2, 5, 'pcs', 'HD Main Store', 34.5, 1, 1),
(3, 'Fittings Kit 3', 'https://i.pravatar.cc/40?u=3', 3, 3, 3, 5, 'pcs', 'HD Main Store', 89.01, 1, 1),
(4, 'Gas Kitting Kit 4', 'https://i.pravatar.cc/40?u=4', 1, 1, 4, 5, 'pcs', '22 House Store', 12.75, 1, 1),
(5, 'Condet Kit 5', 'https://i.pravatar.cc/40?u=5', 2, 2, 5, 5, 'pcs', 'HD Main Store', 55.0, 0, 1),
(6, 'Fittings Kit 6', 'https://i.pravatar.cc/40?u=6', 3, 3, 1, 5, 'pcs', 'HD Main Store', 4.99, 1, 1),
(7, 'Gas Kitting Kit 7', 'https://i.pravatar.cc/40?u=7', 1, 1, 2, 5, 'pcs', '22 House Store', 78.2, 1, 1);

-- ON HAND ITEMS
INSERT INTO onHandItems (name, image, model, location, quantity, minBalance, expiryDate)
VALUES
('Gas Kitting', 'https://i.pravatar.cc/40?u=item1', 'G-7893', '22 House Store', 88, 20, '2024-07-28'),
('Condet', 'https://i.pravatar.cc/40?u=item2', 'Co-7898', 'HD Main Store', 15, 20, '2024-08-02'),
('Condet', 'https://i.pravatar.cc/40?u=item3', 'G-7893', 'Tafo House Store', 5, 20, '2024-08-07'),
('Condet', 'https://i.pravatar.cc/40?u=item4', 'Co-7898', '22 House Store', 72, 20, '2024-08-12'),
('Gas Kitting', 'https://i.pravatar.cc/40?u=item5', 'G-7893', 'HD Main Store', 91, 20, '2024-08-17');

-- ORDERS
INSERT INTO orders (order_id, client_name, order_date, client_contact, sub_total, vat, total_amount, discount, grand_total, paid, due, payment_type, payment_status, payment_place, gstn, order_status, tag, user_id)
VALUES
(1001, 'John Doe', '2024-08-27', '0123456789', 900, 85.42, 985.42, 0, 985.42, 985.42, 0, 1, 1, 1, '', 1, 'urgent', 2),
(1002, 'Jane Smith', '2024-08-26', '0123456789', 120, 3.05, 123.05, 0, 123.05, 123.05, 0, 1, 1, 1, '', 1, 'urgent', 3);

-- ORDER ITEMS
INSERT INTO order_item (order_item_id, order_id, product_id, quantity, rate, total, order_item_status)
VALUES
(1, 1001, 1, 2, 62.13, 124.26, 1),
(2, 1001, 2, 3, 34.5, 103.5, 1),
(3, 1002, 3, 1, 89.01, 89.01, 1);

-- TRANSACTIONS
INSERT INTO transactions (user_id, action_type, entity_type, entity_id, data_before, data_after, description)
VALUES
(2, 'CREATE', 'order', '1001', NULL, '{"order_id":1001}', 'Created order 1001'),
(3, 'CREATE', 'order', '1002', NULL, '{"order_id":1002}', 'Created order 1002');

-- TASKS
INSERT INTO tasks (description, assignedTo, priority)
VALUES
('Quarterly stock count', 'Unassigned', 'High'),
('Audit warehouse A1', 'Jane Smith', 'Medium'),
('Restock safety equipment', 'Unassigned', 'High');

-- ISSUES
INSERT INTO issues (item, reportedBy, issue, status)
VALUES
('G-7893', 'John Doe', 'Faulty sensor', 'Pending'),
('Co-7898', 'Mike Johnson', 'Missing component', 'Pending'),
('G-7893', 'Jane Smith', 'Incorrect calibration', 'Closed');

-- LEGACY ISSUE
INSERT INTO issue (order_id, product_id, quantity, reason)
VALUES
(1001, 1, 1, 'Damaged on arrival'),
(1002, 2, 2, 'Missing parts');

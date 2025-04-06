CREATE DATABASE `pharmacy_management`;

USE pharmacy_management;

CREATE TABLE `users` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `creation_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `role` ENUM('admin', 'pharmacist') DEFAULT 'pharmacist',
    UNIQUE INDEX `idx_username` (`username`)
);

CREATE TABLE `items` (
    `item_id` INT PRIMARY KEY AUTO_INCREMENT,
    `item_code` VARCHAR(50) UNIQUE,
    `barcode` VARCHAR(100) UNIQUE,
    `name` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100) NULL,
    `price` INT NOT NULL,
    `image_path` VARCHAR(500),
    `is_expirable` BOOLEAN NOT NULL DEFAULT TRUE,
    `expire_date` DATE NULL,
    `alert_date` DATE NULL,
    `upload_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `quantity` INT DEFAULT 0,
    `remark` TEXT
);

CREATE TABLE `orders` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `item_code` VARCHAR(50) UNIQUE,
    `name` TEXT NOT NULL,
    `quantity` INT DEFAULT 0,
    `order_date` TEXT NULL,
    `coming_date` TEXT NULL
);

CREATE TABLE `sales` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `sale_id` VARCHAR(50) UNIQUE NOT NULL,
    `date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `subtotal` INT,
    `discount` INT,
    `cash_back` INT,
    `total` INT,
    `amount_paid` INT,
    `remaining_balance` INT
);

CREATE TABLE `sale_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `sale_id` VARCHAR(50),
    `item_code` VARCHAR(50),
    `barcode` VARCHAR(100),
    `name` VARCHAR(255),
    `price` DECIMAL(10,2),
    `quantity` INT,
    `total` INT,
    FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE
);
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
    `item_code` VARCHAR(50) PRIMARY KEY,
    `bar_code` VARCHAR(100) UNIQUE,
    `name` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `image_path` VARCHAR(500),
    `expire_date` DATE NULL,
    `alert_date` DATE NULL,
    `upload_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `quantity` INT DEFAULT 0,
    `remark` TEXT
);






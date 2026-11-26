-- Arek n Tochi (AnT) — Production MySQL Schema
-- Run: mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS ant_ecommerce
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ant_ecommerce;

CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    first_name    VARCHAR(50)  NOT NULL,
    last_name     VARCHAR(50)  NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number  VARCHAR(20),
    role          ENUM('customer','admin') DEFAULT 'customer',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    slug         VARCHAR(100) UNIQUE NOT NULL,
    description  TEXT,
    base_price   DECIMAL(10,2) NOT NULL,
    is_preorder  BOOLEAN DEFAULT FALSE,
    category     ENUM('corporate','casual','ankara') NOT NULL DEFAULT 'casual',
    image_url    VARCHAR(500),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_variants (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    product_id     INT NOT NULL,
    sku            VARCHAR(50) UNIQUE NOT NULL,
    size           ENUM('S','M','L','XL','XXL','Custom') NOT NULL,
    color          VARCHAR(30) NOT NULL,
    stock_quantity INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE orders (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    user_id           INT NOT NULL,
    total_amount      DECIMAL(10,2) NOT NULL,
    order_status      ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
    payment_status    ENUM('unpaid','paid','failed') DEFAULT 'unpaid',
    payment_reference VARCHAR(100) UNIQUE,
    shipping_address  TEXT NOT NULL,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    order_id          INT NOT NULL,
    variant_id        INT NOT NULL,
    quantity          INT NOT NULL,
    price_at_purchase DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);

-- ── SEED DATA ─────────────────────────────────────────────────────
INSERT INTO products (name, slug, description, base_price, category, image_url, is_preorder) VALUES
  ('Aso-Oke Drop Jacket','aso-oke-drop-jacket','Hand-woven Aso-Oke shell, structured drop-shoulder silhouette. Bespoke-tailored per order. Fully lined.',47500,'ankara','https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',0),
  ('Adire Oversize Tee','adire-oversize-tee','Tie-resist Adire indigo on 320gsm heavyweight cotton. Unisex oversized pattern.',18500,'casual','https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800',0),
  ('Lagos Corporate Set','lagos-corporate-set','Two-piece Ankara-blocked office ensemble. Sharp notched lapels, straight-cut trousers. Pre-order.',65000,'corporate','https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800',1),
  ('Ankara Drift Shorts','ankara-drift-shorts','Wide-leg relaxed shorts with Ankara panel inserts at hem and pocket trim.',22000,'ankara','https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',0),
  ('Utility Ankara Vest','utility-ankara-vest','Cargo-silhouette structured vest. Ankara-lined interior, six functional pockets.',28500,'ankara','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',0),
  ('Thread Jogger Set','thread-jogger-set','Matching heavyweight cotton jogger set with embroidered AnT mark. Pre-order drop.',38000,'casual','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',1);

INSERT INTO product_variants (product_id, sku, size, color, stock_quantity) VALUES
  (1,'ANT-AOJ-S-BLK','S','Black',3),(1,'ANT-AOJ-M-BLK','M','Black',5),(1,'ANT-AOJ-L-BLK','L','Black',4),
  (2,'ANT-AOT-M-IND','M','Indigo',10),(2,'ANT-AOT-L-IND','L','Indigo',8),(2,'ANT-AOT-XL-IND','XL','Indigo',6),
  (3,'ANT-LCS-S-BRN','S','Tan',2),(3,'ANT-LCS-M-BRN','M','Tan',3),
  (4,'ANT-ADS-M-MIX','M','Multicolor',12),(4,'ANT-ADS-L-MIX','L','Multicolor',10),
  (5,'ANT-UAV-M-KHK','M','Khaki',7),(5,'ANT-UAV-L-KHK','L','Khaki',5),
  (6,'ANT-TJS-S-BLK','S','Black',0),(6,'ANT-TJS-M-BLK','M','Black',0);

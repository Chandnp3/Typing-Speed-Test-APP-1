-- ============================================
-- TypeFlow Database Schema
-- Run this file in phpMyAdmin or MySQL CLI:
--   mysql -u root -p < sql/schema.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS typeflow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE typeflow;

-- ---- Users Table ----
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(20) NOT NULL DEFAULT '🧑‍💻',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- Scores Table ----
CREATE TABLE IF NOT EXISTS scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wpm INT NOT NULL DEFAULT 0,
    raw_wpm INT NOT NULL DEFAULT 0,
    accuracy INT NOT NULL DEFAULT 0,
    mode VARCHAR(20) NOT NULL DEFAULT 'time',
    duration INT NOT NULL DEFAULT 30,
    words_typed INT NOT NULL DEFAULT 0,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- Settings Table ----
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    theme VARCHAR(50) NOT NULL DEFAULT 'cyberpunk',
    mode VARCHAR(20) NOT NULL DEFAULT 'time',
    duration INT NOT NULL DEFAULT 30,
    word_count INT NOT NULL DEFAULT 25,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



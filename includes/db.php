<?php
/**
 * db.php - Database Connection (PDO)
 * Include this file to get a PDO connection to the database.
 *
 * Priority:
 *   1. config.php (if exists in project root — for Hostinger)
 *   2. Environment variables (DB_HOST, DB_NAME, DB_USER, DB_PASS)
 *   3. Default credentials below (configured for Hostinger)
 *
 * ⚠️ For LOCAL XAMPP development:
 *    Set these env vars in your system or create a local config.php:
 *      DB_HOST=localhost, DB_USER=root, DB_PASS=, DB_NAME=typeflow
 */

// Load config.php from the project root if it exists (can override defaults)
$configPath = __DIR__ . '/../config.php';
if (file_exists($configPath)) {
    require_once $configPath;
}

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        // ---- HOSTINGER CREDENTIALS (default) ----
        $host   = defined('DB_HOST') ? DB_HOST : (getenv('DB_HOST') ?: 'localhost');
        $dbname = defined('DB_NAME') ? DB_NAME : (getenv('DB_NAME') ?: 'u123456789bd');
        $user   = defined('DB_USER') ? DB_USER : (getenv('DB_USER') ?: 'u123456789ad');
        $pass   = defined('DB_PASS') ? DB_PASS : (getenv('DB_PASS') ?: 'Maya@349');

        try {
            $pdo = new PDO(
                "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
                $user,
                $pass,
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            die(json_encode([
                'success' => false,
                'error' => 'Database connection failed',
                'details' => $e->getMessage()
            ]));
        }
    }
    return $pdo;
}

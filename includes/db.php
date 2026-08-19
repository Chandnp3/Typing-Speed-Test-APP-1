<?php
/**
 * db.php - Database Connection (PDO)
 * Include this file to get a PDO connection to the database.
 *
 * Priority:
 *   1. config.php (if it exists in the project root)
 *   2. Environment variables (DB_HOST, DB_NAME, DB_USER, DB_PASS)
 *   3. XAMPP local defaults below (root / no password / typeflow)
 *
 * For Hostinger/production: update config.php with hosting credentials.
 */


// Load config.php from the project root if it exists (can override defaults)
$configPath = __DIR__ . '/../config.php';
if (file_exists($configPath)) {
    require_once $configPath;
}

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        // ---- LOCAL XAMPP defaults (overridden by config.php or env vars) ----
        $host   = defined('DB_HOST') ? DB_HOST : (getenv('DB_HOST') ?: 'localhost');
        $dbname = defined('DB_NAME') ? DB_NAME : (getenv('DB_NAME') ?: 'typeflow');
        $user   = defined('DB_USER') ? DB_USER : (getenv('DB_USER') ?: 'root');
        $pass   = defined('DB_PASS') ? DB_PASS : (getenv('DB_PASS') ?: '');

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

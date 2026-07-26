<?php
/**
 * db.php - Database Connection (PDO)
 * Include this file to get a PDO connection to the database.
 *
 * Credentials are loaded from config.php (Hostinger) first,
 * then fall back to environment variables, then defaults.
 */

// Load config.php from the project root if it exists (Hostinger deployment)
$configPath = __DIR__ . '/../config.php';
if (file_exists($configPath)) {
    require_once $configPath;
}

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $host = defined('DB_HOST') ? DB_HOST : (getenv('DB_HOST') ?: 'localhost');
        $dbname = defined('DB_NAME') ? DB_NAME : (getenv('DB_NAME') ?: 'typeflow');
        $user = defined('DB_USER') ? DB_USER : (getenv('DB_USER') ?: 'root');
        $pass = defined('DB_PASS') ? DB_PASS : (getenv('DB_PASS') ?: '');

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

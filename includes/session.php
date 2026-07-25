<?php
/**
 * session.php - Session Management
 * Start session and provide auth helper functions.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Get the current logged-in user's ID, or null if not authenticated.
 */
function getAuthUserId(): ?int {
    return $_SESSION['user_id'] ?? null;
}

/**
 * Get current user data from database, or null.
 */
function getAuthUser(): ?array {
    $userId = getAuthUserId();
    if (!$userId) return null;

    try {
        $db = getDB();
        $stmt = $db->prepare("SELECT id, nickname, email, avatar, created_at FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        return $stmt->fetch() ?: null;
    } catch (Exception $e) {
        return null;
    }
}

/**
 * Require authentication. Redirects to login page if not logged in.
 */
function requireAuth(): void {
    if (!getAuthUserId()) {
        header('Location: login.php');
        exit;
    }
}

/**
 * Redirect if already logged in (for login/register pages).
 */
function redirectIfAuthenticated(): void {
    if (getAuthUserId()) {
        header('Location: index.php');
        exit;
    }
}

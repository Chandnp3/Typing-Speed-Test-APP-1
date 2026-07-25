<?php
/**
 * logout.php - Logout
 * Destroys session and redirects to login page.
 */

require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/session.php';

$_SESSION = [];
session_destroy();
setcookie(session_name(), '', time() - 3600, '/');

header('Location: login.php');
exit;

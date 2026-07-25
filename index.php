<?php
/**
 * index.php - Landing Page
 * Redirects to dashboard if logged in, or typing test (guest mode) if not.
 */

require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/session.php';

$user = getAuthUser();
if ($user) {
    header('Location: dashboard.php');
} else {
    header('Location: typing.php');
}
exit;

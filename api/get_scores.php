<?php
/**
 * api/get_scores.php - Get User Scores Endpoint
 * GET: ?user_id=X&limit=20
 * Returns: { success, scores: [...] }
 */

require_once __DIR__ . '/../includes/db.php';

header('Content-Type: application/json');

$userId = (int)($_GET['user_id'] ?? 0);
$limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));

if (!$userId) {
    http_response_code(400);
    die(json_encode(['success' => false, 'error' => 'User ID is required.']));
}

try {
    $db = getDB();
    // Note: LIMIT must be interpolated as int (MySQL doesn't support prepared placeholders for LIMIT)
    $stmt = $db->prepare("SELECT id, wpm, raw_wpm, accuracy, mode, duration, words_typed, date FROM scores WHERE user_id = ? ORDER BY date DESC LIMIT " . (int)$limit);
    $stmt->execute([$userId]);
    $scores = $stmt->fetchAll();

    echo json_encode(['success' => true, 'scores' => $scores]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to fetch scores.', 'details' => $e->getMessage()]);
}

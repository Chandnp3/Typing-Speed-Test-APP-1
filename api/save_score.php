<?php
/**
 * api/save_score.php - Save Test Score Endpoint
 * POST: { user_id, wpm, raw_wpm, accuracy, mode, duration, words_typed }
 * Returns: { success, score_id? }
 */

require_once __DIR__ . '/../includes/db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['success' => false, 'error' => 'Method not allowed']));
}

$input = json_decode(file_get_contents('php://input'), true);
$userId = (int)($input['user_id'] ?? 0);
$wpm = (int)($input['wpm'] ?? 0);
$rawWpm = (int)($input['rawWpm'] ?? 0);
$accuracy = (int)($input['accuracy'] ?? 0);
$mode = $input['mode'] ?? 'time';
$duration = (int)($input['duration'] ?? 30);
$wordsTyped = (int)($input['wordsTyped'] ?? 0);

if (!$userId) {
    http_response_code(400);
    die(json_encode(['success' => false, 'error' => 'User ID is required.']));
}

try {
    $db = getDB();
    $stmt = $db->prepare("INSERT INTO scores (user_id, wpm, raw_wpm, accuracy, mode, duration, words_typed, date) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
    $stmt->execute([$userId, $wpm, $rawWpm, $accuracy, $mode, $duration, $wordsTyped]);

    echo json_encode([
        'success' => true,
        'score_id' => (int)$db->lastInsertId()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save score.', 'details' => $e->getMessage()]);
}

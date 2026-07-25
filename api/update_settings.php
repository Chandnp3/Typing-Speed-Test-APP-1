<?php
/**
 * api/update_settings.php - Update User Settings Endpoint
 * POST: { user_id, theme?, mode?, duration?, word_count? }
 * Returns: { success }
 */

require_once __DIR__ . '/../includes/db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['success' => false, 'error' => 'Method not allowed']));
}

$input = json_decode(file_get_contents('php://input'), true);
$userId = (int)($input['user_id'] ?? 0);

if (!$userId) {
    http_response_code(400);
    die(json_encode(['success' => false, 'error' => 'User ID is required.']));
}

try {
    $db = getDB();

    // Build dynamic UPDATE
    $fields = [];
    $params = [];

    if (isset($input['theme'])) {
        $fields[] = 'theme = ?';
        $params[] = $input['theme'];
    }
    if (isset($input['mode'])) {
        $fields[] = 'mode = ?';
        $params[] = $input['mode'];
    }
    if (isset($input['duration'])) {
        $fields[] = 'duration = ?';
        $params[] = (int)$input['duration'];
    }
    if (isset($input['word_count'])) {
        $fields[] = 'word_count = ?';
        $params[] = (int)$input['word_count'];
    }

    if (empty($fields)) {
        die(json_encode(['success' => false, 'error' => 'No settings to update.']));
    }

    $params[] = $userId;
    $stmt = $db->prepare("UPDATE settings SET " . implode(', ', $fields) . " WHERE user_id = ?");
    $stmt->execute($params);

    // If no row exists yet, insert
    if ($stmt->rowCount() === 0) {
        $defaults = ['theme' => 'cyberpunk', 'mode' => 'time', 'duration' => 30, 'word_count' => 25];
        $stmt = $db->prepare("INSERT INTO settings (user_id, theme, mode, duration, word_count) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $userId,
            $input['theme'] ?? $defaults['theme'],
            $input['mode'] ?? $defaults['mode'],
            (int)($input['duration'] ?? $defaults['duration']),
            (int)($input['word_count'] ?? $defaults['word_count'])
        ]);
    }

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to update settings.', 'details' => $e->getMessage()]);
}

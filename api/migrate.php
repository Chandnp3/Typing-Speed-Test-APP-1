<?php
/**
 * api/migrate.php - Migrate Old localStorage Data to MySQL
 * POST: { user_id, scores: [...], settings: {...} }
 * Returns: { success, imported_scores }
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
    $imported = 0;

    // Import scores
    if (!empty($input['scores']) && is_array($input['scores'])) {
        $stmt = $db->prepare("INSERT INTO scores (user_id, wpm, raw_wpm, accuracy, mode, duration, words_typed, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($input['scores'] as $score) {
            try {
                $stmt->execute([
                    $userId,
                    (int)($score['wpm'] ?? 0),
                    (int)($score['rawWpm'] ?? $score['raw_wpm'] ?? 0),
                    (int)($score['accuracy'] ?? 0),
                    $score['mode'] ?? 'time',
                    (int)($score['duration'] ?? 30),
                    (int)($score['wordsTyped'] ?? $score['words_typed'] ?? 0),
                    $score['date'] ?? date('Y-m-d H:i:s')
                ]);
                $imported++;
            } catch (Exception $e) { /* skip invalid entries */ }
        }
    }

    // Import settings if not already set
    if (!empty($input['settings'])) {
        $stmt = $db->prepare("SELECT id FROM settings WHERE user_id = ?");
        $stmt->execute([$userId]);
        if (!$stmt->fetch()) {
            $s = $input['settings'];
            $stmt = $db->prepare("INSERT INTO settings (user_id, theme, mode, duration, word_count) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $userId,
                $s['theme'] ?? 'cyberpunk',
                $s['mode'] ?? 'time',
                (int)($s['duration'] ?? 30),
                (int)($s['wordCount'] ?? $s['word_count'] ?? 25)
            ]);
        }
    }

    echo json_encode(['success' => true, 'imported_scores' => $imported]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Migration failed.', 'details' => $e->getMessage()]);
}

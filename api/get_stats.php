<?php
/**
 * api/get_stats.php - Get Aggregate Stats Endpoint
 * GET: ?user_id=X
 * Returns: { success, stats: { totalTests, bestWpm, avgWpm, avgAccuracy } }
 */

require_once __DIR__ . '/../includes/db.php';

header('Content-Type: application/json');

$userId = (int)($_GET['user_id'] ?? 0);

if (!$userId) {
    http_response_code(400);
    die(json_encode(['success' => false, 'error' => 'User ID is required.']));
}

try {
    $db = getDB();
    $stmt = $db->prepare("SELECT COUNT(*) as total, COALESCE(MAX(wpm), 0) as best, COALESCE(ROUND(AVG(wpm)), 0) as avg_wpm, COALESCE(ROUND(AVG(accuracy)), 0) as avg_acc FROM scores WHERE user_id = ?");
    $stmt->execute([$userId]);
    $row = $stmt->fetch();

    echo json_encode([
        'success' => true,
        'stats' => [
            'totalTests' => (int)$row['total'],
            'bestWpm' => (int)$row['best'],
            'avgWpm' => (int)$row['avg_wpm'],
            'avgAccuracy' => (int)$row['avg_acc']
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to fetch stats.', 'details' => $e->getMessage()]);
}

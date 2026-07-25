<?php
/**
 * api/get_leaderboard.php - Public Leaderboard Endpoint
 * GET: ?mode=time|words&limit=50
 * Returns: { success, leaderboard: [{ rank, user_id, nickname, avatar, best_wpm, avg_accuracy, tests_count }] }
 */

require_once __DIR__ . '/../includes/db.php';

header('Content-Type: application/json');

$mode = $_GET['mode'] ?? 'time';
$limit = min(50, max(1, (int)($_GET['limit'] ?? 50)));
$userId = (int)($_GET['user_id'] ?? 0);

// Validate mode
if (!in_array($mode, ['time', 'words'])) {
    $mode = 'time';
}

try {
    $db = getDB();

    // Get top 50 users by best single WPM in the given mode
    // Using a subquery to find each user's best WPM score, then joining to get details
    $stmt = $db->prepare("
        SELECT 
            u.id as user_id,
            u.nickname,
            u.avatar,
            s.best_wpm,
            s.best_accuracy,
            s.tests_count
        FROM users u
        INNER JOIN (
            SELECT 
                user_id,
                MAX(wpm) as best_wpm,
                -- Get the accuracy from the score that had the best WPM
                SUBSTRING_INDEX(GROUP_CONCAT(accuracy ORDER BY wpm DESC, accuracy DESC), ',', 1) as best_accuracy,
                COUNT(*) as tests_count
            FROM scores
            WHERE mode = ?
            GROUP BY user_id
            HAVING tests_count >= 1
        ) s ON u.id = s.user_id
        ORDER BY s.best_wpm DESC, s.best_accuracy DESC
        LIMIT " . $limit
    );

    $stmt->execute([$mode]);
    $rows = $stmt->fetchAll();

    $leaderboard = [];
    $rank = 1;
    foreach ($rows as $row) {
        $leaderboard[] = [
            'rank' => $rank++,
            'user_id' => (int)$row['user_id'],
            'nickname' => $row['nickname'],
            'avatar' => $row['avatar'],
            'best_wpm' => (int)$row['best_wpm'],
            'best_accuracy' => (int)$row['best_accuracy'],
            'tests_count' => (int)$row['tests_count'],
        ];
    }

    // Get current user's rank if logged in
    $myRank = null;
    $myStats = null;
    if ($userId) {
        // First check if user has any scores in this mode
        $stmtCheck = $db->prepare("SELECT COUNT(*) as cnt FROM scores WHERE user_id = ? AND mode = ?");
        $stmtCheck->execute([$userId, $mode]);
        $checkRow = $stmtCheck->fetch();
        $hasScores = $checkRow && $checkRow['cnt'] > 0;

        if ($hasScores) {
            // Count users with a higher best_wpm, then add 1 for the rank
            $stmtRank = $db->prepare("
                SELECT COUNT(*) + 1 as rank
                FROM (
                    SELECT user_id, MAX(wpm) as best_wpm
                    FROM scores
                    WHERE mode = ?
                    GROUP BY user_id
                ) ranked
                WHERE best_wpm > (
                    SELECT MAX(wpm)
                    FROM scores
                    WHERE user_id = ? AND mode = ?
                )
            ");
            $stmtRank->execute([$mode, $userId, $mode]);
            $rankRow = $stmtRank->fetch();
            $myRank = $rankRow ? (int)$rankRow['rank'] : null;

            // Get user's best stats
            $stmtMy = $db->prepare("
                SELECT MAX(wpm) as best_wpm,
                       SUBSTRING_INDEX(GROUP_CONCAT(accuracy ORDER BY wpm DESC, accuracy DESC), ',', 1) as best_accuracy,
                       COUNT(*) as tests_count
                FROM scores WHERE user_id = ? AND mode = ?
            ");
            $stmtMy->execute([$userId, $mode]);
            $myRow = $stmtMy->fetch();
            if ($myRow) {
                $myStats = [
                    'best_wpm' => (int)$myRow['best_wpm'],
                    'best_accuracy' => (int)$myRow['best_accuracy'],
                    'tests_count' => (int)$myRow['tests_count'],
                ];
            }
        }
    }

    // Get total number of ranked users for this mode
    $stmtTotal = $db->prepare("SELECT COUNT(DISTINCT user_id) as total FROM scores WHERE mode = ?");
    $stmtTotal->execute([$mode]);
    $totalRow = $stmtTotal->fetch();
    $totalRankedUsers = $totalRow ? (int)$totalRow['total'] : 0;

    echo json_encode([
        'success' => true,
        'mode' => $mode,
        'leaderboard' => $leaderboard,
        'my_rank' => $myRank,
        'my_stats' => $myStats,
        'total_users' => $totalRankedUsers,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch leaderboard.',
        'details' => $e->getMessage(),
    ]);
}

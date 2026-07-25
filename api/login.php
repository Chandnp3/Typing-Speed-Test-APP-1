<?php
/**
 * api/login.php - Login Endpoint
 * POST: { email, password }
 * Returns: { success, user?, error? }
 */

require_once __DIR__ . '/../includes/db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['success' => false, 'error' => 'Method not allowed']));
}

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    die(json_encode(['success' => false, 'error' => 'Email and password are required.']));
}

try {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([strtolower($email)]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        die(json_encode(['success' => false, 'error' => 'No account found with this email.']));
    }

    if (!password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        die(json_encode(['success' => false, 'error' => 'Incorrect password. Please try again.']));
    }

    // Set session
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $_SESSION['user_id'] = (int)$user['id'];
    session_regenerate_id(true);

    // Import guest scores if provided
    if (!empty($input['guest_scores']) && is_array($input['guest_scores'])) {
        $stmt = $db->prepare("INSERT INTO scores (user_id, wpm, raw_wpm, accuracy, mode, duration, words_typed, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($input['guest_scores'] as $gs) {
            $stmt->execute([
                (int)$user['id'],
                (int)($gs['wpm'] ?? 0),
                (int)($gs['rawWpm'] ?? 0),
                (int)($gs['accuracy'] ?? 0),
                $gs['mode'] ?? 'time',
                (int)($gs['duration'] ?? 30),
                (int)($gs['wordsTyped'] ?? 0),
                $gs['date'] ?? date('Y-m-d H:i:s')
            ]);
        }
    }

    echo json_encode([
        'success' => true,
        'user' => [
            'id' => (int)$user['id'],
            'nickname' => $user['nickname'],
            'email' => $user['email'],
            'avatar' => $user['avatar'],
            'created_at' => $user['created_at']
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error. Please try again.', 'details' => $e->getMessage()]);
}

<?php
/**
 * api/register.php - Registration Endpoint
 * POST: { nickname, email, password, avatar }
 * Returns: { success, user?, error? }
 */

require_once __DIR__ . '/../includes/db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['success' => false, 'error' => 'Method not allowed']));
}

$input = json_decode(file_get_contents('php://input'), true);
$nickname = trim($input['nickname'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$avatar = $input['avatar'] ?? '🧑‍💻';

// Validation
if (!$nickname || !$email || !$password) {
    http_response_code(400);
    die(json_encode(['success' => false, 'error' => 'All fields are required.']));
}

if (strlen($password) < 6) {
    http_response_code(400);
    die(json_encode(['success' => false, 'error' => 'Password must be at least 6 characters.']));
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    die(json_encode(['success' => false, 'error' => 'Please enter a valid email address.']));
}

try {
    $db = getDB();

    // Check if email already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([strtolower($email)]);
    if ($stmt->fetch()) {
        http_response_code(409);
        die(json_encode(['success' => false, 'error' => 'An account with this email already exists.']));
    }

    // Hash password
    $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

    // Create user
    $stmt = $db->prepare("INSERT INTO users (nickname, email, password_hash, avatar, created_at) VALUES (?, ?, ?, ?, NOW())");
    $stmt->execute([$nickname, strtolower($email), $passwordHash, $avatar]);
    $userId = (int)$db->lastInsertId();

    // Create default settings
    $stmt = $db->prepare("INSERT INTO settings (user_id, theme, mode, duration, word_count) VALUES (?, 'cyberpunk', 'time', 30, 25)");
    $stmt->execute([$userId]);

    // Set session
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $_SESSION['user_id'] = $userId;
    session_regenerate_id(true);

    // Import guest scores if provided
    if (!empty($input['guest_scores']) && is_array($input['guest_scores'])) {
        $stmt = $db->prepare("INSERT INTO scores (user_id, wpm, raw_wpm, accuracy, mode, duration, words_typed, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($input['guest_scores'] as $gs) {
            $stmt->execute([
                $userId,
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
            'id' => $userId,
            'nickname' => $nickname,
            'email' => strtolower($email),
            'avatar' => $avatar,
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error. Please try again.', 'details' => $e->getMessage()]);
}

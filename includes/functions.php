<?php
/** Kumpulan fungsi bantu (helper). */

function e(?string $v): string
{
    return htmlspecialchars((string) $v, ENT_QUOTES, 'UTF-8');
}

function url(string $path = ''): string
{
    return BASE_URL . '/' . ltrim($path, '/');
}

function redirect(string $path): void
{
    header('Location: ' . (preg_match('#^https?://#', $path) ? $path : url($path)));
    exit;
}

/** Ambil seluruh pengaturan sebagai array kunci => nilai. */
function settings(?string $key = null, string $default = '')
{
    static $cache = null;
    global $pdo;
    if ($cache === null) {
        $cache = [];
        foreach ($pdo->query('SELECT kunci, nilai FROM pengaturan') as $row) {
            $cache[$row['kunci']] = $row['nilai'];
        }
    }
    if ($key === null) {
        return $cache;
    }
    return ($cache[$key] ?? '') !== '' ? $cache[$key] : $default;
}

function slugify(string $text): string
{
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    return trim($text, '-') ?: 'item-' . time();
}

function tanggal_id(?string $date, bool $withDay = false): string
{
    if (!$date || $date === '0000-00-00') {
        return '-';
    }
    $ts = strtotime($date);
    $hari  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    $bulan = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    $out = date('j', $ts) . ' ' . $bulan[(int) date('n', $ts)] . ' ' . date('Y', $ts);
    return $withDay ? $hari[(int) date('w', $ts)] . ', ' . $out : $out;
}

function rupiah($angka): string
{
    return 'Rp ' . number_format((float) $angka, 0, ',', '.');
}

function excerpt(?string $text, int $len = 140): string
{
    $text = trim(strip_tags((string) $text));
    return mb_strlen($text) > $len ? mb_substr($text, 0, $len) . '…' : $text;
}

/** Gambar dengan fallback placeholder SVG. */
function img_src(?string $file, string $folder, string $fallback = 'placeholder.svg'): string
{
    if ($file && is_file(UPLOAD_PATH . '/' . $folder . '/' . $file)) {
        return url('uploads/' . $folder . '/' . rawurlencode($file));
    }
    return url('assets/img/' . $fallback);
}

/** Upload gambar sederhana + validasi. Mengembalikan nama file atau null. */
function upload_image(string $field, string $folder, ?string $oldFile = null): ?string
{
    if (empty($_FILES[$field]['name']) || $_FILES[$field]['error'] === UPLOAD_ERR_NO_FILE) {
        return $oldFile;
    }
    if ($_FILES[$field]['error'] !== UPLOAD_ERR_OK) {
        return $oldFile;
    }
    $allowed = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp', 'gif' => 'image/gif'];
    $ext = strtolower(pathinfo($_FILES[$field]['name'], PATHINFO_EXTENSION));
    if (!isset($allowed[$ext])) {
        return $oldFile;
    }
    if ($_FILES[$field]['size'] > 3 * 1024 * 1024) { // maks 3 MB
        return $oldFile;
    }
    $info = @getimagesize($_FILES[$field]['tmp_name']);
    if ($info === false) {
        return $oldFile;
    }
    $dir = UPLOAD_PATH . '/' . $folder;
    if (!is_dir($dir)) {
        @mkdir($dir, 0775, true);
    }
    $name = $folder . '-' . date('YmdHis') . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
    if (!move_uploaded_file($_FILES[$field]['tmp_name'], $dir . '/' . $name)) {
        return $oldFile;
    }
    if ($oldFile && is_file($dir . '/' . $oldFile)) {
        @unlink($dir . '/' . $oldFile);
    }
    return $name;
}

/** CSRF token */
function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf" value="' . csrf_token() . '">';
}

function csrf_check(): void
{
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (empty($_POST['csrf']) || !hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'])) {
            http_response_code(419);
            exit('Sesi kedaluwarsa. Silakan muat ulang halaman.');
        }
    }
}

function flash(?string $msg = null, string $type = 'success')
{
    if ($msg !== null) {
        $_SESSION['flash'] = ['msg' => $msg, 'type' => $type];
        return null;
    }
    $f = $_SESSION['flash'] ?? null;
    unset($_SESSION['flash']);
    return $f;
}

function is_logged_in(): bool
{
    return !empty($_SESSION['user_id']);
}

function require_login(): void
{
    if (!is_logged_in()) {
        $next = ltrim(str_replace(BASE_URL, '', (string) ($_SERVER['REQUEST_URI'] ?? '')), '/');
        redirect('admin/login.php' . ($next ? '?next=' . urlencode($next) : ''));
    }
}

/** Data lengkap pengguna yang sedang login. */
function current_user(): array
{
    global $pdo;
    static $u = null;
    if ($u === null) {
        if (!is_logged_in()) {
            return [];
        }
        $st = $pdo->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
        $st->execute([$_SESSION['user_id']]);
        $u = $st->fetch() ?: [];
    }
    return $u;
}

function is_admin(): bool
{
    return ($_SESSION['user_role'] ?? '') === 'admin';
}

/** Halaman khusus Administrator (Operator ditolak). */
function require_admin(): void
{
    require_login();
    if (!is_admin()) {
        flash('Halaman tersebut hanya dapat diakses oleh Administrator.', 'danger');
        redirect('admin/index.php');
    }
}

function count_rows(string $table): int
{
    global $pdo;
    return (int) $pdo->query('SELECT COUNT(*) FROM `' . $table . '`')->fetchColumn();
}

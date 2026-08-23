<?php
/**
 * Konfigurasi koneksi database (XAMPP default).
 * Ubah nilai di bawah bila pengaturan MySQL Anda berbeda.
 */
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'desa_fataatu_timur');
define('DB_PORT', 3306);

try {
    $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo '<!doctype html><html lang="id"><head><meta charset="utf-8">'
       . '<meta name="viewport" content="width=device-width, initial-scale=1">'
       . '<title>Koneksi Database Gagal</title>'
       . '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"></head>'
       . '<body class="bg-light"><div class="container py-5"><div class="card shadow-sm mx-auto" style="max-width:720px">'
       . '<div class="card-body p-4"><h1 class="h4 text-danger">Koneksi Database Gagal</h1>'
       . '<p class="text-muted">Website tidak dapat terhubung ke MySQL.</p><ol class="small">'
       . '<li>Jalankan <strong>Apache</strong> dan <strong>MySQL</strong> pada XAMPP Control Panel.</li>'
       . '<li>Import file <code>database/desa_fataatu_timur.sql</code> melalui phpMyAdmin.</li>'
       . '<li>Periksa kembali <code>config/database.php</code>.</li></ol>'
       . '<pre class="bg-light p-3 small mb-0">' . htmlspecialchars($e->getMessage()) . '</pre>'
       . '</div></div></div></body></html>';
    exit;
}

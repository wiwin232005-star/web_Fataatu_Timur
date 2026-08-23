<?php
/**
 * Konfigurasi umum aplikasi.
 */
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

date_default_timezone_set('Asia/Makassar'); // WITA

define('APP_NAME', 'Website Resmi Desa Fataatu Timur');
define('ROOT_PATH', dirname(__DIR__));
define('UPLOAD_PATH', ROOT_PATH . DIRECTORY_SEPARATOR . 'uploads');

/** Base URL otomatis (tanpa konfigurasi manual di XAMPP). */
if (!defined('BASE_URL')) {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host   = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $script = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/'));
    // Jika berada di dalam folder /admin, naik satu level.
    if (preg_match('#/admin$#', $script)) {
        $script = preg_replace('#/admin$#', '', $script);
    }
    $script = rtrim($script, '/');
    define('BASE_URL', $scheme . '://' . $host . $script);
}

require_once __DIR__ . '/database.php';
require_once ROOT_PATH . '/includes/functions.php';

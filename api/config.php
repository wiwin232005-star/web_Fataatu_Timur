<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

$host = 'localhost';
$db   = 'fataatu_timur';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=$charset", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok'=>false,'message'=>'Koneksi database gagal. Periksa api/config.php dan database MySQL.']);
    exit;
}
function body(): array {
    $raw=file_get_contents('php://input');
    $d=json_decode($raw,true);
    return is_array($d)?$d:[];
}
function out($data,int $code=200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
    exit;
}

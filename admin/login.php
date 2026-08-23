<?php
/**
 * Halaman login administrator.
 *
 * ALUR KERJA (berurutan):
 *  1. Sudah login  -> langsung diarahkan ke dashboard.
 *  2. Cek proteksi brute force (maksimal 5 percobaan / 10 menit).
 *  3. Validasi token CSRF + input wajib.
 *  4. Ambil data user berdasarkan username.
 *  5. Verifikasi password (hash bcrypt, sekaligus mendukung password lama
 *     berformat teks biasa -> otomatis di-upgrade menjadi hash).
 *  6. Regenerasi session, simpan identitas, arahkan ke halaman tujuan.
 */

require_once __DIR__ . '/../config/config.php';

if (is_logged_in()) {
    redirect('admin/index.php');
}

/* Halaman tujuan setelah login (dipakai bila sesi habis di tengah pekerjaan). */
$next = (string) ($_GET['next'] ?? 'admin/index.php');
if (!preg_match('#^admin/[A-Za-z0-9_\-./?=&%]*$#', $next)) {
    $next = 'admin/index.php';
}

$err = '';

/* --- Langkah 2: proteksi percobaan login --- */
$_SESSION['login_try'] = $_SESSION['login_try'] ?? ['n' => 0, 'time' => time()];
if (time() - $_SESSION['login_try']['time'] > 600) {
    $_SESSION['login_try'] = ['n' => 0, 'time' => time()];
}
$terkunci = $_SESSION['login_try']['n'] >= 5;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();

    if ($terkunci) {
        $sisa = 600 - (time() - $_SESSION['login_try']['time']);
        $err  = 'Terlalu banyak percobaan gagal. Coba lagi dalam ' . max(1, (int) ceil($sisa / 60)) . ' menit.';
    } else {
        $u = trim((string) ($_POST['username'] ?? ''));
        $p = (string) ($_POST['password'] ?? '');

        if ($u === '' || $p === '') {
            $err = 'Username dan password wajib diisi.';
        } else {
            $st = $pdo->prepare('SELECT * FROM users WHERE username = ? LIMIT 1');
            $st->execute([$u]);
            $user = $st->fetch();

            $cocok = false;
            if ($user) {
                $simpan = (string) $user['password'];
                $isHash = (bool) preg_match('/^\$2[aby]\$|^\$argon2/', $simpan);

                if ($isHash) {
                    $cocok = password_verify($p, $simpan);
                } elseif (hash_equals($simpan, $p)) {
                    /* Password lama masih teks biasa -> upgrade otomatis ke hash. */
                    $cocok = true;
                    $pdo->prepare('UPDATE users SET password = ? WHERE id = ?')
                        ->execute([password_hash($p, PASSWORD_DEFAULT), $user['id']]);
                }
            }

            if ($cocok) {
                session_regenerate_id(true);
                $_SESSION['login_try'] = ['n' => 0, 'time' => time()];
                $_SESSION['user_id']   = $user['id'];
                $_SESSION['user_nama'] = $user['nama'];
                $_SESSION['user_name'] = $user['username'];
                $_SESSION['user_role'] = $user['role'];
                flash('Selamat datang kembali, ' . $user['nama'] . '.');
                redirect($next);
            }

            $_SESSION['login_try']['n']++;
            $sisaCoba = max(0, 5 - $_SESSION['login_try']['n']);
            $err = 'Username atau password salah.' . ($sisaCoba ? ' Sisa percobaan: ' . $sisaCoba . '.' : '');
        }
    }
}
?>
<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Login Admin &middot; <?= e(settings('nama_desa')) ?></title>
<meta name="description" content="Halaman login administrator website resmi Desa Fataatu Timur.">
<meta name="robots" content="noindex,nofollow">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link href="<?= url('assets/css/style.css') ?>" rel="stylesheet">
</head>
<body>
<div class="login-wrap">
  <div class="login-card">
    <div class="text-center mb-4">
      <img src="<?= url('assets/img/logo.svg') ?>" width="64" height="64" alt="Logo Desa Fataatu Timur">
      <h1 class="h5 mt-3 mb-1">Panel Administrator</h1>
      <p class="small text-muted mb-0"><?= e(settings('nama_desa')) ?></p>
    </div>
    <?php if ($err): ?><div class="alert alert-danger py-2 small"><?= e($err) ?></div><?php endif; ?>
    <form method="post" class="needs-validation" novalidate>
      <?= csrf_field() ?>
      <div class="mb-3">
        <label class="form-label" for="username">Username</label>
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-person"></i></span>
          <input class="form-control" id="username" name="username" required autofocus autocomplete="username">
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label" for="password">Password</label>
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-lock"></i></span>
          <input type="password" class="form-control" id="password" name="password" required autocomplete="current-password">
          <button class="btn btn-outline-secondary" type="button" id="togglePw" aria-label="Tampilkan password"><i class="bi bi-eye"></i></button>
        </div>
      </div>
      <button class="btn btn-brand w-100 py-2">Masuk</button>
    </form>
    <div class="alert alert-warning small mt-3 mb-0">
      <strong>Akun bawaan sistem:</strong><br>
      Administrator &rarr; username <code>admin</code>, password <code>admin123</code><br>
      Operator &rarr; username <code>operator</code>, password <code>operator123</code><br>
      Segera ganti password melalui menu <em>Pengguna Admin</em> / <em>Profil Akun</em>.
    </div>
    <div class="text-center mt-3"><a class="small text-muted" href="<?= url('index.php') ?>">&larr; Kembali ke website</a></div>
  </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="<?= url('assets/js/main.js') ?>"></script>
<script>
document.getElementById('togglePw').addEventListener('click', function () {
  var i = document.getElementById('password');
  var show = i.type === 'password';
  i.type = show ? 'text' : 'password';
  this.innerHTML = show ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
});
</script>
</body>
</html>

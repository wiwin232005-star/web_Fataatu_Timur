<?php
require_once __DIR__ . '/../config/config.php';
require_login();
$adminTitle = 'Profil Akun';

$err = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $nama = trim((string) ($_POST['nama'] ?? ''));
    $lama = (string) ($_POST['password_lama'] ?? '');
    $baru = (string) ($_POST['password_baru'] ?? '');
    $ulang = (string) ($_POST['password_ulang'] ?? '');

    if ($nama === '') { $err[] = 'Nama wajib diisi.'; }

    $st = $pdo->prepare('SELECT * FROM users WHERE id = ?');
    $st->execute([$_SESSION['user_id']]);
    $user = $st->fetch();

    if ($baru !== '') {
        if (!password_verify($lama, $user['password'])) { $err[] = 'Password lama tidak sesuai.'; }
        if (strlen($baru) < 8) { $err[] = 'Password baru minimal 8 karakter.'; }
        if ($baru !== $ulang) { $err[] = 'Konfirmasi password tidak cocok.'; }
    }

    if (!$err) {
        if ($baru !== '') {
            $pdo->prepare('UPDATE users SET nama = ?, password = ? WHERE id = ?')
                ->execute([$nama, password_hash($baru, PASSWORD_DEFAULT), $_SESSION['user_id']]);
            flash('Nama dan password berhasil diperbarui.');
        } else {
            $pdo->prepare('UPDATE users SET nama = ? WHERE id = ?')->execute([$nama, $_SESSION['user_id']]);
            flash('Nama berhasil diperbarui.');
        }
        $_SESSION['user_nama'] = $nama;
        redirect('admin/profil-akun.php');
    }
}

$st = $pdo->prepare('SELECT * FROM users WHERE id = ?');
$st->execute([$_SESSION['user_id']]);
$user = $st->fetch();

require __DIR__ . '/includes/header.php';
?>
<div class="row g-3">
  <div class="col-lg-7">
    <div class="admin-card p-4">
      <?php if ($err): ?>
        <div class="alert alert-danger"><ul class="mb-0 ps-3"><?php foreach ($err as $x): ?><li><?= e($x) ?></li><?php endforeach; ?></ul></div>
      <?php endif; ?>
      <form method="post" class="row g-3">
        <?= csrf_field() ?>
        <div class="col-md-6">
          <label class="form-label" for="nama">Nama Lengkap</label>
          <input class="form-control" id="nama" name="nama" value="<?= e($user['nama']) ?>" required maxlength="100">
        </div>
        <div class="col-md-6">
          <label class="form-label" for="username">Username</label>
          <input class="form-control" id="username" value="<?= e($user['username']) ?>" disabled>
        </div>
        <div class="col-12"><hr class="my-1"><p class="small text-muted mb-0">Kosongkan bagian password bila tidak ingin mengubahnya.</p></div>
        <div class="col-md-4">
          <label class="form-label" for="pl">Password Lama</label>
          <input type="password" class="form-control" id="pl" name="password_lama" autocomplete="current-password">
        </div>
        <div class="col-md-4">
          <label class="form-label" for="pb">Password Baru</label>
          <input type="password" class="form-control" id="pb" name="password_baru" autocomplete="new-password" minlength="8">
        </div>
        <div class="col-md-4">
          <label class="form-label" for="pu">Ulangi Password Baru</label>
          <input type="password" class="form-control" id="pu" name="password_ulang" autocomplete="new-password" minlength="8">
        </div>
        <div class="col-12 border-top pt-3">
          <button class="btn btn-brand px-4"><i class="bi bi-save me-1"></i>Simpan</button>
        </div>
      </form>
    </div>
  </div>
  <div class="col-lg-5">
    <div class="admin-card p-4">
      <h2 class="h6">Keamanan</h2>
      <ul class="small text-muted ps-3 mb-0">
        <li>Ganti password bawaan <code>admin123</code> segera setelah instalasi.</li>
        <li>Gunakan password minimal 8 karakter dengan kombinasi huruf dan angka.</li>
        <li>Jangan membagikan akun administrator kepada pihak yang tidak berwenang.</li>
        <li>Jika website dipublikasikan ke internet, aktifkan HTTPS dan buat pengguna MySQL khusus (bukan <code>root</code>).</li>
      </ul>
    </div>
  </div>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>

<?php
/**
 * Manajemen Pengguna Admin.
 *
 * ALUR KERJA (berurutan):
 *  1. Hanya role "admin" yang boleh membuka halaman ini (require_admin()).
 *  2. Aksi POST: tambah | ubah | reset | hapus -> validasi -> simpan -> flash -> redirect (pola PRG).
 *  3. Username & password hasil pembuatan/reset ditampilkan SEKALI agar bisa dicatat.
 */

require_once __DIR__ . '/../config/config.php';
require_admin();
$adminTitle = 'Pengguna Admin';

$err = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $aksi = (string) ($_POST['aksi'] ?? '');
    $id   = (int) ($_POST['id'] ?? 0);

    /* ---------- 1. TAMBAH PENGGUNA ---------- */
    if ($aksi === 'tambah') {
        $nama = trim((string) ($_POST['nama'] ?? ''));
        $user = strtolower(trim((string) ($_POST['username'] ?? '')));
        $pass = (string) ($_POST['password'] ?? '');
        $role = (($_POST['role'] ?? 'operator') === 'admin') ? 'admin' : 'operator';

        if ($nama === '')                              { $err[] = 'Nama lengkap wajib diisi.'; }
        if (!preg_match('/^[a-z0-9._]{4,50}$/', $user)) { $err[] = 'Username minimal 4 karakter (huruf kecil, angka, titik, garis bawah).'; }
        if (strlen($pass) < 8)                         { $err[] = 'Password minimal 8 karakter.'; }

        $cek = $pdo->prepare('SELECT COUNT(*) FROM users WHERE username = ?');
        $cek->execute([$user]);
        if ($cek->fetchColumn()) { $err[] = 'Username "' . $user . '" sudah digunakan.'; }

        if (!$err) {
            $pdo->prepare('INSERT INTO users (nama, username, password, role) VALUES (?,?,?,?)')
                ->execute([$nama, $user, password_hash($pass, PASSWORD_DEFAULT), $role]);
            $_SESSION['kredensial_baru'] = ['username' => $user, 'password' => $pass];
            flash('Pengguna baru berhasil dibuat.');
            redirect('admin/pengguna.php');
        }
    }

    /* ---------- 2. UBAH DATA ---------- */
    if ($aksi === 'ubah' && $id) {
        $nama = trim((string) ($_POST['nama'] ?? ''));
        $role = (($_POST['role'] ?? 'operator') === 'admin') ? 'admin' : 'operator';

        if ($nama === '') {
            $err[] = 'Nama lengkap wajib diisi.';
        } elseif (
            $id === (int) $_SESSION['user_id'] && $role !== 'admin'
            && (int) $pdo->query("SELECT COUNT(*) FROM users WHERE role='admin'")->fetchColumn() <= 1
        ) {
            $err[] = 'Anda adalah satu-satunya Administrator, peran tidak dapat diturunkan.';
        } else {
            $pdo->prepare('UPDATE users SET nama = ?, role = ? WHERE id = ?')->execute([$nama, $role, $id]);
            if ($id === (int) $_SESSION['user_id']) {
                $_SESSION['user_nama'] = $nama;
                $_SESSION['user_role'] = $role;
            }
            flash('Data pengguna diperbarui.');
            redirect('admin/pengguna.php');
        }
    }

    /* ---------- 3. RESET PASSWORD ---------- */
    if ($aksi === 'reset' && $id) {
        $baru = (string) ($_POST['password_baru'] ?? '');
        if (strlen($baru) < 8) {
            $err[] = 'Password baru minimal 8 karakter.';
        } else {
            $st = $pdo->prepare('SELECT username FROM users WHERE id = ?');
            $st->execute([$id]);
            $un = (string) $st->fetchColumn();
            $pdo->prepare('UPDATE users SET password = ? WHERE id = ?')
                ->execute([password_hash($baru, PASSWORD_DEFAULT), $id]);
            $_SESSION['kredensial_baru'] = ['username' => $un, 'password' => $baru];
            flash('Password pengguna berhasil di-reset.');
            redirect('admin/pengguna.php');
        }
    }

    /* ---------- 4. HAPUS ---------- */
    if ($aksi === 'hapus' && $id) {
        if ($id === (int) $_SESSION['user_id']) {
            flash('Anda tidak dapat menghapus akun sendiri.', 'danger');
        } elseif ((int) $pdo->query("SELECT COUNT(*) FROM users WHERE role='admin'")->fetchColumn() <= 1) {
            flash('Minimal harus tersisa satu Administrator.', 'danger');
        } else {
            $pdo->prepare('DELETE FROM users WHERE id = ?')->execute([$id]);
            flash('Pengguna dihapus.');
        }
        redirect('admin/pengguna.php');
    }
}

$kredensial = $_SESSION['kredensial_baru'] ?? null;
unset($_SESSION['kredensial_baru']);

$rows = $pdo->query('SELECT id, nama, username, role, created_at FROM users ORDER BY id ASC')->fetchAll();
require __DIR__ . '/includes/header.php';
?>

<?php if ($err): ?>
  <div class="alert alert-danger"><ul class="mb-0 ps-3"><?php foreach ($err as $x): ?><li><?= e($x) ?></li><?php endforeach; ?></ul></div>
<?php endif; ?>

<?php if ($kredensial): ?>
  <div class="alert alert-success">
    <h2 class="h6 mb-2"><i class="bi bi-key me-1"></i>Kredensial login (catat sekarang, hanya tampil sekali)</h2>
    <div class="d-flex flex-wrap gap-4">
      <div><small class="text-muted d-block">Username</small><code class="fs-6"><?= e($kredensial['username']) ?></code></div>
      <div><small class="text-muted d-block">Password</small><code class="fs-6"><?= e($kredensial['password']) ?></code></div>
    </div>
  </div>
<?php endif; ?>

<div class="admin-card p-4 mb-4">
  <h2 class="h6 mb-3"><i class="bi bi-info-circle me-1"></i>Akun bawaan sistem (hasil import database)</h2>
  <div class="table-responsive">
    <table class="table table-sm align-middle mb-2">
      <thead class="table-light"><tr><th>Peran</th><th>Username</th><th>Password</th><th>Hak akses</th></tr></thead>
      <tbody>
        <tr><td>Administrator</td><td><code>admin</code></td><td><code>admin123</code></td><td>Semua menu termasuk Pengguna &amp; Pengaturan</td></tr>
        <tr><td>Operator</td><td><code>operator</code></td><td><code>operator123</code></td><td>Konten &amp; data desa saja</td></tr>
      </tbody>
    </table>
  </div>
  <p class="small text-danger mb-0">
    Password di atas hanya untuk instalasi pertama. Ganti segera lewat tombol <strong>Reset Password</strong>
    di bawah atau menu <em>Profil Akun</em> sebelum website dipublikasikan.
  </p>
</div>

<div class="admin-card mb-4">
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead class="table-light">
        <tr><th style="width:52px">#</th><th>Nama</th><th>Username</th><th>Peran</th><th>Dibuat</th><th class="text-end" style="width:220px">Aksi</th></tr>
      </thead>
      <tbody>
        <?php foreach ($rows as $i => $r): ?>
        <tr>
          <td class="small text-muted"><?= $i + 1 ?></td>
          <td class="small fw-semibold"><?= e($r['nama']) ?><?= (int) $r['id'] === (int) $_SESSION['user_id'] ? ' <span class="badge bg-success">Anda</span>' : '' ?></td>
          <td class="small"><code><?= e($r['username']) ?></code></td>
          <td class="small text-capitalize"><span class="badge-cat"><?= e($r['role']) ?></span></td>
          <td class="small text-muted"><?= tanggal_id(substr((string) $r['created_at'], 0, 10)) ?></td>
          <td class="text-end">
            <button class="btn btn-sm btn-light-krem" type="button" data-bs-toggle="collapse" data-bs-target="#u<?= (int) $r['id'] ?>">
              <i class="bi bi-pencil"></i> Kelola
            </button>
            <form class="d-inline" method="post">
              <?= csrf_field() ?>
              <input type="hidden" name="aksi" value="hapus">
              <input type="hidden" name="id" value="<?= (int) $r['id'] ?>">
              <button class="btn btn-sm btn-outline-danger" data-confirm="Hapus pengguna ini?"><i class="bi bi-trash"></i></button>
            </form>
          </td>
        </tr>
        <tr class="collapse" id="u<?= (int) $r['id'] ?>">
          <td colspan="6" class="bg-light">
            <div class="row g-3 py-2">
              <div class="col-lg-6">
                <form method="post" class="row g-2 align-items-end">
                  <?= csrf_field() ?>
                  <input type="hidden" name="aksi" value="ubah">
                  <input type="hidden" name="id" value="<?= (int) $r['id'] ?>">
                  <div class="col-6"><label class="form-label small">Nama Lengkap</label>
                    <input class="form-control form-control-sm" name="nama" value="<?= e($r['nama']) ?>" required></div>
                  <div class="col-3"><label class="form-label small">Peran</label>
                    <select class="form-select form-select-sm" name="role">
                      <option value="admin" <?= $r['role'] === 'admin' ? 'selected' : '' ?>>Admin</option>
                      <option value="operator" <?= $r['role'] === 'operator' ? 'selected' : '' ?>>Operator</option>
                    </select></div>
                  <div class="col-3"><button class="btn btn-sm btn-brand w-100">Simpan</button></div>
                </form>
              </div>
              <div class="col-lg-6">
                <form method="post" class="row g-2 align-items-end">
                  <?= csrf_field() ?>
                  <input type="hidden" name="aksi" value="reset">
                  <input type="hidden" name="id" value="<?= (int) $r['id'] ?>">
                  <div class="col-8"><label class="form-label small">Password Baru (min. 8 karakter)</label>
                    <input class="form-control form-control-sm" name="password_baru" minlength="8" required placeholder="Ketik password baru"></div>
                  <div class="col-4"><button class="btn btn-sm btn-outline-danger w-100">Reset Password</button></div>
                </form>
              </div>
            </div>
          </td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>

<div class="admin-card p-4">
  <h2 class="h6 mb-3"><i class="bi bi-person-plus me-1"></i>Tambah Pengguna Baru</h2>
  <form method="post" class="row g-3">
    <?= csrf_field() ?>
    <input type="hidden" name="aksi" value="tambah">
    <div class="col-md-4"><label class="form-label" for="n">Nama Lengkap</label>
      <input class="form-control" id="n" name="nama" required maxlength="100"></div>
    <div class="col-md-3"><label class="form-label" for="us">Username</label>
      <input class="form-control" id="us" name="username" required minlength="4" maxlength="50" placeholder="mis. operator2"></div>
    <div class="col-md-3"><label class="form-label" for="pw">Password</label>
      <input class="form-control" id="pw" name="password" required minlength="8"></div>
    <div class="col-md-2"><label class="form-label" for="rl">Peran</label>
      <select class="form-select" id="rl" name="role">
        <option value="operator">Operator</option>
        <option value="admin">Admin</option>
      </select></div>
    <div class="col-12 border-top pt-3"><button class="btn btn-brand px-4"><i class="bi bi-save me-1"></i>Buat Pengguna</button></div>
  </form>
</div>

<?php require __DIR__ . '/includes/footer.php'; ?>

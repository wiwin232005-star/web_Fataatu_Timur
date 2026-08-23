<?php
require_once __DIR__ . '/../config/config.php';
require_login();
$adminTitle = 'Pesan Masuk';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $id = (int) ($_POST['id'] ?? 0);
    if (($_POST['aksi'] ?? '') === 'hapus' && $id) {
        $pdo->prepare('DELETE FROM pesan WHERE id = ?')->execute([$id]);
        flash('Pesan dihapus.');
    } elseif (($_POST['aksi'] ?? '') === 'baca' && $id) {
        $pdo->prepare('UPDATE pesan SET dibaca = 1 WHERE id = ?')->execute([$id]);
        flash('Pesan ditandai sudah dibaca.');
    }
    redirect('admin/pesan.php');
}

$rows = $pdo->query('SELECT * FROM pesan ORDER BY id DESC')->fetchAll();
require __DIR__ . '/includes/header.php';
?>
<div class="admin-card">
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead class="table-light">
        <tr><th style="width:52px">#</th><th>Pengirim</th><th>Kontak</th><th>Subjek &amp; Pesan</th><th>Waktu</th><th class="text-end" style="width:150px">Aksi</th></tr>
      </thead>
      <tbody>
        <?php if (!$rows): ?><tr><td colspan="6" class="text-center text-muted py-4">Belum ada pesan masuk.</td></tr><?php endif; ?>
        <?php foreach ($rows as $i => $r): ?>
          <tr class="<?= $r['dibaca'] ? '' : 'table-warning' ?>">
            <td class="small text-muted"><?= $i + 1 ?></td>
            <td class="small fw-semibold"><?= e($r['nama']) ?><?php if (!$r['dibaca']): ?> <span class="badge bg-danger">baru</span><?php endif; ?></td>
            <td class="small"><?= e($r['email'] ?: '-') ?><br><span class="text-muted"><?= e($r['telepon'] ?: '-') ?></span></td>
            <td class="small"><strong><?= e($r['subjek'] ?: '(tanpa subjek)') ?></strong><br><span class="text-muted"><?= nl2br(e($r['pesan'])) ?></span></td>
            <td class="small text-muted"><?= tanggal_id(substr($r['created_at'], 0, 10)) ?><br><?= e(substr($r['created_at'], 11, 5)) ?></td>
            <td class="text-end">
              <?php if (!$r['dibaca']): ?>
                <form class="d-inline" method="post"><?= csrf_field() ?><input type="hidden" name="id" value="<?= (int) $r['id'] ?>"><input type="hidden" name="aksi" value="baca">
                  <button class="btn btn-sm btn-light-krem" title="Tandai dibaca"><i class="bi bi-check2"></i></button>
                </form>
              <?php endif; ?>
              <form class="d-inline" method="post"><?= csrf_field() ?><input type="hidden" name="id" value="<?= (int) $r['id'] ?>"><input type="hidden" name="aksi" value="hapus">
                <button class="btn btn-sm btn-outline-danger" data-confirm="Hapus pesan ini?"><i class="bi bi-trash"></i></button>
              </form>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>

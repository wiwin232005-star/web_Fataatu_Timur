<?php
require_once __DIR__ . '/../config/config.php';
require_admin();
$adminTitle = 'Pengaturan Website';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $st = $pdo->prepare('UPDATE pengaturan SET nilai = ? WHERE kunci = ?');
    foreach ($_POST['nilai'] ?? [] as $kunci => $nilai) {
        $st->execute([trim((string) $nilai), (string) $kunci]);
    }
    flash('Pengaturan berhasil disimpan.');
    redirect('admin/pengaturan.php');
}

$rows = $pdo->query('SELECT * FROM pengaturan ORDER BY id ASC')->fetchAll();
require __DIR__ . '/includes/header.php';
?>
<div class="admin-card p-4">
  <p class="text-muted small">
    Ubah identitas desa, kontak, koordinat peta, sambutan, sejarah, serta visi &amp; misi di sini.
    Untuk misi, tulis <strong>satu misi per baris</strong>.
  </p>
  <form method="post" class="row g-3">
    <?= csrf_field() ?>
    <?php foreach ($rows as $r): ?>
      <div class="col-12 <?= $r['tipe'] === 'textarea' ? '' : 'col-md-6' ?>">
        <label class="form-label" for="s_<?= e($r['kunci']) ?>"><?= e($r['label']) ?></label>
        <?php if ($r['tipe'] === 'textarea'): ?>
          <textarea class="form-control" id="s_<?= e($r['kunci']) ?>" name="nilai[<?= e($r['kunci']) ?>]" rows="5"><?= e($r['nilai']) ?></textarea>
        <?php else: ?>
          <input class="form-control" id="s_<?= e($r['kunci']) ?>" name="nilai[<?= e($r['kunci']) ?>]" value="<?= e($r['nilai']) ?>">
        <?php endif; ?>
        <div class="form-text"><code><?= e($r['kunci']) ?></code></div>
      </div>
    <?php endforeach; ?>
    <div class="col-12 border-top pt-3">
      <button class="btn btn-brand px-4"><i class="bi bi-save me-1"></i>Simpan Pengaturan</button>
    </div>
  </form>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>

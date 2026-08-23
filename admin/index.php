<?php
require_once __DIR__ . '/../config/config.php';
require_login();
$adminTitle = 'Dashboard';

$stat = [
  ['Berita',        count_rows('berita'),   'bi-newspaper',       'crud.php?m=berita'],
  ['Galeri Foto',   count_rows('galeri'),   'bi-images',          'crud.php?m=galeri'],
  ['Agenda',        count_rows('agenda'),   'bi-calendar-event',  'crud.php?m=agenda'],
  ['Aparatur Desa', count_rows('aparatur'), 'bi-people',          'crud.php?m=aparatur'],
  ['Potensi Desa',  count_rows('potensi'),  'bi-flower3',         'crud.php?m=potensi'],
  ['Wisata',        count_rows('wisata'),   'bi-camera',          'crud.php?m=wisata'],
  ['Layanan',       count_rows('layanan'),  'bi-file-earmark-text','crud.php?m=layanan'],
  ['Pesan Masuk',   count_rows('pesan'),    'bi-envelope',        'pesan.php'],
];

$pend  = $pdo->query('SELECT COALESCE(SUM(laki_laki),0) l, COALESCE(SUM(perempuan),0) p, COALESCE(SUM(jumlah_kk),0) kk FROM penduduk')->fetch();
$beritaBaru = $pdo->query('SELECT judul, tanggal, status FROM berita ORDER BY id DESC LIMIT 5')->fetchAll();
$pesanBaru  = $pdo->query('SELECT id, nama, subjek, created_at, dibaca FROM pesan ORDER BY id DESC LIMIT 5')->fetchAll();
$agendaDpn  = $pdo->query('SELECT judul, tanggal_mulai FROM agenda WHERE tanggal_mulai >= CURDATE() ORDER BY tanggal_mulai ASC LIMIT 5')->fetchAll();

require __DIR__ . '/includes/header.php';
?>
<div class="admin-card p-4 mb-4">
  <h2 class="h5 mb-1">Selamat datang, <?= e($_SESSION['user_nama'] ?? 'Admin') ?>.</h2>
  <p class="text-muted small mb-0">
    Kelola seluruh konten Website Resmi <?= e(settings('nama_desa')) ?> dari panel ini.
    Data bertanda <code>[ISI ...]</code> adalah placeholder yang wajib diganti dengan data resmi desa.
  </p>
</div>

<div class="row g-3 mb-4">
  <?php foreach ($stat as $i => [$label, $val, $icon, $href]): ?>
    <div class="col-6 col-lg-3">
      <a class="text-reset text-decoration-none" href="<?= url('admin/' . $href) ?>">
        <div class="stat-card <?= $i % 2 ? 'accent' : '' ?> d-flex align-items-center gap-3">
          <span class="icon-circle <?= $i % 2 ? 'biru' : '' ?>"><i class="bi <?= e($icon) ?>"></i></span>
          <span><span class="stat-value d-block"><?= (int) $val ?></span><span class="stat-label"><?= e($label) ?></span></span>
        </div>
      </a>
    </div>
  <?php endforeach; ?>
</div>

<div class="row g-3 mb-4">
  <div class="col-md-4"><div class="stat-card"><div class="stat-label">Total Penduduk</div><div class="stat-value"><?= number_format($pend['l'] + $pend['p'], 0, ',', '.') ?></div></div></div>
  <div class="col-md-4"><div class="stat-card accent"><div class="stat-label">Kepala Keluarga</div><div class="stat-value"><?= number_format($pend['kk'], 0, ',', '.') ?></div></div></div>
  <div class="col-md-4"><div class="stat-card"><div class="stat-label">Laki-laki / Perempuan</div><div class="stat-value" style="font-size:1.25rem"><?= number_format($pend['l'], 0, ',', '.') ?> / <?= number_format($pend['p'], 0, ',', '.') ?></div></div></div>
</div>

<div class="row g-3">
  <div class="col-lg-4">
    <div class="admin-card p-3 h-100">
      <h3 class="h6 mb-3"><i class="bi bi-newspaper me-1"></i> Berita Terbaru</h3>
      <?php if (!$beritaBaru): ?><p class="text-muted small mb-0">Belum ada berita.</p><?php endif; ?>
      <?php foreach ($beritaBaru as $b): ?>
        <div class="border-bottom py-2 small">
          <div class="fw-semibold"><?= e(excerpt($b['judul'], 55)) ?></div>
          <span class="text-muted"><?= tanggal_id($b['tanggal']) ?></span>
          <span class="badge-cat ms-1"><?= e($b['status']) ?></span>
        </div>
      <?php endforeach; ?>
      <a class="btn btn-sm btn-brand-outline mt-3" href="<?= url('admin/crud.php?m=berita') ?>">Kelola Berita</a>
    </div>
  </div>
  <div class="col-lg-4">
    <div class="admin-card p-3 h-100">
      <h3 class="h6 mb-3"><i class="bi bi-calendar-event me-1"></i> Agenda Mendatang</h3>
      <?php if (!$agendaDpn): ?><p class="text-muted small mb-0">Belum ada agenda mendatang.</p><?php endif; ?>
      <?php foreach ($agendaDpn as $a): ?>
        <div class="border-bottom py-2 small">
          <div class="fw-semibold"><?= e(excerpt($a['judul'], 55)) ?></div>
          <span class="text-muted"><?= tanggal_id($a['tanggal_mulai'], true) ?></span>
        </div>
      <?php endforeach; ?>
      <a class="btn btn-sm btn-brand-outline mt-3" href="<?= url('admin/crud.php?m=agenda') ?>">Kelola Agenda</a>
    </div>
  </div>
  <div class="col-lg-4">
    <div class="admin-card p-3 h-100">
      <h3 class="h6 mb-3"><i class="bi bi-envelope me-1"></i> Pesan Terbaru</h3>
      <?php if (!$pesanBaru): ?><p class="text-muted small mb-0">Belum ada pesan masuk.</p><?php endif; ?>
      <?php foreach ($pesanBaru as $p): ?>
        <div class="border-bottom py-2 small">
          <div class="fw-semibold"><?= e($p['nama']) ?> <?php if (!$p['dibaca']): ?><span class="badge bg-danger">baru</span><?php endif; ?></div>
          <span class="text-muted"><?= e(excerpt($p['subjek'] ?: '(tanpa subjek)', 45)) ?></span>
        </div>
      <?php endforeach; ?>
      <a class="btn btn-sm btn-brand-outline mt-3" href="<?= url('admin/pesan.php') ?>">Lihat Semua Pesan</a>
    </div>
  </div>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>

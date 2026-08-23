<?php
require_once __DIR__ . '/../../config/config.php';
require_login();
$cur = basename($_SERVER['PHP_SELF']);
$mod = $_GET['m'] ?? '';
$adminTitle = $adminTitle ?? 'Dashboard';
$menu = [
    'Utama' => [
        ['index.php', '', 'bi-speedometer2', 'Dashboard'],
    ],
    'Konten Website' => [
        ['crud.php', 'berita',   'bi-newspaper',   'Berita'],
        ['crud.php', 'kategori', 'bi-tags',        'Kategori Berita'],
        ['crud.php', 'galeri',   'bi-images',      'Galeri'],
        ['crud.php', 'agenda',   'bi-calendar-event', 'Agenda'],
        ['crud.php', 'wisata',   'bi-camera',      'Wisata'],
        ['crud.php', 'faq',      'bi-question-circle', 'FAQ'],
    ],
    'Data Desa' => [
        ['crud.php', 'aparatur', 'bi-people',      'Aparatur Desa'],
        ['crud.php', 'potensi',  'bi-flower3',     'Potensi Desa'],
        ['crud.php', 'penduduk', 'bi-person-vcard','Data Penduduk'],
        ['crud.php', 'layanan',  'bi-file-earmark-text', 'Layanan'],
        ['crud.php', 'anggaran', 'bi-cash-stack',  'Transparansi Anggaran'],
    ],
    'Sistem' => [
        ['pesan.php',      '', 'bi-envelope',  'Pesan Masuk'],
        ['pengguna.php',   '', 'bi-people-fill', 'Pengguna Admin'],
        ['pengaturan.php', '', 'bi-gear',      'Pengaturan'],
        ['profil-akun.php','', 'bi-shield-lock', 'Profil Akun'],
    ],
];
// Menu "Pengguna Admin" hanya untuk role admin.
if (!is_admin()) {
    $menu['Sistem'] = array_values(array_filter(
        $menu['Sistem'],
        static fn ($i) => $i[0] !== 'pengguna.php'
    ));
}
$belumDibaca = (int) $pdo->query('SELECT COUNT(*) FROM pesan WHERE dibaca = 0')->fetchColumn();
$fl = flash();
?>
<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($adminTitle) ?> &middot; Admin <?= e(settings('nama_desa')) ?></title>
<meta name="description" content="Panel administrasi website resmi Desa Fataatu Timur.">
<meta name="robots" content="noindex,nofollow">
<link rel="icon" href="<?= url('assets/img/logo.svg') ?>" type="image/svg+xml">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link href="<?= url('assets/css/style.css') ?>" rel="stylesheet">
</head>
<body class="admin-body">
<aside class="admin-sidebar">
  <div class="brand">
    <img src="<?= url('assets/img/logo.svg') ?>" width="38" height="38" alt="Logo">
    <div><strong>Admin Desa</strong><small><?= e(settings('nama_desa')) ?></small></div>
  </div>
  <?php foreach ($menu as $grup => $items): ?>
    <div class="nav-label"><?= e($grup) ?></div>
    <?php foreach ($items as [$file, $m, $icon, $label]):
      $href = url('admin/' . $file . ($m ? '?m=' . $m : ''));
      $active = ($cur === $file) && ($m === '' || $mod === $m);
    ?>
      <a class="side-link <?= $active ? 'active' : '' ?>" href="<?= $href ?>">
        <i class="bi <?= e($icon) ?>"></i><span><?= e($label) ?></span>
        <?php if ($file === 'pesan.php' && $belumDibaca > 0): ?>
          <span class="badge bg-danger rounded-pill ms-auto"><?= $belumDibaca ?></span>
        <?php endif; ?>
      </a>
    <?php endforeach; ?>
  <?php endforeach; ?>
  <div class="nav-label">Keluar</div>
  <a class="side-link" href="<?= url('index.php') ?>" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right"></i><span>Lihat Website</span></a>
  <a class="side-link" href="<?= url('admin/logout.php') ?>" data-confirm="Yakin ingin keluar?"><i class="bi bi-power"></i><span>Logout</span></a>
</aside>
<div class="admin-backdrop"></div>

<div class="admin-main">
  <div class="admin-topbar">
    <div class="d-flex align-items-center gap-2">
      <button class="btn btn-sm btn-light-krem d-lg-none" id="sidebarToggle" aria-label="Buka menu"><i class="bi bi-list"></i></button>
      <h1 class="h6 mb-0"><?= e($adminTitle) ?></h1>
    </div>
    <div class="dropdown">
      <button class="btn btn-sm btn-light-krem dropdown-toggle" data-bs-toggle="dropdown">
        <i class="bi bi-person-circle me-1"></i><?= e($_SESSION['user_nama'] ?? 'Admin') ?>
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><a class="dropdown-item" href="<?= url('admin/profil-akun.php') ?>"><i class="bi bi-shield-lock me-2"></i>Profil Akun</a></li>
        <?php if (is_admin()): ?>
        <li><a class="dropdown-item" href="<?= url('admin/pengguna.php') ?>"><i class="bi bi-people-fill me-2"></i>Pengguna Admin</a></li>
        <?php endif; ?>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="<?= url('admin/logout.php') ?>"><i class="bi bi-power me-2"></i>Logout</a></li>
      </ul>
    </div>
  </div>
  <div class="admin-content">
    <?php if ($fl): ?>
      <div class="alert alert-<?= e($fl['type']) ?> alert-dismissible fade show">
        <?= e($fl['msg']) ?>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Tutup"></button>
      </div>
    <?php endif; ?>

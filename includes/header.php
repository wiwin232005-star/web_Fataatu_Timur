<?php
require_once __DIR__ . '/../config/config.php';
$current = basename($_SERVER['PHP_SELF']);
$navUtama = [
    'index.php'        => 'Beranda',
    'berita.php'       => 'Berita',
    'agenda.php'       => 'Agenda',
    'galeri.php'       => 'Galeri',
    'layanan.php'      => 'Layanan',
    'transparansi.php' => 'Transparansi',
    'kontak.php'       => 'Kontak',
];
$navProfil = [
    'profil.php'    => 'Profil Desa',
    'sejarah.php'   => 'Sejarah',
    'visi-misi.php' => 'Visi & Misi',
    'struktur.php'  => 'Struktur Pemerintahan',
    'peta.php'      => 'Peta Desa',
];
$navPotensi = [
    'potensi.php'    => 'Potensi Desa',
    'hasil-bumi.php' => 'Hasil Bumi',
    'wisata.php'     => 'Wisata',
];
$pageTitle = $pageTitle ?? 'Beranda';
$pageDesc  = $pageDesc ?? 'Website resmi Desa Fataatu Timur, Kecamatan Wewaria, Kabupaten Ende, Nusa Tenggara Timur.';
?>
<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($pageTitle) ?> &middot; <?= e(settings('nama_desa', 'Desa Fataatu Timur')) ?></title>
<meta name="description" content="<?= e($pageDesc) ?>">
<meta property="og:title" content="<?= e($pageTitle) ?> - <?= e(settings('nama_desa')) ?>">
<meta property="og:description" content="<?= e($pageDesc) ?>">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="<?= url('assets/img/logo.svg') ?>" type="image/svg+xml">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link href="<?= url('assets/css/style.css') ?>" rel="stylesheet">
</head>
<body>
<a class="visually-hidden-focusable skip-link" href="#konten">Lewati ke konten</a>

<div class="topbar d-none d-lg-block">
  <div class="container d-flex flex-wrap justify-content-between align-items-center gap-2">
    <span><i class="bi bi-geo-alt-fill me-1"></i> Kec. <?= e(settings('kecamatan')) ?>, Kab. <?= e(settings('kabupaten')) ?>, <?= e(settings('provinsi')) ?></span>
    <span class="d-flex gap-3">
      <span><i class="bi bi-clock me-1"></i><?= e(settings('jam_layanan')) ?></span>
      <span><i class="bi bi-envelope me-1"></i><?= e(settings('email')) ?></span>
    </span>
  </div>
</div>

<nav class="navbar navbar-expand-lg navbar-desa sticky-top">
  <div class="container">
    <a class="navbar-brand d-flex align-items-center gap-2" href="<?= url('index.php') ?>">
      <img src="<?= url('assets/img/logo.svg') ?>" alt="Logo Desa Fataatu Timur" width="44" height="44">
      <span class="brand-text">
        <strong><?= e(settings('nama_desa', 'Desa Fataatu Timur')) ?></strong>
        <small>Kec. <?= e(settings('kecamatan')) ?> &middot; Kab. <?= e(settings('kabupaten')) ?></small>
      </span>
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-controls="navMenu" aria-expanded="false" aria-label="Buka menu">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navMenu">
      <ul class="navbar-nav ms-auto align-items-lg-center">
        <li class="nav-item"><a class="nav-link <?= $current === 'index.php' ? 'active' : '' ?>" href="<?= url('index.php') ?>">Beranda</a></li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle <?= array_key_exists($current, $navProfil) ? 'active' : '' ?>" href="#" role="button" data-bs-toggle="dropdown">Profil</a>
          <ul class="dropdown-menu">
            <?php foreach ($navProfil as $f => $l): ?>
              <li><a class="dropdown-item <?= $current === $f ? 'active' : '' ?>" href="<?= url($f) ?>"><?= e($l) ?></a></li>
            <?php endforeach; ?>
          </ul>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle <?= array_key_exists($current, $navPotensi) ? 'active' : '' ?>" href="#" role="button" data-bs-toggle="dropdown">Potensi</a>
          <ul class="dropdown-menu">
            <?php foreach ($navPotensi as $f => $l): ?>
              <li><a class="dropdown-item <?= $current === $f ? 'active' : '' ?>" href="<?= url($f) ?>"><?= e($l) ?></a></li>
            <?php endforeach; ?>
          </ul>
        </li>
        <?php foreach (['berita.php' => 'Berita', 'agenda.php' => 'Agenda', 'galeri.php' => 'Galeri', 'layanan.php' => 'Layanan', 'transparansi.php' => 'Transparansi', 'faq.php' => 'FAQ', 'kontak.php' => 'Kontak'] as $f => $l): ?>
          <li class="nav-item"><a class="nav-link <?= $current === $f ? 'active' : '' ?>" href="<?= url($f) ?>"><?= e($l) ?></a></li>
        <?php endforeach; ?>
        <li class="nav-item ms-lg-2 mt-2 mt-lg-0">
          <a class="btn btn-brand btn-sm px-3" href="<?= url('admin/login.php') ?>"><i class="bi bi-shield-lock me-1"></i>Admin</a>
        </li>
      </ul>
    </div>
  </div>
</nav>
<main id="konten">

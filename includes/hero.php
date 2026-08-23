<?php /** Banner judul halaman dalam. Butuh $pageTitle dan opsional $pageSub. */ ?>
<header class="page-hero">
  <div class="container">
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb mb-2">
        <li class="breadcrumb-item"><a href="<?= url('index.php') ?>">Beranda</a></li>
        <li class="breadcrumb-item active" aria-current="page"><?= e($pageTitle) ?></li>
      </ol>
    </nav>
    <h1 class="h2 mb-1"><?= e($pageTitle) ?></h1>
    <?php if (!empty($pageSub)): ?><p class="mb-0 opacity-75"><?= e($pageSub) ?></p><?php endif; ?>
  </div>
</header>

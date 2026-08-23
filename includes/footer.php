</main>
<footer class="footer-desa">
  <div class="container">
    <div class="row g-4">
      <div class="col-lg-4">
        <div class="d-flex align-items-center gap-2 mb-3">
          <img src="<?= url('assets/img/logo.svg') ?>" alt="Logo Desa" width="42" height="42">
          <div>
            <strong class="d-block"><?= e(settings('nama_desa')) ?></strong>
            <small class="opacity-75">Kec. <?= e(settings('kecamatan')) ?>, Kab. <?= e(settings('kabupaten')) ?></small>
          </div>
        </div>
        <p class="small opacity-75 mb-3"><?= e(excerpt(settings('profil_umum'), 180)) ?></p>
        <div class="d-flex gap-2">
          <a class="social-btn" href="<?= e(settings('facebook')) ?>" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
          <a class="social-btn" href="<?= e(settings('instagram')) ?>" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
          <a class="social-btn" href="<?= e(settings('youtube')) ?>" aria-label="YouTube"><i class="bi bi-youtube"></i></a>
        </div>
      </div>
      <div class="col-6 col-lg-2">
        <h6 class="footer-title">Profil</h6>
        <ul class="footer-list">
          <li><a href="<?= url('profil.php') ?>">Profil Desa</a></li>
          <li><a href="<?= url('sejarah.php') ?>">Sejarah</a></li>
          <li><a href="<?= url('visi-misi.php') ?>">Visi &amp; Misi</a></li>
          <li><a href="<?= url('struktur.php') ?>">Struktur</a></li>
          <li><a href="<?= url('peta.php') ?>">Peta Desa</a></li>
        </ul>
      </div>
      <div class="col-6 col-lg-2">
        <h6 class="footer-title">Informasi</h6>
        <ul class="footer-list">
          <li><a href="<?= url('berita.php') ?>">Berita</a></li>
          <li><a href="<?= url('agenda.php') ?>">Agenda</a></li>
          <li><a href="<?= url('galeri.php') ?>">Galeri</a></li>
          <li><a href="<?= url('transparansi.php') ?>">Transparansi</a></li>
          <li><a href="<?= url('faq.php') ?>">FAQ</a></li>
        </ul>
      </div>
      <div class="col-lg-4">
        <h6 class="footer-title">Kontak Kantor Desa</h6>
        <ul class="footer-contact">
          <li><i class="bi bi-geo-alt"></i><span><?= e(settings('alamat_kantor')) ?></span></li>
          <li><i class="bi bi-telephone"></i><span><?= e(settings('telepon')) ?></span></li>
          <li><i class="bi bi-envelope"></i><span><?= e(settings('email')) ?></span></li>
          <li><i class="bi bi-clock"></i><span><?= e(settings('jam_layanan')) ?></span></li>
        </ul>
      </div>
    </div>
    <hr class="footer-sep">
    <div class="d-flex flex-wrap justify-content-between gap-2 small opacity-75">
      <span>&copy; <?= date('Y') ?> Pemerintah <?= e(settings('nama_desa')) ?>. Seluruh hak cipta dilindungi.</span>
      <span>Kode pos: <?= e(settings('kode_pos')) ?></span>
    </div>
  </div>
</footer>
<button id="toTop" class="to-top" aria-label="Kembali ke atas"><i class="bi bi-arrow-up"></i></button>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="<?= url('assets/js/main.js') ?>"></script>
</body>
</html>

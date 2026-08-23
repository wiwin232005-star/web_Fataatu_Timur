/* Skrip publik: tombol ke atas, galeri modal, validasi form. */
(function () {
  'use strict';

  // Tombol kembali ke atas
  var toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('show', window.scrollY > 400);
    });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Pratinjau galeri di dalam modal
  var modalEl = document.getElementById('galeriModal');
  if (modalEl) {
    var modalImg = modalEl.querySelector('[data-modal-img]');
    var modalTitle = modalEl.querySelector('[data-modal-title]');
    var modalDesc = modalEl.querySelector('[data-modal-desc]');
    document.querySelectorAll('[data-galeri]').forEach(function (item) {
      item.addEventListener('click', function (ev) {
        ev.preventDefault();
        modalImg.src = item.getAttribute('data-src');
        modalImg.alt = item.getAttribute('data-title') || 'Foto galeri desa';
        modalTitle.textContent = item.getAttribute('data-title') || '';
        modalDesc.textContent = item.getAttribute('data-desc') || '';
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
      });
    });
  }

  // Validasi bawaan Bootstrap
  document.querySelectorAll('.needs-validation').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      if (!form.checkValidity()) {
        ev.preventDefault();
        ev.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });

  // Konfirmasi hapus
  document.querySelectorAll('[data-confirm]').forEach(function (el) {
    el.addEventListener('click', function (ev) {
      if (!window.confirm(el.getAttribute('data-confirm'))) {
        ev.preventDefault();
      }
    });
  });
})();

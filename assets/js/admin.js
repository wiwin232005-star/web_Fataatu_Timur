/* Skrip area admin. */
(function () {
  'use strict';
  var sidebar = document.querySelector('.admin-sidebar');
  var backdrop = document.querySelector('.admin-backdrop');
  var toggle = document.getElementById('sidebarToggle');

  function close() {
    sidebar && sidebar.classList.remove('open');
    backdrop && backdrop.classList.remove('show');
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
      backdrop.classList.toggle('show');
    });
  }
  if (backdrop) backdrop.addEventListener('click', close);

  document.querySelectorAll('[data-confirm]').forEach(function (el) {
    el.addEventListener('click', function (ev) {
      if (!window.confirm(el.getAttribute('data-confirm'))) ev.preventDefault();
    });
  });

  // Pratinjau gambar sebelum unggah
  document.querySelectorAll('input[type=file][data-preview]').forEach(function (input) {
    input.addEventListener('change', function () {
      var target = document.querySelector(input.getAttribute('data-preview'));
      if (target && input.files && input.files[0]) {
        target.src = URL.createObjectURL(input.files[0]);
        target.classList.remove('d-none');
      }
    });
  });
})();

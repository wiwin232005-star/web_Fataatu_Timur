<?php
/**
 * Definisi seluruh modul CRUD admin.
 *
 * Setiap modul memiliki:
 *  - label    : judul halaman
 *  - table    : nama tabel
 *  - order    : ORDER BY
 *  - search   : kolom yang dapat dicari
 *  - list     : kolom yang tampil pada tabel daftar
 *  - fields   : definisi form (type: text, textarea, number, date, select, image, hidden-slug)
 *
 * Menambah modul baru cukup menambahkan entri di array ini.
 */

$MODULES = [

'berita' => [
  'label'  => 'Berita',
  'table'  => 'berita',
  'order'  => 'tanggal DESC, id DESC',
  'search' => ['judul', 'ringkasan', 'isi'],
  'list'   => [
    'gambar'  => ['label' => 'Gambar', 'type' => 'image', 'folder' => 'berita'],
    'judul'   => ['label' => 'Judul'],
    'tanggal' => ['label' => 'Tanggal', 'type' => 'date'],
    'status'  => ['label' => 'Status', 'type' => 'badge'],
    'dilihat' => ['label' => 'Dilihat'],
  ],
  'fields' => [
    'judul'       => ['label' => 'Judul Berita', 'type' => 'text', 'required' => true, 'max' => 200],
    'slug'        => ['label' => 'Slug URL', 'type' => 'slug', 'from' => 'judul'],
    'kategori_id' => ['label' => 'Kategori', 'type' => 'select', 'source' => ['table' => 'kategori', 'value' => 'id', 'text' => 'nama']],
    'tanggal'     => ['label' => 'Tanggal Terbit', 'type' => 'date', 'required' => true, 'default' => 'today'],
    'penulis'     => ['label' => 'Penulis', 'type' => 'text', 'max' => 100],
    'status'      => ['label' => 'Status', 'type' => 'select', 'options' => ['publish' => 'Publish', 'draft' => 'Draft']],
    'ringkasan'   => ['label' => 'Ringkasan', 'type' => 'textarea', 'rows' => 3, 'help' => 'Ringkasan singkat yang tampil pada daftar berita.'],
    'isi'         => ['label' => 'Isi Berita', 'type' => 'textarea', 'rows' => 12],
    'gambar'      => ['label' => 'Gambar Utama', 'type' => 'image', 'folder' => 'berita'],
  ],
],

'kategori' => [
  'label'  => 'Kategori Berita',
  'table'  => 'kategori',
  'order'  => 'nama ASC',
  'search' => ['nama'],
  'list'   => ['nama' => ['label' => 'Nama Kategori'], 'slug' => ['label' => 'Slug']],
  'fields' => [
    'nama' => ['label' => 'Nama Kategori', 'type' => 'text', 'required' => true, 'max' => 80],
    'slug' => ['label' => 'Slug', 'type' => 'slug', 'from' => 'nama'],
  ],
],

'galeri' => [
  'label'  => 'Galeri Foto',
  'table'  => 'galeri',
  'order'  => 'id DESC',
  'search' => ['judul', 'kategori'],
  'list'   => [
    'gambar'   => ['label' => 'Foto', 'type' => 'image', 'folder' => 'galeri'],
    'judul'    => ['label' => 'Judul'],
    'kategori' => ['label' => 'Kategori'],
    'tanggal'  => ['label' => 'Tanggal', 'type' => 'date'],
  ],
  'fields' => [
    'judul'      => ['label' => 'Judul Foto', 'type' => 'text', 'required' => true, 'max' => 150],
    'kategori'   => ['label' => 'Kategori', 'type' => 'text', 'max' => 80, 'help' => 'Contoh: Kegiatan, Pertanian, Sarana Prasarana.'],
    'tanggal'    => ['label' => 'Tanggal', 'type' => 'date', 'default' => 'today'],
    'keterangan' => ['label' => 'Keterangan', 'type' => 'textarea', 'rows' => 3],
    'gambar'     => ['label' => 'File Foto', 'type' => 'image', 'folder' => 'galeri'],
  ],
],

'agenda' => [
  'label'  => 'Agenda Kegiatan',
  'table'  => 'agenda',
  'order'  => 'tanggal_mulai DESC',
  'search' => ['judul', 'tempat'],
  'list'   => [
    'judul'         => ['label' => 'Judul'],
    'tanggal_mulai' => ['label' => 'Mulai', 'type' => 'date'],
    'waktu'         => ['label' => 'Waktu'],
    'tempat'        => ['label' => 'Tempat'],
  ],
  'fields' => [
    'judul'           => ['label' => 'Judul Agenda', 'type' => 'text', 'required' => true, 'max' => 180],
    'tanggal_mulai'   => ['label' => 'Tanggal Mulai', 'type' => 'date', 'required' => true, 'default' => 'today'],
    'tanggal_selesai' => ['label' => 'Tanggal Selesai', 'type' => 'date'],
    'waktu'           => ['label' => 'Waktu', 'type' => 'text', 'max' => 60, 'help' => 'Contoh: 09.00 WITA'],
    'tempat'          => ['label' => 'Tempat', 'type' => 'text', 'max' => 180],
    'penyelenggara'   => ['label' => 'Penyelenggara', 'type' => 'text', 'max' => 150],
    'keterangan'      => ['label' => 'Keterangan', 'type' => 'textarea', 'rows' => 4],
  ],
],

'wisata' => [
  'label'  => 'Wisata Desa',
  'table'  => 'wisata',
  'order'  => 'id ASC',
  'search' => ['nama', 'lokasi'],
  'list'   => [
    'gambar' => ['label' => 'Foto', 'type' => 'image', 'folder' => 'potensi'],
    'nama'   => ['label' => 'Nama Objek'],
    'lokasi' => ['label' => 'Lokasi'],
  ],
  'fields' => [
    'nama'      => ['label' => 'Nama Objek Wisata', 'type' => 'text', 'required' => true, 'max' => 150],
    'lokasi'    => ['label' => 'Lokasi / Dusun', 'type' => 'text', 'max' => 180],
    'deskripsi' => ['label' => 'Deskripsi', 'type' => 'textarea', 'rows' => 5],
    'fasilitas' => ['label' => 'Fasilitas', 'type' => 'text', 'max' => 255],
    'gambar'    => ['label' => 'Foto', 'type' => 'image', 'folder' => 'potensi'],
  ],
],

'faq' => [
  'label'  => 'FAQ',
  'table'  => 'faq',
  'order'  => 'urutan ASC, id ASC',
  'search' => ['pertanyaan'],
  'list'   => ['urutan' => ['label' => 'Urutan'], 'pertanyaan' => ['label' => 'Pertanyaan']],
  'fields' => [
    'pertanyaan' => ['label' => 'Pertanyaan', 'type' => 'text', 'required' => true, 'max' => 255],
    'jawaban'    => ['label' => 'Jawaban', 'type' => 'textarea', 'rows' => 5, 'required' => true],
    'urutan'     => ['label' => 'Urutan Tampil', 'type' => 'number', 'default' => '0'],
  ],
],

'aparatur' => [
  'label'  => 'Aparatur Desa',
  'table'  => 'aparatur',
  'order'  => 'urutan ASC, id ASC',
  'search' => ['nama', 'jabatan'],
  'list'   => [
    'foto'    => ['label' => 'Foto', 'type' => 'image', 'folder' => 'aparatur'],
    'nama'    => ['label' => 'Nama'],
    'jabatan' => ['label' => 'Jabatan'],
    'urutan'  => ['label' => 'Urutan'],
  ],
  'fields' => [
    'nama'    => ['label' => 'Nama Lengkap', 'type' => 'text', 'required' => true, 'max' => 120],
    'jabatan' => ['label' => 'Jabatan', 'type' => 'text', 'required' => true, 'max' => 120],
    'nip'     => ['label' => 'NIP / NIAP', 'type' => 'text', 'max' => 50],
    'urutan'  => ['label' => 'Urutan Tampil', 'type' => 'number', 'default' => '0'],
    'foto'    => ['label' => 'Foto', 'type' => 'image', 'folder' => 'aparatur'],
  ],
],

'potensi' => [
  'label'  => 'Potensi & Hasil Bumi',
  'table'  => 'potensi',
  'order'  => 'jenis ASC, nama ASC',
  'search' => ['nama', 'deskripsi'],
  'list'   => [
    'gambar'     => ['label' => 'Gambar', 'type' => 'image', 'folder' => 'potensi'],
    'nama'       => ['label' => 'Komoditas'],
    'jenis'      => ['label' => 'Jenis', 'type' => 'badge'],
    'luas_lahan' => ['label' => 'Luas Lahan'],
    'produksi'   => ['label' => 'Produksi'],
  ],
  'fields' => [
    'nama'       => ['label' => 'Nama Komoditas / Potensi', 'type' => 'text', 'required' => true, 'max' => 150],
    'jenis'      => ['label' => 'Jenis', 'type' => 'select', 'options' => [
        'pertanian' => 'Pertanian', 'perkebunan' => 'Perkebunan', 'peternakan' => 'Peternakan',
        'perikanan' => 'Perikanan', 'umkm' => 'UMKM', 'wisata' => 'Wisata', 'lainnya' => 'Lainnya']],
    'luas_lahan' => ['label' => 'Luas Lahan', 'type' => 'text', 'max' => 80, 'help' => 'Contoh: 25 ha'],
    'produksi'   => ['label' => 'Jumlah Produksi', 'type' => 'text', 'max' => 80],
    'satuan'     => ['label' => 'Satuan', 'type' => 'text', 'max' => 40, 'help' => 'Contoh: ton/tahun'],
    'deskripsi'  => ['label' => 'Deskripsi', 'type' => 'textarea', 'rows' => 4],
    'gambar'     => ['label' => 'Gambar', 'type' => 'image', 'folder' => 'potensi'],
  ],
],

'penduduk' => [
  'label'  => 'Data Penduduk',
  'table'  => 'penduduk',
  'order'  => 'tahun DESC, dusun ASC',
  'search' => ['dusun'],
  'list'   => [
    'dusun'      => ['label' => 'Dusun'],
    'jumlah_kk'  => ['label' => 'KK'],
    'laki_laki'  => ['label' => 'Laki-laki'],
    'perempuan'  => ['label' => 'Perempuan'],
    'tahun'      => ['label' => 'Tahun'],
  ],
  'fields' => [
    'dusun'      => ['label' => 'Nama Dusun', 'type' => 'text', 'required' => true, 'max' => 100],
    'jumlah_kk'  => ['label' => 'Jumlah KK', 'type' => 'number', 'default' => '0'],
    'laki_laki'  => ['label' => 'Jumlah Laki-laki', 'type' => 'number', 'default' => '0'],
    'perempuan'  => ['label' => 'Jumlah Perempuan', 'type' => 'number', 'default' => '0'],
    'tahun'      => ['label' => 'Tahun Data', 'type' => 'number', 'default' => 'year'],
    'keterangan' => ['label' => 'Keterangan', 'type' => 'text', 'max' => 255],
  ],
],

'layanan' => [
  'label'  => 'Layanan Administrasi',
  'table'  => 'layanan',
  'order'  => 'urutan ASC, id ASC',
  'search' => ['nama'],
  'list'   => [
    'nama'         => ['label' => 'Nama Layanan'],
    'waktu_proses' => ['label' => 'Waktu Proses'],
    'biaya'        => ['label' => 'Biaya'],
    'urutan'       => ['label' => 'Urutan'],
  ],
  'fields' => [
    'nama'         => ['label' => 'Nama Layanan', 'type' => 'text', 'required' => true, 'max' => 150],
    'persyaratan'  => ['label' => 'Persyaratan', 'type' => 'textarea', 'rows' => 5, 'help' => 'Satu persyaratan per baris.'],
    'waktu_proses' => ['label' => 'Waktu Proses', 'type' => 'text', 'max' => 80],
    'biaya'        => ['label' => 'Biaya', 'type' => 'text', 'max' => 80],
    'urutan'       => ['label' => 'Urutan Tampil', 'type' => 'number', 'default' => '0'],
  ],
],

'anggaran' => [
  'label'  => 'Transparansi Anggaran',
  'table'  => 'anggaran',
  'order'  => 'tahun DESC, jenis ASC, id ASC',
  'search' => ['uraian', 'sumber'],
  'list'   => [
    'tahun'  => ['label' => 'Tahun'],
    'jenis'  => ['label' => 'Jenis', 'type' => 'badge'],
    'uraian' => ['label' => 'Uraian'],
    'jumlah' => ['label' => 'Jumlah', 'type' => 'money'],
    'sumber' => ['label' => 'Sumber'],
  ],
  'fields' => [
    'tahun'      => ['label' => 'Tahun Anggaran', 'type' => 'number', 'default' => 'year', 'required' => true],
    'jenis'      => ['label' => 'Jenis', 'type' => 'select', 'options' => ['pendapatan' => 'Pendapatan', 'belanja' => 'Belanja', 'pembiayaan' => 'Pembiayaan']],
    'uraian'     => ['label' => 'Uraian', 'type' => 'text', 'required' => true, 'max' => 200],
    'jumlah'     => ['label' => 'Jumlah (Rp)', 'type' => 'number', 'step' => '0.01', 'default' => '0'],
    'sumber'     => ['label' => 'Sumber Dana', 'type' => 'text', 'max' => 120],
    'keterangan' => ['label' => 'Keterangan', 'type' => 'text', 'max' => 255],
  ],
],

];

-- =====================================================================
-- Database  : desa_fataatu_timur
-- Website Resmi Desa Fataatu Timur, Kec. Wewaria, Kab. Ende, NTT
-- Import via phpMyAdmin (XAMPP) atau: mysql -u root < desa_fataatu_timur.sql
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `desa_fataatu_timur`
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `desa_fataatu_timur`;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- Tabel: users (admin)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(100) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','operator') NOT NULL DEFAULT 'admin',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- AKUN BAWAAN (password sudah di-hash bcrypt, cocok dengan password_verify)
--   1) Administrator : username = admin      password = admin123
--   2) Operator      : username = operator   password = operator123
--   WAJIB diganti lewat menu "Pengguna Admin" / "Profil Akun" setelah online.
-- ---------------------------------------------------------------------
INSERT INTO `users` (`nama`,`username`,`password`,`role`) VALUES
('Administrator Desa','admin','$2a$10$5CAwFbaq8hOgpCqXReKfbO035i2AiPgihM9o1Ol5JVIqUagVxA1mi','admin'),
('Operator Website','operator','$2a$10$aRutzdjk8./le0UTS/HzwuRDDtMQhP0t6jY885ThY5OtpZKg5xzBK','operator');

-- ---------------------------------------------------------------------
-- Tabel: pengaturan (identitas & kontak desa)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `pengaturan`;
CREATE TABLE `pengaturan` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `kunci` VARCHAR(60) NOT NULL,
  `label` VARCHAR(120) NOT NULL,
  `nilai` TEXT DEFAULT NULL,
  `tipe` ENUM('text','textarea') NOT NULL DEFAULT 'text',
  PRIMARY KEY (`id`),
  UNIQUE KEY `kunci` (`kunci`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `pengaturan` (`kunci`,`label`,`nilai`,`tipe`) VALUES
('nama_desa','Nama Desa','Desa Fataatu Timur','text'),
('kecamatan','Kecamatan','Wewaria','text'),
('kabupaten','Kabupaten','Ende','text'),
('provinsi','Provinsi','Nusa Tenggara Timur','text'),
('kode_pos','Kode Pos','[ISI KODE POS]','text'),
('alamat_kantor','Alamat Kantor Desa','[ISI ALAMAT LENGKAP KANTOR DESA]','textarea'),
('telepon','Telepon','[ISI NOMOR TELEPON]','text'),
('email','Email','[ISI EMAIL RESMI DESA]','text'),
('jam_layanan','Jam Layanan','Senin - Jumat, 08.00 - 15.00 WITA','text'),
('facebook','Facebook','[ISI TAUTAN FACEBOOK]','text'),
('instagram','Instagram','[ISI TAUTAN INSTAGRAM]','text'),
('youtube','YouTube','[ISI TAUTAN YOUTUBE]','text'),
('map_lat','Latitude Peta Desa','-8.6500','text'),
('map_lng','Longitude Peta Desa','121.6000','text'),
('map_zoom','Zoom Peta','13','text'),
('luas_wilayah','Luas Wilayah','[ISI LUAS WILAYAH] km²','text'),
('jumlah_dusun','Jumlah Dusun','[ISI JUMLAH DUSUN]','text'),
('jumlah_rt','Jumlah RT','[ISI JUMLAH RT]','text'),
('jumlah_rw','Jumlah RW','[ISI JUMLAH RW]','text'),
('sambutan_kades','Sambutan Kepala Desa','[ISI TEKS SAMBUTAN KEPALA DESA. Teks ini adalah placeholder dan dapat diganti melalui menu Admin > Pengaturan.]','textarea'),
('profil_umum','Profil Umum Desa','[ISI PROFIL UMUM DESA FATAATU TIMUR: letak geografis, batas wilayah, topografi, iklim, dan gambaran umum masyarakat. Data belum tersedia — silakan lengkapi melalui menu Admin > Pengaturan.]','textarea'),
('batas_utara','Batas Utara','[ISI BATAS UTARA]','text'),
('batas_selatan','Batas Selatan','[ISI BATAS SELATAN]','text'),
('batas_timur','Batas Timur','[ISI BATAS TIMUR]','text'),
('batas_barat','Batas Barat','[ISI BATAS BARAT]','text'),
('sejarah','Sejarah Desa','[ISI SEJARAH DESA FATAATU TIMUR. Data historis resmi belum tersedia — silakan lengkapi melalui menu Admin > Pengaturan.]','textarea'),
('visi','Visi Desa','[ISI VISI DESA FATAATU TIMUR]','textarea'),
('misi','Misi Desa','[ISI MISI 1]\n[ISI MISI 2]\n[ISI MISI 3]\n[ISI MISI 4]','textarea');

-- ---------------------------------------------------------------------
-- Tabel: kategori berita
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `kategori`;
CREATE TABLE `kategori` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(80) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `kategori` (`nama`,`slug`) VALUES
('Pemerintahan','pemerintahan'),
('Pembangunan','pembangunan'),
('Pertanian','pertanian'),
('Kesehatan','kesehatan'),
('Sosial Budaya','sosial-budaya');

-- ---------------------------------------------------------------------
-- Tabel: berita
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `berita`;
CREATE TABLE `berita` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `judul` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(220) NOT NULL,
  `kategori_id` INT(11) DEFAULT NULL,
  `ringkasan` TEXT DEFAULT NULL,
  `isi` LONGTEXT DEFAULT NULL,
  `gambar` VARCHAR(255) DEFAULT NULL,
  `penulis` VARCHAR(100) DEFAULT NULL,
  `tanggal` DATE NOT NULL,
  `status` ENUM('draft','publish') NOT NULL DEFAULT 'publish',
  `dilihat` INT(11) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `kategori_id` (`kategori_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `berita` (`judul`,`slug`,`kategori_id`,`ringkasan`,`isi`,`gambar`,`penulis`,`tanggal`,`status`) VALUES
('[CONTOH] Musyawarah Desa Penyusunan RKP Desa','contoh-musyawarah-desa-rkp',1,'[RINGKASAN BERITA - GANTI MELALUI ADMIN]','[ISI BERITA. Ini adalah data contoh (placeholder) agar tampilan website dapat diuji. Hapus atau ganti melalui menu Admin > Berita.]',NULL,'Admin Desa','2026-01-10','publish'),
('[CONTOH] Penyaluran Bantuan Bibit Pertanian','contoh-penyaluran-bibit',3,'[RINGKASAN BERITA - GANTI MELALUI ADMIN]','[ISI BERITA. Ini adalah data contoh (placeholder). Hapus atau ganti melalui menu Admin > Berita.]',NULL,'Admin Desa','2026-02-05','publish'),
('[CONTOH] Kegiatan Posyandu Balita Bulanan','contoh-posyandu-balita',4,'[RINGKASAN BERITA - GANTI MELALUI ADMIN]','[ISI BERITA. Ini adalah data contoh (placeholder). Hapus atau ganti melalui menu Admin > Berita.]',NULL,'Admin Desa','2026-03-12','publish');

-- ---------------------------------------------------------------------
-- Tabel: galeri
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `galeri`;
CREATE TABLE `galeri` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `judul` VARCHAR(150) NOT NULL,
  `kategori` VARCHAR(80) DEFAULT NULL,
  `gambar` VARCHAR(255) DEFAULT NULL,
  `keterangan` TEXT DEFAULT NULL,
  `tanggal` DATE DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `galeri` (`judul`,`kategori`,`gambar`,`keterangan`,`tanggal`) VALUES
('[CONTOH] Kantor Desa','Sarana Prasarana',NULL,'[KETERANGAN FOTO - GANTI MELALUI ADMIN]','2026-01-15'),
('[CONTOH] Lahan Pertanian Warga','Pertanian',NULL,'[KETERANGAN FOTO - GANTI MELALUI ADMIN]','2026-02-15'),
('[CONTOH] Kegiatan Gotong Royong','Kegiatan',NULL,'[KETERANGAN FOTO - GANTI MELALUI ADMIN]','2026-03-15');

-- ---------------------------------------------------------------------
-- Tabel: agenda
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `agenda`;
CREATE TABLE `agenda` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `judul` VARCHAR(180) NOT NULL,
  `tanggal_mulai` DATE NOT NULL,
  `tanggal_selesai` DATE DEFAULT NULL,
  `waktu` VARCHAR(60) DEFAULT NULL,
  `tempat` VARCHAR(180) DEFAULT NULL,
  `penyelenggara` VARCHAR(150) DEFAULT NULL,
  `keterangan` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `agenda` (`judul`,`tanggal_mulai`,`tanggal_selesai`,`waktu`,`tempat`,`penyelenggara`,`keterangan`) VALUES
('[CONTOH] Musyawarah Desa','2026-09-10','2026-09-10','09.00 WITA','Aula Kantor Desa','Pemerintah Desa','[KETERANGAN AGENDA - GANTI MELALUI ADMIN]'),
('[CONTOH] Pelatihan Kelompok Tani','2026-10-05','2026-10-06','08.00 WITA','Balai Desa','[ISI PENYELENGGARA]','[KETERANGAN AGENDA - GANTI MELALUI ADMIN]');

-- ---------------------------------------------------------------------
-- Tabel: aparatur
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `aparatur`;
CREATE TABLE `aparatur` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(120) NOT NULL,
  `jabatan` VARCHAR(120) NOT NULL,
  `nip` VARCHAR(50) DEFAULT NULL,
  `foto` VARCHAR(255) DEFAULT NULL,
  `urutan` INT(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `aparatur` (`nama`,`jabatan`,`nip`,`urutan`) VALUES
('[ISI NAMA]','Kepala Desa','-',1),
('[ISI NAMA]','Sekretaris Desa','-',2),
('[ISI NAMA]','Kaur Keuangan','-',3),
('[ISI NAMA]','Kaur Umum & Perencanaan','-',4),
('[ISI NAMA]','Kasi Pemerintahan','-',5),
('[ISI NAMA]','Kasi Kesejahteraan & Pelayanan','-',6),
('[ISI NAMA]','Kepala Dusun I','-',7),
('[ISI NAMA]','Kepala Dusun II','-',8);

-- ---------------------------------------------------------------------
-- Tabel: potensi desa
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `potensi`;
CREATE TABLE `potensi` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(150) NOT NULL,
  `jenis` ENUM('pertanian','perkebunan','peternakan','perikanan','umkm','wisata','lainnya') NOT NULL DEFAULT 'lainnya',
  `deskripsi` TEXT DEFAULT NULL,
  `luas_lahan` VARCHAR(80) DEFAULT NULL,
  `produksi` VARCHAR(80) DEFAULT NULL,
  `satuan` VARCHAR(40) DEFAULT NULL,
  `gambar` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `potensi` (`nama`,`jenis`,`deskripsi`,`luas_lahan`,`produksi`,`satuan`) VALUES
('Jagung','pertanian','[ISI DESKRIPSI KOMODITAS JAGUNG]','[ISI] ha','[ISI]','ton/tahun'),
('Padi','pertanian','[ISI DESKRIPSI KOMODITAS PADI]','[ISI] ha','[ISI]','ton/tahun'),
('Ubi Kayu / Ubi Jalar','pertanian','[ISI DESKRIPSI KOMODITAS UBI]','[ISI] ha','[ISI]','ton/tahun'),
('Sayur-sayuran','pertanian','[ISI DESKRIPSI KOMODITAS SAYURAN]','[ISI] ha','[ISI]','ton/tahun'),
('Kelapa','perkebunan','[ISI DESKRIPSI KOMODITAS KELAPA]','[ISI] ha','[ISI]','ton/tahun'),
('Kakao','perkebunan','[ISI DESKRIPSI KOMODITAS KAKAO]','[ISI] ha','[ISI]','ton/tahun'),
('Kopi','perkebunan','[ISI DESKRIPSI KOMODITAS KOPI]','[ISI] ha','[ISI]','ton/tahun'),
('Kemiri','perkebunan','[ISI DESKRIPSI KOMODITAS KEMIRI]','[ISI] ha','[ISI]','ton/tahun'),
('Pisang','perkebunan','[ISI DESKRIPSI KOMODITAS PISANG]','[ISI] ha','[ISI]','ton/tahun'),
('Ternak Babi & Kambing','peternakan','[ISI DESKRIPSI POTENSI PETERNAKAN]','-','[ISI]','ekor'),
('UMKM Olahan Pangan Lokal','umkm','[ISI DESKRIPSI POTENSI UMKM DESA]','-','[ISI]','unit');

-- ---------------------------------------------------------------------
-- Tabel: wisata
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `wisata`;
CREATE TABLE `wisata` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(150) NOT NULL,
  `lokasi` VARCHAR(180) DEFAULT NULL,
  `deskripsi` TEXT DEFAULT NULL,
  `fasilitas` VARCHAR(255) DEFAULT NULL,
  `gambar` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `wisata` (`nama`,`lokasi`,`deskripsi`,`fasilitas`) VALUES
('[ISI NAMA OBJEK WISATA 1]','[ISI LOKASI/DUSUN]','[ISI DESKRIPSI OBJEK WISATA. Data belum tersedia — lengkapi melalui Admin > Wisata.]','[ISI FASILITAS]'),
('[ISI NAMA OBJEK WISATA 2]','[ISI LOKASI/DUSUN]','[ISI DESKRIPSI OBJEK WISATA. Data belum tersedia — lengkapi melalui Admin > Wisata.]','[ISI FASILITAS]');

-- ---------------------------------------------------------------------
-- Tabel: penduduk (data agregat per dusun)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `penduduk`;
CREATE TABLE `penduduk` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `dusun` VARCHAR(100) NOT NULL,
  `jumlah_kk` INT(11) NOT NULL DEFAULT 0,
  `laki_laki` INT(11) NOT NULL DEFAULT 0,
  `perempuan` INT(11) NOT NULL DEFAULT 0,
  `tahun` YEAR NOT NULL,
  `keterangan` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `penduduk` (`dusun`,`jumlah_kk`,`laki_laki`,`perempuan`,`tahun`,`keterangan`) VALUES
('[ISI NAMA DUSUN I]',0,0,0,2026,'[DATA PLACEHOLDER - ISI MELALUI ADMIN]'),
('[ISI NAMA DUSUN II]',0,0,0,2026,'[DATA PLACEHOLDER - ISI MELALUI ADMIN]'),
('[ISI NAMA DUSUN III]',0,0,0,2026,'[DATA PLACEHOLDER - ISI MELALUI ADMIN]');

-- ---------------------------------------------------------------------
-- Tabel: layanan
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `layanan`;
CREATE TABLE `layanan` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(150) NOT NULL,
  `persyaratan` TEXT DEFAULT NULL,
  `waktu_proses` VARCHAR(80) DEFAULT NULL,
  `biaya` VARCHAR(80) DEFAULT NULL,
  `urutan` INT(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `layanan` (`nama`,`persyaratan`,`waktu_proses`,`biaya`,`urutan`) VALUES
('Surat Keterangan Domisili','Fotokopi KTP\nFotokopi Kartu Keluarga\nSurat pengantar RT/RW','1 hari kerja','Gratis',1),
('Surat Keterangan Tidak Mampu (SKTM)','Fotokopi KTP\nFotokopi Kartu Keluarga\nSurat pengantar RT/RW','1 hari kerja','Gratis',2),
('Surat Keterangan Usaha','Fotokopi KTP\nFotokopi Kartu Keluarga\nKeterangan lokasi usaha','1 hari kerja','Gratis',3),
('Pengantar Pembuatan KTP / KK','Fotokopi dokumen pendukung\nSurat pengantar RT/RW','1 hari kerja','Gratis',4),
('Surat Keterangan Kelahiran','Surat keterangan bidan/rumah sakit\nFotokopi KK dan KTP orang tua','1 hari kerja','Gratis',5),
('Surat Keterangan Kematian','Fotokopi KTP almarhum/almarhumah\nFotokopi KK\nSurat pengantar RT/RW','1 hari kerja','Gratis',6);

-- ---------------------------------------------------------------------
-- Tabel: anggaran (transparansi APBDes)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `anggaran`;
CREATE TABLE `anggaran` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `tahun` YEAR NOT NULL,
  `jenis` ENUM('pendapatan','belanja','pembiayaan') NOT NULL DEFAULT 'pendapatan',
  `uraian` VARCHAR(200) NOT NULL,
  `jumlah` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `sumber` VARCHAR(120) DEFAULT NULL,
  `keterangan` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `anggaran` (`tahun`,`jenis`,`uraian`,`jumlah`,`sumber`,`keterangan`) VALUES
(2026,'pendapatan','Dana Desa (DD)',0.00,'APBN','[DATA PLACEHOLDER - ISI MELALUI ADMIN]'),
(2026,'pendapatan','Alokasi Dana Desa (ADD)',0.00,'APBD Kabupaten','[DATA PLACEHOLDER - ISI MELALUI ADMIN]'),
(2026,'pendapatan','Pendapatan Asli Desa',0.00,'PADes','[DATA PLACEHOLDER - ISI MELALUI ADMIN]'),
(2026,'belanja','Bidang Penyelenggaraan Pemerintahan Desa',0.00,'-','[DATA PLACEHOLDER - ISI MELALUI ADMIN]'),
(2026,'belanja','Bidang Pelaksanaan Pembangunan Desa',0.00,'-','[DATA PLACEHOLDER - ISI MELALUI ADMIN]'),
(2026,'belanja','Bidang Pembinaan Kemasyarakatan',0.00,'-','[DATA PLACEHOLDER - ISI MELALUI ADMIN]'),
(2026,'belanja','Bidang Pemberdayaan Masyarakat',0.00,'-','[DATA PLACEHOLDER - ISI MELALUI ADMIN]'),
(2026,'belanja','Bidang Penanggulangan Bencana & Mendesak',0.00,'-','[DATA PLACEHOLDER - ISI MELALUI ADMIN]');

-- ---------------------------------------------------------------------
-- Tabel: faq
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `faq`;
CREATE TABLE `faq` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `pertanyaan` VARCHAR(255) NOT NULL,
  `jawaban` TEXT NOT NULL,
  `urutan` INT(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `faq` (`pertanyaan`,`jawaban`,`urutan`) VALUES
('Bagaimana cara mengurus surat keterangan di kantor desa?','Datang ke Kantor Desa pada jam layanan dengan membawa persyaratan yang tercantum pada halaman Layanan, atau hubungi kontak resmi desa.',1),
('Berapa lama proses pembuatan surat?','Umumnya selesai dalam 1 hari kerja apabila persyaratan lengkap.',2),
('Apakah ada biaya untuk layanan administrasi desa?','Seluruh layanan administrasi dasar di kantor desa tidak dipungut biaya (gratis).',3),
('Kapan jam pelayanan kantor desa?','[ISI JAM LAYANAN RESMI - dapat diubah melalui Admin > Pengaturan]',4),
('Bagaimana cara menyampaikan aspirasi atau pengaduan?','Melalui formulir pada halaman Kontak, atau datang langsung ke kantor desa.',5);

-- ---------------------------------------------------------------------
-- Tabel: pesan (kontak masuk)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `pesan`;
CREATE TABLE `pesan` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `telepon` VARCHAR(40) DEFAULT NULL,
  `subjek` VARCHAR(180) DEFAULT NULL,
  `pesan` TEXT NOT NULL,
  `dibaca` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

CREATE DATABASE IF NOT EXISTS `fataatu_timur` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `fataatu_timur`;

CREATE TABLE IF NOT EXISTS settings (
 id TINYINT UNSIGNED PRIMARY KEY,
 name VARCHAR(150) NOT NULL,
 location VARCHAR(255) DEFAULT '',
 email VARCHAR(150) DEFAULT '',
 phone VARCHAR(50) DEFAULT '',
 address TEXT,
 penduduk INT UNSIGNED DEFAULT 0,
 kk INT UNSIGNED DEFAULT 0,
 dusun INT UNSIGNED DEFAULT 0
) ENGINE=InnoDB;

INSERT INTO settings (id,name,location,email,phone,address,penduduk,kk,dusun)
VALUES (1,'Desa Fataatu Timur','Kec. Wewaria · Kab. Ende','','','','0','0','0')
ON DUPLICATE KEY UPDATE id=id;

CREATE TABLE IF NOT EXISTS news (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 title VARCHAR(255) NOT NULL, cat VARCHAR(100) DEFAULT '', date DATE NULL,
 summary TEXT, body LONGTEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS agenda (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 title VARCHAR(255) NOT NULL, date DATE NULL, time VARCHAR(20) DEFAULT '',
 place VARCHAR(255) DEFAULT '', `desc` TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS gallery (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 title VARCHAR(255) NOT NULL, src LONGTEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS potentials (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(255) NOT NULL, cat VARCHAR(100) DEFAULT '', `desc` TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS services (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(255) NOT NULL, `desc` TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS faqs (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 q VARCHAR(500) NOT NULL, a TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS messages (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(150) NOT NULL, email VARCHAR(190) DEFAULT '', subject VARCHAR(255) DEFAULT '', message TEXT NOT NULL,
 status ENUM('baru','dibaca','dibalas') NOT NULL DEFAULT 'baru', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS page_content (
 slug VARCHAR(80) PRIMARY KEY,
 title VARCHAR(255) NOT NULL,
 subtitle TEXT,
 content LONGTEXT,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
INSERT INTO page_content(slug,title,subtitle,content) VALUES
('profil','Profil Desa','Profil umum Desa Fataatu Timur.','Silakan isi profil resmi desa di menu Admin → Konten Halaman.'),
('sejarah','Sejarah','Sejarah singkat berdirinya dan perkembangan Desa Fataatu Timur.','Silakan isi sejarah resmi desa di menu Admin → Konten Halaman.'),
('visi-misi','Visi & Misi','Arah pembangunan dan pelayanan Desa Fataatu Timur.','Silakan isi visi dan misi resmi desa di menu Admin → Konten Halaman.'),
('struktur','Struktur Pemerintahan','Susunan aparatur Pemerintah Desa Fataatu Timur.','Silakan isi nama dan jabatan aparatur di menu Admin → Konten Halaman.'),
('transparansi','Transparansi Desa','Informasi transparansi dan dokumen publik desa.','Silakan isi informasi transparansi desa di menu Admin → Konten Halaman.'),
('hasil-bumi','Hasil Bumi','Komoditas unggulan masyarakat Desa Fataatu Timur.','Silakan isi daftar hasil bumi di menu Admin → Konten Halaman.'),
('wisata','Wisata Desa','Potensi wisata Desa Fataatu Timur.','Silakan isi informasi wisata di menu Admin → Konten Halaman.'),
('sambutan','Sambutan Kepala Desa','Pesan Kepala Desa untuk masyarakat.','Silakan isi sambutan Kepala Desa di menu Admin → Konten Halaman.')
ON DUPLICATE KEY UPDATE slug=VALUES(slug);

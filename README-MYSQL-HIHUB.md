# Versi MySQL — Desa Fataatu Timur

## Login Admin
Username: admin
Password: admin123

## Instalasi di HiHub/hosting
1. Upload semua file ZIP ke hosting.
2. Buat database MySQL bernama `fataatu_timur`.
3. Buka phpMyAdmin → pilih database → Import `database.sql`.
4. Buka `api/config.php`.
5. Isi:
   - $host = host MySQL dari HiHub
   - $db = fataatu_timur
   - $user = username MySQL
   - $pass = password MySQL
6. Simpan.
7. Buka `https://domain-anda/admin.html`.
8. Login.
9. Coba tambah berita.
10. Buka website publik. Data berasal dari database.

## Catatan penting
- Pastikan hosting mendukung PHP dan MySQL/MariaDB.
- Jika HiHub hanya menerima hosting HTML statis tanpa PHP/MySQL, versi ini tidak dapat menjalankan backend; gunakan hosting/server yang mendukung PHP + MySQL.
- Untuk produksi, password admin sebaiknya dipindahkan ke tabel users dengan password_hash/password_verify. Versi demo ini memakai kredensial tetap agar mudah diuji.
- Upload foto sebagai base64 ke MySQL cocok untuk demo kecil. Untuk produksi sebaiknya simpan file di folder uploads/object storage dan database hanya menyimpan URL.

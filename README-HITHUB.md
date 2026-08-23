# Desa Fataatu Timur — Versi HTML/CSS/JS untuk HiHub

Versi ini adalah konversi **front-end statis** dari proyek PHP/MySQL pada ZIP sumber.

## Cara pakai
1. Upload seluruh isi folder ini ke project/hosting HiHub.
2. Pastikan `index.html` berada di root project.
3. Folder `assets/` dan `uploads/` jangan dipisahkan dari file HTML.
4. Website menggunakan Bootstrap, Bootstrap Icons, dan Google Fonts melalui CDN.
5. Peta menggunakan OpenStreetMap iframe.

## Catatan penting
- PHP, MySQL, login admin, CRUD, upload database, dan penyimpanan pesan **tidak dapat berjalan sebagai HTML statis**.
- Halaman `admin.html` hanya penanda mode statis.
- Form Kontak menampilkan simulasi berhasil di browser, bukan mengirim ke database.
- Data `[ISI ...]` dipertahankan karena memang merupakan placeholder pada database sumber.
- Untuk website online yang benar-benar bisa dikelola dari dashboard, diperlukan backend seperti Firebase/Supabase atau server PHP/MySQL.

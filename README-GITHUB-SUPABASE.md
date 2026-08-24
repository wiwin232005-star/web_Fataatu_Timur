# Desa Fataatu Timur — GitHub Pages + Supabase

Versi ini TIDAK menggunakan PHP/MySQL. Cocok untuk GitHub Pages. Database online menggunakan Supabase.

## Urutan pemasangan
1. Buat project di Supabase.
2. Buka SQL Editor dan jalankan seluruh `supabase/schema.sql`.
3. Di Authentication > Users, buat user Admin dengan email + password.
4. Di SQL Editor jalankan: `insert into public.admin_users(user_id) select id from auth.users where email='EMAIL_ADMIN_ANDA';`
5. Buka Project Settings/API, salin Project URL dan Publishable key (atau anon key lama). Jangan gunakan service_role/secret key di browser.
6. Edit `supabase-config.js` dan masukkan URL + key.
7. Upload seluruh isi ZIP ke repository GitHub Pages.
8. Buka `admin.html`, login dengan email/password Admin.

## Cara kerja
- Pengunjung membaca konten dari Supabase.
- FAQ dan Kontak mengirim pesan langsung ke tabel `messages`.
- Admin mengelola berita, agenda, galeri, potensi, layanan, FAQ, halaman profil/sejarah/visi-misi/struktur/transparansi/hasil-bumi/wisata/sambutan, dan pengaturan.
- Galeri menggunakan Supabase Storage bucket `gallery`.

## Keamanan
Publishable/anon key boleh berada di frontend jika RLS disetel benar. Jangan pernah memasukkan service_role/secret key ke `supabase-config.js`. RLS pada schema sudah disiapkan.

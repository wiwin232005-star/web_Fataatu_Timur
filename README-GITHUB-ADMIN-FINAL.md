# Website Desa Fataatu Timur — GitHub Pages + Supabase

## Penting
GitHub Pages hanya menjalankan HTML/CSS/JavaScript. PHP + MySQL tidak dapat dijalankan langsung di GitHub Pages. Karena itu versi publik ini menggunakan Supabase sebagai database online dan Authentication/Storage.

## 1. Upload database
Buka Supabase → SQL Editor → paste seluruh isi `supabase/schema.sql` → Run.

## 2. Buat akun Admin
Supabase → Authentication → Users → Add user. Buat email + password Admin.

Setelah itu buka website `admin.html`, login dengan akun tersebut. Agar akun menjadi Admin, tambahkan user ke tabel `admin_users` menggunakan SQL berikut (sekali saja untuk Admin pertama):

```sql
insert into public.admin_users(user_id,email,name,role)
select id,email,'Administrator Utama','superadmin'
from auth.users
where lower(email)=lower('EMAIL_ADMIN_ANDA');
```

Ganti `EMAIL_ADMIN_ANDA` dengan email Admin yang dibuat di Authentication.

## 3. Konfigurasi website
Buka `supabase-config.js` dan isi:

```js
window.SUPABASE_CONFIG = {
  url: 'https://PROJECT-ANDA.supabase.co',
  key: 'PUBLISHABLE-ATAU-ANON-KEY-ANDA'
};
```

Gunakan Publishable/anon key. JANGAN gunakan service_role/secret key.

## 4. Upload ke GitHub Pages
Upload seluruh isi ZIP ke repository GitHub yang menjadi sumber GitHub Pages. Jangan mengubah struktur folder.

## 5. Admin
Buka `/admin.html`.

Menu tersedia:
- Dashboard
- Profil & Sejarah
- Visi Misi
- Pemerintahan
- Data Desa
- Potensi
- Berita
- Agenda
- Galeri
- Transparansi / Dokumen
- FAQ
- Pesan Masuk
- Pengaturan Website
- Manajemen Admin
- Logout

Semua modul CRUD tersimpan di Supabase dan dibaca kembali oleh halaman publik.

## 6. Manajemen Admin
User baru harus dibuat dulu di Supabase Authentication → Users. Setelah itu Admin yang sedang login dapat memasukkan email user tersebut di menu Manajemen Admin untuk memberinya hak Admin. Penghapusan hak Admin dilakukan dari menu yang sama.

## 7. FAQ dan Kontak
Pertanyaan dari FAQ dan pesan dari Kontak masuk ke tabel `messages` dan tampil di Admin → Pesan Masuk. Status dapat diubah menjadi Baru, Dibaca, atau Dibalas.

## 8. Galeri dan Dokumen
Foto galeri disimpan di Supabase Storage bucket `gallery`. Dokumen transparansi disimpan di bucket `documents`. Bucket dan policy dibuat oleh `schema.sql`.

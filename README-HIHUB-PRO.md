# DESA FATAATU TIMUR — HIHUB PRO FINAL

Paket ini adalah versi front-end modern dari website Desa Fataatu Timur, dengan animasi, responsive layout, berita/agenda dinamis, dan dashboard admin demo.

## Fitur
- Semua halaman publik dari paket sumber dipertahankan.
- Animasi scroll/reveal, navbar sticky, progress bar, hover effects.
- Berita dapat dicari/filter.
- Berita terbaru di beranda membaca data dari CMS browser.
- Dashboard Admin untuk CRUD Berita dan Agenda.
- Pengaturan statistik penduduk, KK, dusun, aparatur dan kontak.
- Login demo admin.
- Data CMS disimpan di localStorage sehingga bisa dicoba tanpa server PHP/MySQL.
- Responsive untuk HP, tablet, dan desktop.
- Tidak ada build step; upload folder ini ke hosting/HiHub sebagai website statis.

## Login demo
Username: admin
Password: admin123

## Cara pakai
1. Ekstrak ZIP.
2. Upload seluruh isi folder ke project/hosting HiHub.
3. Pastikan `index.html` berada di root website.
4. Buka `index.html`.
5. Buka `admin.html` untuk mengelola berita dan agenda.
6. Ganti semua teks `[ISI ...]` pada halaman sumber dengan data resmi desa.

## Penting: database online
Versi ini sengaja tidak menanam kredensial database atau API key. Karena itu CMS admin menggunakan localStorage. Jika ingin perubahan admin terlihat oleh SEMUA pengunjung dari perangkat berbeda, hubungkan CMS ke Supabase/Firebase atau backend PHP/MySQL.

Jangan memasukkan password database, service-role key, atau kredensial rahasia ke file HTML/JS publik.

## Supabase yang disarankan
Tabel minimal:
- site_settings
- news
- agendas
- gallery
- services
- potentials
- messages
- admins (atau gunakan Supabase Auth)

Storage bucket:
- `gallery`
- `news`
- `apparatus`

RLS harus diaktifkan. Pengunjung hanya membaca data publik; hanya admin terautentikasi yang boleh INSERT/UPDATE/DELETE.

## Catatan
Peta, alamat, email, telepon, statistik, sambutan, struktur aparatur, dan data lain yang masih berupa `[ISI ...]` harus diisi dengan data resmi sebelum publikasi.

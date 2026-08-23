# DESA FATAATU TIMUR — ADMIN FUNCTIONAL

Versi ini memperbaiki Dashboard Admin agar CRUD benar-benar berfungsi untuk:
- Berita
- Agenda
- Galeri (upload gambar dari perangkat, disimpan sebagai data lokal)
- Potensi Desa
- Layanan Desa
- FAQ
- Statistik dan informasi kontak
- Backup JSON / Restore JSON

Login:
Username: admin
Password: admin123

Semua perubahan langsung disimpan ke localStorage dan dibaca oleh halaman publik pada browser yang sama.

PENTING:
Jika website sudah dihosting dan admin dibuka dari HP/laptop berbeda dengan pengunjung, localStorage tidak menjadi database bersama. Untuk sistem produksi, gunakan database online (misalnya Supabase/Firebase atau backend PHP/MySQL). Jangan menaruh secret/service-role key di JavaScript publik.

Cara pakai:
1. Upload seluruh isi ZIP ke HiHub/hosting.
2. Buka index.html.
3. Buka admin.html.
4. Login dengan akun di atas.
5. Tambah/edit/hapus data dan buka kembali halaman publik pada browser yang sama untuk melihat perubahan.
6. Gunakan Backup JSON sebelum migrasi.


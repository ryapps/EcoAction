# EcoAction

Fondasi MVP Next.js + JavaScript, Tailwind CSS, Supabase PostgreSQL, dan Gemini opsional.

## Menjalankan lokal

Gunakan Node.js 24 dan npm. Jalankan npm ci, kemudian npm run dev, lalu buka http://localhost:3000.

Untuk build produksi: npm run build, kemudian npm start.

Salin .env.example ke .env hanya jika .env belum tersedia. Isi credentials secara lokal; jangan commit .env. Pertahankan file CA prod-ca-2021.crt untuk koneksi Supabase pada tahap database.

## Status

T01 menyiapkan halaman awal saja. Integrasi database, migration/seed, aksi harian, completion, progress, dan fallback Gemini belum diimplementasikan. Komponen shadcn/ui akan ditambahkan sesuai kebutuhan UI. Ikuti urutan docs/tasks.md.

Demo menggunakan satu identitas sintetis bersama; bukan aplikasi publik dengan akun personal.

# EcoAction

Fondasi MVP Next.js + JavaScript, Tailwind CSS, Supabase PostgreSQL, dan Gemini opsional.

## Menjalankan lokal

Gunakan Node.js 24 dan npm. Jalankan npm ci, kemudian npm run dev, lalu buka http://localhost:3000.

Untuk build produksi: npm run build, kemudian npm start.

Salin .env.example ke .env hanya jika .env belum tersedia. Isi credentials secara lokal; jangan commit .env. Pertahankan file CA prod-ca-2021.crt untuk koneksi Supabase pada tahap database.

## Status

T01 dan T02 selesai: halaman awal, koneksi Supabase dengan CA, migration, dan seed demo tersedia. Aksi harian, completion, progress, dan fallback Gemini belum diimplementasikan. Komponen shadcn/ui akan ditambahkan sesuai kebutuhan UI. Ikuti urutan docs/tasks.md.

Demo menggunakan satu identitas sintetis bersama; bukan aplikasi publik dengan akun personal.

## Database

Isi DATABASE_URL (transaction pooler), MIGRATION_DATABASE_URL (session pooler/direct), dan DEMO_USER_ID (UUID sintetis) di .env. CA prod-ca-2021.crt wajib tersedia; verifikasi TLS selalu aktif.

Jalankan npm run db:migrate, kemudian npm run db:seed. Keduanya dapat dijalankan ulang. Migration yang sudah diterapkan tidak boleh diedit; buat file SQL berikutnya. Ledger ecoaction_migrations menyimpan checksum, bukan entity produk. Tabel existing dengan nama bentrok tidak ditimpa.

npm run db:verify menguji database nyata menggunakan data sintetis di dalam transaksi yang di-rollback. Jalankan setelah migration dan seed pada database demo terkendali. Akses browser langsung melalui Supabase Data API ditolak; semua operasi aplikasi melewati server.

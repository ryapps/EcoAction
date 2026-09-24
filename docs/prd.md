# Product Requirements Document

## 1. Product Overview

- **Nama:** EcoAction.
- **Deskripsi:** asisten sustainability yang mengubah awareness menjadi aksi pribadi sederhana, pencatatan, dan feedback.
- **Target:** pelajar SMP/SMA dan mahasiswa awal.
- **Problem utama:** mengetahui isu lingkungan belum berarti tahu apa yang bisa dilakukan hari ini atau mampu melakukannya secara konsisten.
- **Value proposition:** rekomendasi yang langsung dapat dilakukan, progress yang terlihat, dan arahan singkat untuk mengulang kebiasaan.

Sumber requirement adalah brief EcoAction dari user. Naskah studi kasus resmi, durasi aktual, dan aturan bonus belum diberikan. Detail operasional tambahan di bawah merupakan ASSUMPTION, bukan requirement penyelenggara.

## 2. Problem Statement

Pelajar membutuhkan jembatan antara pemahaman sustainability dan tindakan sehari-hari. Hambatannya adalah memilih aksi yang sederhana, menjaga konsistensi, mencatat aktivitas, serta memahami kemajuan. Produk membantu empat aktivitas pribadi: energy, waste, transportation, dan food. Dampak dijelaskan secara kualitatif; jumlah aksi bukan ukuran emisi yang berhasil dikurangi.

## 3. Goals

1. Membantu user menentukan aksi sustainability hari ini.
2. Memungkinkan penyelesaian aksi dicatat dengan interaksi singkat.
3. Menampilkan progress yang benar berdasarkan aktivitas tersimpan.
4. Memberikan feedback berbasis aktivitas agar user terdorong mengulang.

## 4. Non-Goals

Tidak membuat social feed, leaderboard kompleks, marketplace, IoT, kalkulator carbon footprint presisi, badge/achievement kompleks, admin dashboard, school management, atau notification system.

Tidak membuat chatbot, autonomous agent, onboarding panjang, aksi kustom, edit/hapus/undo aksi, filter lanjutan, ekspor, maupun aplikasi mobile native. Authentication dan layanan multiuser publik berada di luar MVP berdasarkan asumsi demo; bukan berarti data multiuser boleh dibuka tanpa proteksi.

## 5. User Persona

Pelajar yang memahami isu lingkungan, membuka aplikasi lewat ponsel di sela kegiatan, dan ingin tahu langkah kecil yang realistis. Ia membutuhkan bahasa Indonesia yang jelas, tidak menghakimi, serta tidak menuntut pembelian barang.

## 6. Core User Flow

User membuka dashboard → sistem membaca aksi hari ini → bila kosong, user meminta rekomendasi → sistem menghasilkan dan menyimpan aksi → user melakukan aksi di dunia nyata → menandai selesai → sistem menyimpan status dan menghitung progress → user meminta feedback → mendapat satu saran lanjutan → kembali pada hari berikutnya.

Awareness → Recommendation → Action → Tracking → Feedback → Repeat.

## 7. MVP Features

### Must Have

- **M1 — AI Daily Eco Action:** rekomendasi harian sederhana pada empat kategori, disimpan ke Supabase (PostgreSQL) dan ditampilkan kembali saat refresh.
- **M2 — Eco Action Tracker:** aksi hari ini dapat ditandai selesai; perubahan persisten dan tidak dihitung ganda.
- **M3 — Progress & AI Feedback:** total aksi selesai, progress minggu berjalan, distribusi kategori, riwayat minggu berjalan, serta feedback singkat berbasis data aktual.
- **Q1 — Kelayakan demo:** dua halaman utama, alur end-to-end, mobile dasar, state kegagalan yang dapat dipulihkan, secrets di server, dan deployment yang dapat didemokan.

Q1 adalah kriteria kualitas lintas fitur, bukan fitur keempat.

### Should Have

Setelah P0 lulus: perbaikan microcopy, spacing, dan pemeriksaan aksesibilitas lebih menyeluruh pada flow yang sudah ada. Tidak menambah halaman atau operasi server.

### Could Have

Jika waktu benar-benar tersedia: uji kegunaan singkat dengan satu rekan dan revisi kecil pada flow yang sama. Tidak ada fitur bonus baru yang disetujui.

## 8. User Stories

- **US1 / M1:** As a student, I want to receive simple daily sustainability actions, so that I know what I can do today.
- **US2 / M2:** As a student, I want to mark an action completed, so that my effort is recorded.
- **US3 / M3:** As a student, I want to see my weekly progress and activity categories, so that I understand my consistency.
- **US4 / M3:** As a student, I want to receive feedback based on my activity, so that I know what to continue next.

## 9. Acceptance Criteria

### M1 — Daily recommendations

- [ ] Pada hari tanpa aksi, dashboard menampilkan CTA untuk mendapatkan aksi.
- [ ] Satu permintaan berhasil menghasilkan tepat tiga judul berbeda, singkat, dan berbahasa Indonesia; kategori hanya energy, waste, transport, food.
- [ ] Aksi dapat dilakukan pelajar tanpa pembelian wajib atau aktivitas berisiko.
- [ ] Ketiga aksi disimpan secara atomik dengan user, tanggal server, dan status todo sebelum UI menyatakan berhasil.
- [ ] Refresh, klik ulang, dan dua permintaan bersamaan tidak membuat batch tambahan untuk hari yang sama.
- [ ] Pada hari baru, aksi baru dapat dibuat tanpa mengubah riwayat.
- [ ] Jika AI gagal/invalid, tiga aksi kurasi dapat disimpan dan UI menjelaskan bahwa rekomendasi cadangan digunakan.

### M2 — Tracking

- [ ] User dapat menyelesaikan aksi hari ini; status tetap completed setelah refresh.
- [ ] Klik ganda atau retry atas aksi completed tidak menambah hitungan.
- [ ] Kegagalan database tidak menampilkan sukses; user dapat mencoba lagi.
- [ ] ID invalid ditolak; ID di luar user aktif tidak dapat dibaca/diubah.
- [ ] Aksi lama tetap terlihat dalam riwayat tetapi tidak dapat diselesaikan mundur.

### M3 — Progress and feedback

- [ ] Dashboard menunjukkan selesai/total hari ini dan total selesai sepanjang waktu.
- [ ] History menunjukkan minggu Senin–Minggu dalam Asia/Jakarta: hitungan harian, selesai/total minggu, kategori, dan daftar aksi minggu tersebut.
- [ ] Hari tanpa aksi bukan kegagalan; persentase tanpa denominator ditampilkan sebagai belum ada aksi, bukan NaN atau 100%.
- [ ] Hitungan kategori selesai dijumlahkan menjadi total selesai minggu tersebut.
- [ ] Completion memperbarui progress; angka berasal dari PostgreSQL, bukan jawaban AI.
- [ ] Feedback AI terdiri dari 1–3 kalimat relevan terhadap ringkasan aktual dan satu saran sederhana.
- [ ] Feedback lama tidak ditampilkan sebagai feedback terbaru setelah data berubah.
- [ ] Jika AI gagal, feedback berbasis aturan diberi label cadangan; tracking tetap berfungsi.
- [ ] Tidak ada klaim angka emisi atau dampak terukur yang tidak didukung data.

### Q1 — Demo readiness

- [ ] Dashboard dan history dapat digunakan pada layar 360 px tanpa overflow horizontal.
- [ ] Loading, empty, error, success, disabled, dan validation tersedia pada interaksi terkait.
- [ ] Keyboard dapat mengakses CTA; status dapat dipahami tanpa mengandalkan warna.
- [ ] Build lulus; deployment terhubung ke database dan AI dengan secrets hanya di server.
- [ ] Alur rekomendasi AI atau kurasi → simpan → selesai → progress → feedback AI atau aturan berhasil didemokan, termasuk ketika Gemini tidak tersedia.
- [ ] Fallback diuji terpisah dan tidak diklaim sebagai keberhasilan integrasi AI.

## 10. Success Condition

Layak demo ketika semua acceptance criteria P0 di atas lulus, kedua halaman berjalan di deployment, dan flow utama dapat diperagakan ulang setelah refresh. Demo menggunakan identitas sintetis, tanpa data pribadi pelajar. AI adalah enhancement sesuai instruksi terbaru user. Demo core boleh lulus dengan fallback berlabel; keberhasilan AI nyata dicatat terpisah dan tidak menjadi syarat kelulusan core.

Keberhasilan hackathon ini menunjukkan workflow bekerja; belum membuktikan perubahan kebiasaan jangka panjang.

## 11. Assumptions

- **A1:** rencana memakai anggaran sementara 6 jam efektif; durasi belum dikonfirmasi.
- **A2:** satu seeded demo user, tanpa login; akses demo dikendalikan oleh tim. Bukan deployment publik multiuser.
- **A3:** tiga aksi per hari, satu batch per user/tanggal, tanpa regenerate atau edit.
- **A4:** tanggal menggunakan Asia/Jakarta; minggu Senin–Minggu. Completion hanya untuk tanggal hari ini.
- **A5:** riwayat MVP dibatasi minggu berjalan; total selesai tetap sepanjang waktu.
- **A6:** feedback diminta melalui tombol dan tidak disimpan; tidak otomatis memanggil AI pada setiap refresh.
- **A7:** hosting Vercel, database Supabase (PostgreSQL), dan provider Google Gemini API sesuai pilihan user; koneksi database diverifikasi pada Phase 0; akses hosting diperiksa sebelum deployment, dan verifikasi AI tidak memblokir core.
- **A8:** tidak ada optional challenge tambahan yang wajib. Bahasa UI Indonesia.

## 12. Open Questions

Tidak ada pertanyaan yang menghalangi penulisan dokumen.

- Apakah aturan resmi mewajibkan authentication, provider tertentu, atau AI agent? Jika ya, evaluasi scope sebelum implementasi.
- Berapa durasi efektif aktual? Sesuaikan timebox dan buang P1/P2 terlebih dahulu.
- Apakah akses Vercel, koneksi Supabase, model Gemini, dan credentials sudah tersedia? Wajib ditentukan pada Phase 0 sebelum integrasi terkait.
- Adakah screenshot/link screen Mobbin yang bisa diakses? Analisis referensi nyata masih tertunda; baseline desain sementara tetap dapat digunakan.

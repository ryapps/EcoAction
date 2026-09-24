# Hackathon Risks

Probabilitas merupakan penilaian perencanaan, bukan data terukur.

| Risk | Impact | Probability | Mitigation |
| ---- | ------ | ----------- | ---------- |
| Durasi/aturan resmi belum jelas, scope bertambah | P0 gagal selesai atau hasil tidak memenuhi lomba | Sedang | Pakai asumsi 6 jam; verifikasi aturan Phase 0; buang P1/P2 dahulu; jangan otomatis menambah auth/agent |
| Setup hosting atau deployment gagal | Demo tidak dapat diakses | Sedang | Cek akun/host Phase 0; deploy sebelum polish; simpan env dan langkah migration; smoke test deployment |
| Koneksi PostgreSQL/pooling/migration bermasalah | Aksi tidak tersimpan | Sedang | Buktikan read/write lebih awal; driver kompatibel host; migration versioned; jangan seed per request |
| AI key, rate limit, latency, output tidak valid | Rekomendasi/feedback gagal atau menyesatkan | Tinggi | AI sebagai enhancement; maksimal tiga percobaan total termasuk model cadangan dalam deadline 10 detik; validasi dan fallback berlabel; buktikan core tetap bekerja ketika AI gagal |
| Double request atau kalender tidak konsisten | Duplicate batch/progress salah | Sedang | Lock user + transaction/recheck; completion idempotent; Asia/Jakarta server; uji concurrency dan pergantian hari |
| Data/UI/feedback tidak sinkron | User melihat angka atau saran lama | Sedang | Refresh kedua halaman; agregasi konsisten; snapshotKey dan buang feedback stale; uji delayed response |
| Demo tanpa login dianggap siap multiuser | Data bercampur dan biaya API disalahgunakan | Sedang | Identitas sintetis; demo terkendali; jelaskan shared identity; scope auth sebelum penggunaan personal/publik |
| Referensi Mobbin tak tersedia dan polish menyita waktu | Desain rekaan atau core terlambat | Tinggi | Catat referensi pending; gunakan baseline utilitarian dari brief; jangan mengarang screen; timebox P1/P2 dan freeze H-60 |

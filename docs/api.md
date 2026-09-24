# Backend Interface

Interface konseptual untuk Next.js Server Actions dan server-only reads; nama di bawah bukan HTTP routes. Tidak membuat REST API duplikat.

## Shared Contract

- Demo tanpa login; user ditentukan server dari DEMO_USER_ID. Client tidak mengirim user_id, tanggal, status baru, prompt bebas, atau statistik.
- Tanggal kalender YYYY-MM-DD menggunakan Asia/Jakarta. Semua operasi memeriksa seeded user tersedia.
- Success: ok=true dan data. Failure: ok=false dan error berisi code, message aman, retryable.
- Action DTO: id, title, category, status, actionDate. user_id/email tidak perlu dikirim ke UI.
- category: energy | waste | transport | food. status: todo | completed.
- Common errors: DEMO_USER_MISSING, DB_UNAVAILABLE. Client network error ditangani UI; bukan response server yang dijamin diterima.
- Pembacaan yang gagal tidak diterjemahkan menjadi data kosong atau angka nol.
- Refresh/revalidasi dashboard dan history setelah mutasi sukses.
- Feedback disertai snapshotKey; UI membuang response yang tidak lagi sesuai snapshot data aktif.

## SERVER ACTION generateDailyActions()

**Purpose:** membuat atau mengembalikan satu batch aksi hari ini.
**Authentication:** identitas demo server; bukan autentikasi personal.
**Request:** tanpa argumen.
**Validation:** user tersedia; tanggal server; output tepat tiga title berbeda setelah trim/case-fold, panjang 1–160, kategori valid, sesuai batas konten.
**Response:** today, actions[3], source (ai | fallback | existing), notice opsional.
**Behavior:**
1. Jika batch hari ini tersedia, return existing tanpa request AI.
2. Jika kosong, coba AI di luar transaction dengan kebijakan retry terbatas di bawah; bila tidak tersedia atau output invalid, gunakan tepat tiga aksi kurasi tervalidasi.
3. Transaction lock row user, pastikan tanggal belum berubah, dan recheck existing.
4. Return existing bila request lain lebih dulu menyimpan; selain itu insert tiga row todo secara atomik.
5. Batch parsial bukan empty state; kembalikan DATA_INTEGRITY.
**Errors:** common errors, DAY_CHANGED (refresh), DATA_INTEGRITY (perbaikan tim). Kegagalan AI menghasilkan success fallback hanya jika penyimpanan berhasil.
**Related feature:** M1; dashboard.

## SERVER READ getTodayActions()

**Purpose:** memuat aksi hari ini tanpa efek samping.
**Authentication:** identitas demo server.
**Request:** tanpa argumen.
**Validation:** user dan tanggal server.
**Response:** today, actions[]; panjang valid 0 atau 3, urutan created_at lalu id.
**Errors:** common errors, DATA_INTEGRITY.
**Related feature:** M1/M2; dashboard.
Tidak memanggil AI, tidak menyimpan data, dan tidak mengklaim source AI untuk data existing.

## SERVER ACTION completeAction(actionId)

**Purpose:** mengubah satu aksi hari ini menjadi completed secara idempotent.
**Authentication:** identitas demo server; query wajib scoped user.
**Request:** actionId berbentuk UUID.
**Validation:** UUID valid; row milik user aktif; actionDate sama dengan today.
**Response:** action dengan status completed.
**Behavior:** update hanya todo; aksi hari ini yang sudah completed tetap sukses tanpa penambahan record. Aksi tanggal lama menghasilkan ACTION_EXPIRED, termasuk bila sebelumnya completed. Tidak menerima undo atau arbitrary status.
**Errors:** common errors, INVALID_INPUT, NOT_FOUND (termasuk owner mismatch), ACTION_EXPIRED.
**Related feature:** M2; dashboard dan refresh progress.

## SERVER READ getProgress()

**Purpose:** menghitung progress dan menyediakan riwayat minggu berjalan.
**Authentication:** identitas demo server.
**Request:** tanpa argumen; tidak ada filter tanggal/kategori dari client.
**Validation:** user aktif, batas kalender server.
**Response:**
- today: date, total, completed.
- allTimeCompleted: integer nonnegatif.
- weekStart, weekEnd: Senin–Minggu.
- weeklyTotal, weeklyCompleted: integer, sampai today.
- completionRate: integer 0–100 atau null jika weeklyTotal=0.
- byDay: tujuh objek date, total, completed, isFuture.
- byCategory: energy, waste, transport, food; masing-masing hitungan completed minggu ini.
- weekActions: Action DTO ditambah actionDate; tanggal menurun, created_at/id stabil; hanya sampai today.
- snapshotKey: fingerprint tanggal dan ID/status dari konteks feedback.
**Behavior:** gunakan snapshot pembacaan database konsisten. byDay masa depan memiliki hitungan 0 dan isFuture=true; UI menampilkan “—”. Sum byCategory = weeklyCompleted. Tidak ada target 21 aksi atau estimasi emisi.
**Errors:** common errors.
**Related feature:** M3; dashboard/history.

## SERVER ACTION generateFeedback()

**Purpose:** memberikan feedback berdasarkan data terbaru.
**Authentication:** identitas demo server.
**Request:** tanpa argumen.
**Validation:** baca agregasi server; output 1–3 kalimat, maksimal 500 karakter, satu saran, tanpa angka dampak rekaan.
**Response:** message, source (ai | fallback), snapshotKey.
**Behavior:** baca ringkasan konsisten dan judul aktivitas tujuh hari terakhir; tanpa nama/email. Jika aktivitas kosong, sarankan mulai satu aksi tanpa mengklaim pencapaian. AI mengikuti kebijakan retry terbatas di bawah; kegagalan akhirnya memakai template statis berbasis angka database aktual, bukan angka rekaan. Tidak menyimpan feedback.
**Errors:** common errors; provider failure pulih menjadi fallback. Jika database gagal, jangan membuat feedback personal palsu.
**Related feature:** M3; FeedbackPanel.
Completion/pergantian tanggal membatalkan feedback lama; response in-flight yang snapshot-nya stale dibuang.

## Error Codes and Recovery

| Code | Retryable | Recovery |
| --- | --- | --- |
| INVALID_INPUT | tidak | refresh daftar / perbaiki caller |
| NOT_FOUND | tidak | refresh daftar |
| ACTION_EXPIRED | tidak | buka aksi hari ini |
| DAY_CHANGED | ya, setelah refresh | muat tanggal baru lalu minta aksi |
| DB_UNAVAILABLE | ya | retry manual |
| DEMO_USER_MISSING | tidak | tim memperbaiki env/seed |
| DATA_INTEGRITY | tidak | tim memeriksa batch/migration |

Tidak menggunakan HTTP 401/403 palsu untuk mode tanpa auth. Owner mismatch selalu NOT_FOUND; jika authentication ditambahkan lewat perubahan scope, kontrak sesi harus direvisi dahulu.

## Kebijakan AI sebagai enhancement

Maksimal tiga percobaan total (termasuk request awal dan satu model cadangan Gemini), seluruhnya dalam deadline 10 detik. Retry hanya kegagalan sementara (network/429/5xx) dengan jeda singkat; hormati Retry-After bila masih muat dalam deadline. Error permanen tidak diulang pada model yang sama; bila waktu habis, key/model tidak tersedia, atau output tidak valid, langsung gunakan fallback tervalidasi berlabel. Tidak ada retry background atau retry berulang pada refresh.

Completion dan getProgress tidak memanggil AI. Fallback rekomendasi masuk jalur lock/recheck/insert atomik yang sama; tidak menahan lock selama AI/retry. Feedback statis tetap memakai snapshotKey dan source=fallback. Kegagalan database tetap error, bukan sukses fallback.

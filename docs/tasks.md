# Development Tasks

Status awal: semua task implementasi belum dikerjakan. Dokumen sudah dibuat tidak berarti aplikasi sudah diinisialisasi.

**ASSUMPTION:** 6 jam efektif = target P0 260 menit + buffer 100 menit. Estimasi bukan jaminan; bila task melewati 30 menit, pecah berdasarkan hasil yang bisa diverifikasi. [P0] wajib, [P1] setelah core, [P2] bonus. Requirement IDs mengacu PRD.

## Phase 0 — Project Setup

Timebox P0: 25 menit.

- [ ] **T00 [P0] Pastikan jalur demo dan layanan tersedia — 10 menit.** Goal: pilih satu host, PostgreSQL, provider/model AI, cek credentials/aturan/durasi, catat pilihan aktual di decisions.md. Dependency: dokumen dibaca. Definition of Done: keputusan layanan jelas, akun dapat diakses, asumsi demo tidak bertentangan dengan aturan yang diketahui. Trace: Q1.
- [x] **T01 [P0] Jalankan fondasi aplikasi lokal — 15 menit.** Goal: inisialisasi Next.js JavaScript, Tailwind/shadcn seperlunya, contoh env tanpa secret, repository lokal dan first commit bila Git tersedia. Dependency: pilihan stack dan koneksi database pada T00 tersedia; akses hosting/AI bukan blocker lokal (Decision 013). Definition of Done: halaman awal lokal tampil, lockfile tersimpan, secrets diabaikan Git, build awal lulus; remote repo dihubungkan hanya bila sudah tersedia. Trace: Q1.

**Definition of Done:** setup dapat dijalankan ulang dan tidak ada blocker credentials yang disembunyikan. Tidak membuat UI bonus.

## Phase 1 — Foundation

Timebox P0: 25 menit.

- [ ] **T02 [P0] Buktikan persistence untuk user demo — 15 menit.** Goal: koneksi, migration dua entity/constraint/index, seed idempotent sintetis. Dependency: T01. Definition of Done: seed dua kali tetap satu user; read/write tervalidasi tanpa data pribadi. Trace: M1/M2/Q1.
- [ ] **T03 [P0] Tetapkan kalender dan ownership server — 10 menit.** Goal: user aktif dan tanggal Asia/Jakarta dipakai semua operasi. Dependency: T02. Definition of Done: client tidak memilih user/tanggal; batas Minggu–Senin dan tengah malam diperiksa; fixture uji terpisah dari demo. Trace: M1/M2/M3.

**Definition of Done:** database nyata siap untuk vertical slice, bukan storage mock.

## Phase 2 — Core Feature 1: Daily Eco Action

Timebox P0: 45 menit.

- [ ] **T04 [P0] Hasilkan rekomendasi AI tervalidasi — 15 menit.** Goal: tiga aksi melalui Gemini bila tersedia, atau kurasi; retry/model cadangan terbatas dan fallback. Dependency: T03. Definition of Done: validasi, deadline total 10 detik, maksimal tiga percobaan termasuk model cadangan, dan fallback diuji; error provider tidak memblokir batch; tanpa nama/email dikirim. Keberhasilan AI nyata dicatat terpisah. Trace: M1.
- [ ] **T05 [P0] Simpan satu batch harian secara aman — 15 menit.** Goal: existing read, lock/recheck, insert atomik, handling tanggal berubah. Dependency: T04. Definition of Done: request paralel menyimpan tiga row saja; retry tidak menambah batch; kegagalan insert rollback. Trace: M1.
- [ ] **T06 [P0] Tampilkan aksi dari database — 15 menit.** Goal: dashboard empty → generate → list. Dependency: T05. Definition of Done: refresh menampilkan batch sama; pending/error/retry dasar ada; source fallback jujur. Trace: M1/Q1.

**Definition of Done:** rekomendasi AI/kurasi → PostgreSQL → dashboard berjalan nyata, termasuk saat Gemini gagal.

## Phase 3 — Core Feature 2: Tracker

Timebox P0: 25 menit.

- [ ] **T07 [P0] Selesaikan aksi secara idempotent — 15 menit.** Goal: completeAction dan validasi ownership/tanggal. Dependency: T06. Definition of Done: klik ganda tetap satu completion; ID invalid, owner lain, dan aksi lama ditolak sesuai kontrak. Trace: M2.
- [ ] **T08 [P0] Hubungkan completion ke UI — 10 menit.** Goal: status pending/sukses/gagal dan refresh data. Dependency: T07. Definition of Done: status persisten setelah refresh; DB failure tidak menampilkan sukses. Trace: M2/Q1.

**Definition of Done:** aksi nyata dapat dicatat tanpa duplicate counting.

## Phase 4 — Integration: Progress & AI Feedback

Timebox P0: 45 menit.

- [ ] **T09 [P0] Hitung progress dan riwayat dari database — 15 menit.** Goal: getProgress sesuai definisi kalender/denominator. Dependency: T08. Definition of Done: total, kategori, tujuh hari, empty denominator, lintas minggu cocok dengan fixture; pembacaan konsisten. Trace: M3.
- [ ] **T10 [P0] Sajikan history dan ringkasan dashboard — 15 menit.** Goal: kedua halaman membaca data yang sama. Dependency: T09. Definition of Done: completion memperbarui ringkasan/history; tanggal dan status jelas; tanpa fake metrics. Trace: M3/Q1.
- [ ] **T11 [P0] Hubungkan feedback AI pada data aktual — 15 menit.** Goal: feedback manual, fallback, snapshot invalidation. Dependency: T09/T10/T04. Definition of Done: feedback AI atau template berlabel memberi 1–3 kalimat; zero activity tidak dipuji palsu; stale response dibuang setelah completion; fallback berlabel. Trace: M3.

**Definition of Done:** recommendation → action → tracking → progress → feedback berjalan end-to-end.

## Phase 5 — UX & Edge Cases

Timebox P0: 25 menit.

- [ ] **T12 [P0] Lengkapi state dan recovery core — 15 menit.** Goal: seluruh state design.md mendukung flow. Dependency: T11. Definition of Done: network/DB/AI error, expired action, all completed, empty week, dan retry diperiksa; tidak ada endless loading. Trace: M1/M2/M3/Q1.
- [ ] **T13 [P0] Pastikan kedua halaman usable di mobile — 10 menit.** Goal: hierarchy, focus, label, dan target sentuh. Dependency: T12. Definition of Done: 360 px tanpa overflow; keyboard dapat menjalankan flow; status tidak hanya warna. Trace: Q1.
- [ ] **T14 [P1] Rapikan microcopy dan aksesibilitas lanjutan — maksimal 15 menit dari buffer.** Goal: perbaiki clarity pada flow existing. Dependency: seluruh P0 termasuk deployment lulus. Definition of Done: tidak ada fitur/pola visual baru; kontras dan urutan fokus diperiksa ulang. Trace: Should Have/Q1.

**Definition of Done:** UI sederhana dapat dipakai dan dipulihkan ketika gagal; polish tidak menghalangi deploy.

## Phase 6 — Deployment

Timebox P0: 30 menit.

- [ ] **T15 [P0] Jalankan MVP pada host pilihan — 20 menit.** Goal: env server, migration/seed, build dan deploy. Dependency: T11; kerjakan sebelum polish bila waktu ketat. Definition of Done: URL demo berjalan dan PostgreSQL nyata tersambung; tidak ada secret client; akses sesuai demo terkendali. Trace: Q1.
- [ ] **T16 [P0] Smoke test deployment — 10 menit.** Goal: buktikan seluruh integrasi di host, bukan hanya lokal. Dependency: T15/T13. Definition of Done: rekomendasi AI/kurasi → save → completion → refresh → history → feedback AI/aturan; core lulus saat AI tidak tersedia; keberhasilan AI nyata dilaporkan terpisah. Trace: M1/M2/M3/Q1.

**Definition of Done:** demo dapat diakses dengan data sintetis dan tidak bergantung pada server development lokal.

## Phase 7 — Optional Bonus

Tidak memiliki alokasi P0.

- [ ] **T17 [P2] Uji kegunaan singkat — maksimal 10 menit dari buffer.** Goal: satu rekan mencoba memahami aksi dan progress. Dependency: semua P0 lulus, waktu >60 menit. Definition of Done: masalah clarity dicatat; hanya perbaikan kecil terkait requirement, tanpa fitur baru. Trace: Could Have.

**Definition of Done:** bonus tidak mengubah schema, arsitektur, atau scope. Referensi Mobbin dapat dilengkapi jika tersedia; jangan mengarang jika belum ada.

## Phase 8 — Final Verification

Timebox P0: 40 menit; dilakukan sebelum optional bila waktu terbatas.

- [ ] **T18 [P0] Audit acceptance criteria dan regression inti — 20 menit.** Goal: cek M1–M3/Q1 dengan bukti singkat. Dependency: T16. Definition of Done: build lulus; reload persistence, parallel generation, retry completion, scope ID, timezone rollover, empty progress, dan stale feedback lulus; kegagalan aktual diperbaiki. Trace: M1/M2/M3/Q1.
- [ ] **T19 [P0] Siapkan skenario demo dan handoff — 20 menit.** Goal: alur presentasi repeatable, konfigurasi/keputusan aktual tercatat. Dependency: T18. Definition of Done: demo sintetis siap; README singkat pada tahap implementasi menjelaskan run/env/migration/deploy; tasks ditandai hanya dengan bukti; keterbatasan single user/Mobbin dicatat. Trace: Q1.

**Definition of Done:** seluruh P0 selesai berdasarkan hasil verifikasi, bukan sekadar code ditulis.

## STOP CONDITIONS

- Jika core belum end-to-end: jangan mengerjakan P1/P2.
- Jika database belum tersedia: tuntaskan blocker persistence. Jika AI tidak tersedia: lanjutkan core dengan fallback berlabel; jangan mengejar 503 berulang atau mengklaim integrasi AI nyata berhasil.
- Jika deployment gagal: hentikan polish dan perbaiki deployment.
- Jika sisa waktu <60 menit: feature freeze; hanya bug core, deploy, dan final verification.
- Jika task melewati 30 menit: pecah berdasarkan outcome; jangan membuat abstraction untuk menyamarkan blocker.
- Jika aturan resmi mewajibkan auth/agent: revisi PRD/design/tasks sebelum coding perubahan tersebut.
- Jika screen Mobbin tidak tersedia: lanjutkan baseline yang terdokumentasi dan pertahankan status referensi pending.
- Tidak ada reset database destructive sebagai langkah demo rutin.

## Requirement Traceability

| Requirement | Tasks |
| --- | --- |
| M1 — daily actions | T02–T06, T12, T16, T18 |
| M2 — tracker | T02–T03, T07–T08, T12, T16, T18 |
| M3 — progress/feedback | T03, T09–T12, T16, T18 |
| Q1 — usable, deployed demo | T00–T03, T06, T08, T10, T12–T13, T15–T16, T18–T19 |

Semua task P0 memiliki Trace; P1/P2 hanya kualitas workflow existing. Timebox P0 total 260 menit, buffer 100 menit.

## Status T00 terkini

Pilihan user: Vercel, Supabase hosted PostgreSQL, dan Google Gemini API. DATABASE_URL runtime dan MIGRATION_DATABASE_URL (port 5432) sudah lulus SELECT 1 dengan CA prod-ca-2021.crt dan verifikasi TLS aktif. Role migration memiliki izin CREATE pada schema public; belum ada migration/seed atau perubahan data.

T00 tetap partial dan unchecked: uji generasi Gemini terbaru masih gagal 503 UNAVAILABLE pada kandidat gemini-3.8-flash; AI_MODEL belum dikonfigurasi. Akses project Vercel juga belum terverifikasi. T01 dapat dimulai berdasarkan Decision 013; akses Vercel wajib sebelum T15, sementara kegagalan Gemini bukan blocker core. Catatan berikut merupakan riwayat pemeriksaan; status terkini pada bagian ini menggantikan blocker database lama yang sudah terselesaikan.
### Hasil verifikasi credentials T00 terbaru

- AI_API_KEY berhasil mengakses daftar model OpenAI; gpt-4.1-mini tersedia sebagai kandidat, tetapi AI_MODEL belum diisi.
- Uji generasi singkat melalui Responses API gagal: HTTP 429, code credit_balance_exhausted. Akses daftar model tidak membuktikan saldo/inference tersedia. Model belum ditetapkan sebagai integrasi yang lulus.
- DATABASE_URL terisi tetapi protokolnya bukan postgres/postgresql, port bukan transaction pooler, dan tidak memiliki password pada URL. Nilai tidak ditampilkan; koneksi SQL belum berhasil. Ganti dengan connection string dari Supabase Connect > Transaction pooler, bukan project/API URL.
- MIGRATION_DATABASE_URL belum tersedia. Publishable key yang ada bukan pengganti connection string SQL server-side.
- Pemeriksaan SQL memakai driver pg di direktori sementara; tidak menambah dependency aplikasi atau mengubah data database.
- T00 tetap unchecked. Diperlukan perbaikan connection string Supabase dan saldo/kredit API OpenAI sebelum uji ulang; akses project Vercel masih belum terverifikasi.

### Uji ulang T00 setelah pembaruan .env

- DATABASE_URL sekarang valid sebagai URI PostgreSQL menuju host Supabase transaction pooler (port 6543). Nilai credentials tidak ditampilkan.
- Koneksi SELECT 1 gagal dengan SELF_SIGNED_CERT_IN_CHAIN, termasuk setelah memakai trust store sistem Node (--use-system-ca). Verifikasi TLS tetap aktif; diperlukan CA yang benar untuk rantai sertifikat koneksi tersebut. Belum dapat menyimpulkan password database valid karena handshake TLS belum selesai.
- MIGRATION_DATABASE_URL masih belum tersedia.
- Uji Responses API dengan kandidat gpt-4.1-mini masih gagal HTTP 429 / credit_balance_exhausted. AI_MODEL belum dikonfigurasi.
- T00 tetap partial dan unchecked; belum ada perubahan data atau implementasi aplikasi. Langkah berikutnya: sediakan sertifikat CA database dari dashboard Supabase (atau CA jaringan jika koneksi diintersepsi), connection string migration, serta perbaiki saldo/key proyek OpenAI yang dipakai .env.

Status terbaru AI T00: provider diganti ke Google Gemini API. Daftar model berhasil (200), tetapi uji generasi gemini-2.5-flash-lite gagal 404 NOT_FOUND dan gemini-3.8-flash gagal 503 UNAVAILABLE. Model belum terverifikasi; T00 tetap unchecked. Error saldo OpenAI sebelumnya merupakan riwayat provider lama. Kendala TLS Supabase dan konfigurasi migration terakhir belum terselesaikan. Lihat Decision 012.

Pembaruan terbaru Supabase: SELECT 1 melalui DATABASE_URL berhasil dengan prod-ca-2021.crt dan verifikasi TLS aktif. Kendala sertifikat lokal terselesaikan. MIGRATION_DATABASE_URL masih belum tersedia; migration/write dan koneksi dari Vercel belum diuji. Generasi Gemini dan akses project Vercel tetap belum terverifikasi; T00 tetap partial. Lihat hasil verifikasi CA di decisions.md.

### Verifikasi koneksi migration terbaru

- MIGRATION_DATABASE_URL tersedia dan memakai port 5432 (jalur direct/session, bukan transaction pooler).
- SELECT 1 berhasil dengan CA prod-ca-2021.crt dan rejectUnauthorized: true. Pemeriksaan has_schema_privilege mengonfirmasi role koneksi memiliki izin CREATE pada schema public.
- Pemeriksaan hanya read-only; belum menjalankan migration, seed, atau perubahan data. DATABASE_URL runtime sebelumnya juga telah lulus SELECT 1 dengan CA yang sama.
- Uji ulang Gemini menggunakan kandidat gemini-3.8-flash masih gagal HTTP 503 UNAVAILABLE; AI_MODEL belum dikonfigurasi. Belum ada model yang lulus generasi nyata.
- T00 tetap partial: koneksi database lokal terverifikasi; generasi Gemini dan akses project Vercel masih belum terverifikasi.
## Bukti T01 selesai

Next.js 16.3.6 + React 19.3.0 + Tailwind 4.3.3, JavaScript App Router, halaman awal utilitarian, .env.example tanpa secret, lockfile, README, dan Git lokal tersedia. npm run build lulus. Agent-browser membuka halaman tanpa error; screenshot artifacts/t01-mobile.png ditinjau, scrollWidth dan innerWidth sama-sama 360 px. .env terkonfirmasi diabaikan Git. Tidak ada integrasi database/AI atau fitur T02+ yang diklaim selesai. Task berikutnya T02: migration dua entity dan seed idempotent.

# Technical Decisions

Keputusan mengikuti brief user. ASSUMPTION dapat direvisi bila aturan resmi berbeda; jangan menganggap asumsi sebagai requirement penyelenggara.

## Decision 001 — Full-stack monolith

**Context:** waktu development terbatas dan hanya tiga fitur.
**Options considered:** Next.js monolith; frontend/backend terpisah.
**Decision:** Next.js + JavaScript; UI → server logic → PostgreSQL / AI → UI.
**Reason:** sesuai arsitektur yang sudah dipilih user.
**Trade-off:** coupling aplikasi lebih tinggi.
**Impact:** tanpa service/repository/controller layers, Redis, WebSocket, atau microservices.

## Decision 002 — PostgreSQL with direct queries

**Context:** aksi harus persisten dan agregasi harus akurat.
**Options considered:** PostgreSQL dengan query langsung; ORM tambahan; local-only storage.
**Decision:** Supabase hosted PostgreSQL, satu driver yang sesuai host, SQL parameterized, migration dan seed terkendali. Lihat Decision 011.
**Reason:** database sudah ditetapkan; model hanya users dan actions.
**Trade-off:** migration/query ditulis secara eksplisit.
**Impact:** constraints di database; tidak menambah ORM jika driver sederhana mencukupi.

## Decision 003 — Server Actions and server reads

**Context:** hanya satu frontend internal.
**Options considered:** Server Actions; REST API terpisah.
**Decision:** mutasi/generation via Server Actions; read helpers server-only.
**Reason:** mengurangi wiring dan interface duplikat.
**Trade-off:** bukan API publik independen.
**Impact:** docs/api.md menjelaskan kontrak operasi, bukan routes REST.

## Decision 004 — Seeded demo identity

**Context:** authentication tidak ditentukan sebagai MVP.
**Options considered:** seeded single user; anonymous cookie per user; login provider.
**Decision:** ASSUMPTION satu user sintetis dari konfigurasi server, tanpa login.
**Reason:** mempercepat core workflow tanpa menambah lifecycle session.
**Trade-off:** semua pengunjung berbagi data; bukan isolasi multiuser.
**Impact:** semua query tetap owner-scoped; demo terkendali, tanpa data pribadi. Kebutuhan auth resmi membuka kembali keputusan ini.

## Decision 005 — One atomic daily batch

**Context:** refresh/retry/concurrent request tidak boleh menggandakan rekomendasi.
**Options considered:** append setiap request; entity daily_batches; lock user dan recheck.
**Decision:** ASSUMPTION tiga aksi per user/tanggal; AI di luar transaction; lock row user, recheck, atomic insert.
**Reason:** mempertahankan dua entity sekaligus mencegah duplicate batch.
**Trade-off:** tanpa regenerate; concurrency dapat membuat dua request AI sebelum persistence diserialisasi.
**Impact:** semua jalur generation memakai transaction yang sama; unique title hanya backstop. Data parsial menghasilkan DATA_INTEGRITY.

## Decision 006 — Calendar semantics and limited history

**Context:** minimum model tidak memiliki completed_at.
**Options considered:** timestamp completion tambahan; grouping berdasarkan action_date.
**Decision:** ASSUMPTION Asia/Jakarta, minggu Senin–Minggu, completion hari ini saja, riwayat minggu berjalan.
**Reason:** progress dapat dihitung dari model yang disepakati.
**Trade-off:** tidak ada backfill completion, audit waktu, atau browsing minggu lama.
**Impact:** label angka sesuai tanggal aksi; denominator hanya aksi tersimpan; total sepanjang waktu tetap tersedia.

## Decision 007 — Bounded AI with honest fallback

**Context:** AI wajib memberi rekomendasi dan feedback, tetapi provider dapat gagal.
**Options considered:** satu provider; router multiprovider; static-only.
**Decision:** provider Google Gemini API dipilih user (Decision 012); model spesifik ditentukan Phase 0 berdasarkan akses nyata; output tervalidasi, timeout 10 detik, fallback kurasi/aturan.
**Reason:** menjaga fungsi AI dan keandalan tanpa orchestration tambahan.
**Trade-off:** personalisasi terbatas; fallback bukan hasil AI.
**Impact:** API key server-only; feedback ephemeral, manual, snapshot-aware; source fallback terlihat. Provider Google Gemini API sudah dipilih user; model spesifik dan akses API belum diverifikasi.

## Decision 008 — Server-rendered data and restrained UI

**Context:** dua halaman dengan interaksi sederhana.
**Options considered:** server-rendered reads dan client islands; SPA/global store; dashboard cards/chart.
**Decision:** server reads; client interaction hanya saat perlu; daftar aksi dan progress teks, Tailwind + shadcn/ui.
**Reason:** dependency dan state lebih sedikit.
**Trade-off:** UI lebih sederhana dan tanpa eksplorasi analitik.
**Impact:** refresh setelah mutation, tanpa optimistic success; tidak perlu chart library/global state. Mobbin screen belum terverifikasi; baseline sementara mengikuti brief dan harus diberi status jujur.

## Pemeriksaan T00 — 24 September 2026 (belum selesai)

- Dokumen PRD, design, tasks, decisions, dan risks telah dibaca.
- Workspace saat pemeriksaan hanya berisi AGENTS.md dan dokumen docs; belum ada aplikasi, lockfile, maupun repository Git.
- Node.js, npm, dan Git tersedia; Vercel CLI dan psql tidak ditemukan pada PATH. Ketiadaan CLI bukan bukti akun layanan tidak tersedia.
- Tidak ditemukan file `.env` di root proyek. Variabel DATABASE_URL, AI_API_KEY, AI_MODEL, DEMO_USER_ID, OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_API_KEY, GEMINI_API_KEY, dan VERCEL_TOKEN tidak ditemukan pada environment proses; nilai secret tidak dicetak. Pemeriksaan ini tidak menyimpulkan ketiadaan credentials di luar workspace/environment tersebut.
- Hosting, PostgreSQL, dan provider/model AI belum dipilih atau diuji. Informasi layanan serta aksesnya diminta kepada user, bersama informasi apakah aturan/durasi berbeda dari asumsi PRD.
- T00 tetap unchecked; T01 belum dimulai karena bergantung pada T00. Tidak ada klaim integrasi, build, atau deployment berhasil.

## Decision 009 — PostgreSQL Docker dan OpenAI API (database digantikan Decision 011)

**Context:** user menetapkan PostgreSQL melalui Docker dan AI melalui OpenAI API pada 24 September 2026.
**Decision:** gunakan PostgreSQL dalam Docker dan satu provider AI, OpenAI API. Model spesifik belum ditentukan; konfigurasi memakai AI_API_KEY dan AI_MODEL sesuai kontrak environment yang ada.
**Evidence:** Docker Engine 28.4.0 dan Compose v2.39.4-desktop.1 dapat diakses. Tidak ada container PostgreSQL pada daftar container saat pemeriksaan. Belum ada file .env atau variabel API key/model yang diperiksa pada environment proses.
**Trade-off:** jalur database Docker lokal tersedia, tetapi koneksi database dan akses AI nyata belum terbukti; host aplikasi dan lokasi Docker untuk deployment masih perlu ditentukan.
**Impact:** T00 tetap partial. Jangan menganggap Docker di komputer lokal otomatis dapat diakses host deployment. Pilihan managed PostgreSQL pada desain sebelumnya digantikan keputusan user ini. Tidak ada container/data existing yang diubah.

## Decision 010 — Hosting Vercel

**Context:** user memilih Vercel untuk hosting aplikasi.
**Decision:** deploy aplikasi Next.js ke Vercel; database Supabase sesuai Decision 011 dan AI melalui OpenAI API.
**Evidence:** file .env sekarang tersedia dengan AI_API_KEY terisi; nilainya tidak ditampilkan. AI_MODEL dan DATABASE_URL belum ditemukan dalam file tersebut. Pemeriksaan Vercel list_teams mengembalikan daftar kosong; akses project belum terverifikasi, bukan bukti user tidak memiliki akun.
**Open dependency:** koneksi Supabase dari Vercel belum diverifikasi. Model dan akses OpenAI nyata juga belum diuji. Pilihan Docker sebelumnya digantikan Decision 011.
**Impact:** T00 tetap partial dan unchecked. Dokumen desain diselaraskan. File .env dilindungi melalui .gitignore sebelum inisialisasi Git.

## Decision 011 — Supabase menggantikan PostgreSQL Docker

**Context:** user meminta beralih dari PostgreSQL ke Supabase. Supabase menyediakan PostgreSQL terkelola; keputusan ini menggantikan hosting database Docker pada Decision 009.
**Decision:** gunakan Supabase hosted PostgreSQL melalui query SQL server-side dengan satu driver PostgreSQL. Hosting aplikasi tetap Vercel dan provider AI tetap OpenAI API. Kontrak Server Actions, dua entity, ownership, dan transaction lock/recheck tetap berlaku.
**Reason:** mengikuti pilihan user sekaligus menyediakan jalur database terkelola untuk aplikasi Vercel. Tidak memerlukan Supabase Auth, Realtime, Storage, SDK tambahan, atau akses database langsung dari browser.
**Connection:** DATABASE_URL untuk transaction pooler runtime; MIGRATION_DATABASE_URL untuk direct connection atau session pooler sesuai jaringan. Semua credentials server-only. Transaction memakai satu koneksi; hindari named prepared statements pada transaction pooler. Akses Data API tidak diperlukan; saat provisioning nonaktifkan Data API atau batasi tabel agar tidak terbuka ke role anon/authenticated.
**Reference:** https://supabase.com/docs/guides/database/connecting-to-postgres
**Status:** pilihan layanan sudah jelas; project/koneksi Supabase belum diverifikasi. T00 tetap unchecked. Belum ada aplikasi atau database lama yang perlu dimigrasikan; perubahan ini menyelaraskan rencana, bukan klaim integrasi selesai.

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

## Decision 012 — Google Gemini API menggantikan OpenAI

**Context:** user mengganti AI_API_KEY di .env dengan key Gemini.
**Decision:** satu provider aktif Google Gemini API; nama environment tetap AI_API_KEY dan AI_MODEL. Keputusan ini menggantikan pilihan OpenAI pada Decision 007/009/010/011. Tidak memakai multiprovider router atau fallback ke OpenAI.
**Verification:** GET models berhasil HTTP 200. Uji generateContent gemini-2.5-flash-lite gagal HTTP 404 NOT_FOUND; gemini-3.8-flash gagal HTTP 503 UNAVAILABLE. Daftar model tidak membuktikan inference tersedia; belum ada model yang ditetapkan sebagai lulus uji. Semua request dibatasi 10 detik dan tidak menampilkan secret.
**Reference:** https://ai.google.dev/api/models dan https://ai.google.dev/api/generate-content
**Status:** belum ada implementasi aplikasi yang perlu dimigrasikan. T00 tetap partial. Kendala saldo OpenAI kini hanya riwayat provider lama. Kendala terakhir Supabase tetap SELF_SIGNED_CERT_IN_CHAIN dan MIGRATION_DATABASE_URL belum tersedia; keduanya tidak diuji ulang pada perubahan key Gemini ini.

### Verifikasi Supabase dengan CA dari user

- File prod-ca-2021.crt valid sebagai sertifikat CA, dengan rentang berlaku 28 April 2021 sampai 26 April 2031.
- SELECT 1 melalui DATABASE_URL berhasil menggunakan pg dengan ssl.ca dari file tersebut dan rejectUnauthorized: true. Kendala SELF_SIGNED_CERT_IN_CHAIN pada pemeriksaan sebelumnya terselesaikan untuk koneksi lokal yang diuji.
- Pada pemeriksaan, parameter sslmode/sslcert/sslkey/sslrootcert dihapus hanya dari salinan URL dalam memori agar tidak menimpa konfigurasi CA eksplisit. File .env tidak diubah dan verifikasi TLS tidak dinonaktifkan.
- MIGRATION_DATABASE_URL masih belum tersedia. Keberhasilan read-only ini belum membuktikan migration/write, deployment Vercel, atau integrasi aplikasi.
- Gunakan CA yang sama pada konfigurasi driver server saat implementasi dan pastikan file disertakan dalam deployment. T00 tetap partial karena konfigurasi migration, generasi Gemini, dan akses project Vercel belum terverifikasi.

### Verifikasi koneksi migration terbaru

- MIGRATION_DATABASE_URL tersedia dan memakai port 5432 (jalur direct/session, bukan transaction pooler).
- SELECT 1 berhasil dengan CA prod-ca-2021.crt dan rejectUnauthorized: true. Pemeriksaan has_schema_privilege mengonfirmasi role koneksi memiliki izin CREATE pada schema public.
- Pemeriksaan hanya read-only; belum menjalankan migration, seed, atau perubahan data. DATABASE_URL runtime sebelumnya juga telah lulus SELECT 1 dengan CA yang sama.
- Uji ulang Gemini menggunakan kandidat gemini-3.8-flash masih gagal HTTP 503 UNAVAILABLE; AI_MODEL belum dikonfigurasi. Belum ada model yang lulus generasi nyata.
- T00 tetap partial: koneksi database lokal terverifikasi; generasi Gemini dan akses project Vercel masih belum terverifikasi.

## Decision 013 — AI enhancement, core independen

**Context:** user memprioritaskan transaksi database dan progress yang tidak bergantung pada Gemini selama hackathon.
**Decision:** Maksimal tiga percobaan total (termasuk request awal dan satu model cadangan Gemini), seluruhnya dalam deadline 10 detik. Retry hanya kegagalan sementara (network/429/5xx) dengan jeda singkat; hormati Retry-After bila masih muat dalam deadline. Error permanen tidak diulang pada model yang sama; bila waktu habis, key/model tidak tersedia, atau output tidak valid, langsung gunakan fallback tervalidasi berlabel. Tidak ada retry background atau retry berulang pada refresh.
**Core:** completion, progress, ownership, idempotency, dan transaction berjalan sepenuhnya melalui database. Rekomendasi kurasi tetap disimpan atomik; feedback fallback adalah template dari snapshot database.
**Execution:** T01 boleh dimulai karena pilihan stack dan koneksi database sudah terverifikasi. T00 tetap partial untuk akses hosting; akses Vercel dituntaskan sebelum T15. Kegagalan Gemini bukan blocker development atau kelulusan demo core.
**Acceptance:** uji failure provider, batas waktu/percobaan, fallback berlabel, dan tidak ada AI dalam transaksi/completion/progress. AI nyata hanya diklaim jika terverifikasi.
**Status:** perubahan aturan dan acceptance criteria; belum ada kode aplikasi, retry runtime, atau fallback runtime yang diimplementasikan. Catatan historis yang menahan T01 karena AI digantikan keputusan ini.

## Decision 014 — Fondasi lokal T01

Next.js 16.3.6, React 19.3.0, dan Tailwind 4.3.3 dipin dengan package-lock.json; Node.js 24. Versi diambil dari npm registry dan build berhasil. System font sesuai desain; komponen shadcn ditunda hingga ada kebutuhan kontrol UI. .env dipertahankan dan diabaikan Git. Halaman awal tidak menampilkan angka atau aksi rekaan. Next.js menambahkan blok panduan agent otomatis pada AGENTS.md; aturan proyek tetap dipertahankan.

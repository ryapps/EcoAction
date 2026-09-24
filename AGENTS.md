# Agent Development Rules

## Source of Truth

Sebelum implementation, baca berurutan:

1. docs/prd.md
2. docs/design.md
3. docs/tasks.md
4. docs/decisions.md

Baca docs/api.md sebelum mengubah interface server dan docs/risks.md sebelum integrasi/deploy.

Jika konflik: PRD menentukan product requirement; Design menentukan implementation architecture; Tasks menentukan execution order; Decisions mencatat alasan keputusan. Perbaiki inkonsistensi sebelum implementasi terkait, tanpa memperluas scope. Asumsi boleh diperbarui jika ada bukti atau instruksi user baru; jangan menyatakan asumsi sebagai aturan resmi.

## Development Principles

- Optimize for working MVP; prefer simple solutions.
- Do not overengineer or introduce new architecture without justification.
- Do not add features outside PRD.
- Do not refactor unrelated code.
- Avoid unnecessary dependencies.
- Reuse existing patterns inside the current project.
- Keep changes small and reviewable.
- Gunakan Next.js + JavaScript, Tailwind + shadcn/ui, Supabase (PostgreSQL), dan satu AI API.
- Pertahankan UI → Server Action/server read → PostgreSQL / AI → UI.
- Jangan menambah repository/service/controller layers, microservices, Redis, WebSocket, global state library, atau agent framework tanpa kebutuhan requirement yang baru disetujui.

## Task Execution Protocol

Sebelum coding:

1. Baca task aktif dan dependency.
2. Pahami Definition of Done serta acceptance criteria terkait.
3. Identifikasi file yang perlu berubah.
4. Jelaskan pendekatan secara singkat.

Saat coding:

1. Kerjakan task aktif.
2. Jangan melompati future task atau dependency; setelah task selesai, task berikutnya dapat dipilih sesuai urutan.
3. Lakukan perubahan minimum.
4. Pertahankan arsitektur dan interface docs/api.md.

Setelah coding:

1. Jalankan validation/build/test yang relevan.
2. Cek acceptance criteria dan risiko terkait.
3. Laporkan perubahan serta hasil pemeriksaan secara jujur.
4. Tandai selesai hanya jika Definition of Done terpenuhi; partial/blocked tetap unchecked.
5. Sinkronkan dokumen jika implementasi mengungkap keputusan operasional yang berbeda.

## Scope Control

Improvement di luar task tidak langsung diimplementasikan. Catat rekomendasi/future task tanpa menjadikannya P0 otomatis.

MVP hanya daily actions, tracker, progress/AI feedback, dan kualitas demo pendukung. Jangan menambah fitur yang disebut Non-Goals. Tidak perlu membuat bonus baru.

## UI/UX Rules

UI implementation must follow the reference patterns and design principles documented in docs/design.md.

Do not introduce new visual patterns, layout systems, or component styles that conflict with the approved design direction.

Mobbin references are pattern references, not pixel-perfect targets.

Saat ini referensi screen Mobbin berstatus pending, sehingga baseline sementara adalah desain utilitarian yang tertulis. Jangan mengklaim sudah mempelajari screen yang belum diakses. Jika referensi nyata tersedia, dokumentasikan bukti dan adaptasinya sebelum mengubah pola.

Prioritaskan hierarchy → content → action → component. Gunakan list/whitespace, accent tunggal, dan status yang jelas. Jangan menambah cards, charts, animasi, atau metrics dekoratif.

## Error Fixing

1. Identifikasi root cause.
2. Perbaiki penyebab.
3. Jangan rewrite seluruh feature kecuali terbukti diperlukan.
4. Jelaskan perubahan dan verifikasi yang membuktikan perbaikan.

## Dependency Rules

Sebelum menambah dependency, pastikan fungsi tidak mudah dilakukan dengan stack tersedia dan jelaskan alasannya. Pilih satu driver PostgreSQL dan satu cara akses provider AI. Jangan menambah ORM, chart library, atau multiprovider router karena preferensi pribadi.

## Database Rules

- Hormati FK, category/status allowlist, dan ownership.
- Gunakan migration untuk perubahan schema; jangan menghapus constraint tanpa alasan.
- Query parameterized, server-side, scoped user aktif.
- Satu batch tiga aksi per user/tanggal: AI di luar transaction, lock user, recheck, insert atomik.
- Completion hari ini saja dan idempotent; tidak ada undo/backfill.
- Kalender Asia/Jakarta; minggu Senin–Minggu.
- Jangan menambah entity feedback/batch atau completed_at tanpa perubahan keputusan yang beralasan.
- Jangan mereset/menghapus data sebagai shortcut debugging; seed demo harus idempotent.

## Security Rules

- Jangan expose secret ke client atau commit credentials.
- Validasi input dan output AI.
- Enforce ownership di server; jangan percaya user_id/tanggal/statistik client.
- Identitas demo bukan authentication personal: semua pengunjung berbagi user.
- Gunakan data sintetis dan akses demo terkendali.
- Jangan menganggap aplikasi siap publik multiuser tanpa authentication/authorization yang sesuai.
- Render AI sebagai teks; jangan menerima HTML atau instruksi model sebagai wewenang server.

## AI Rules

- AI merekomendasikan dan memberi feedback; database menghitung progress.
- AI adalah enhancement; transaksi database, completion, dan progress tidak bergantung pada Gemini.
- Maksimal tiga percobaan total (termasuk request awal dan satu model cadangan Gemini), seluruhnya dalam deadline 10 detik. Retry hanya kegagalan sementara (network/429/5xx) dengan jeda singkat; hormati Retry-After bila masih muat dalam deadline. Error permanen tidak diulang pada model yang sama; bila waktu habis, key/model tidak tersedia, atau output tidak valid, langsung gunakan fallback tervalidasi berlabel. Tidak ada retry background atau retry berulang pada refresh.
- Provider Gemini dipilih; model utama/cadangan dikonfigurasi saat integrasi. Kegagalan AI tidak menghalangi setup atau core development; catat hasil uji nyata tanpa mengklaim fallback sebagai AI.
- Completion tidak bergantung pada ketersediaan AI.
- Feedback tidak disimpan, diminta manual, dan harus invalidated saat snapshot berubah.
- Jangan mengklaim fallback sebagai AI nyata atau jumlah aksi sebagai pengurangan emisi terukur.

## Hackathon Rules

- Core functionality lebih penting daripada polish.
- Shipping lebih penting daripada arsitektur sempurna.
- Hindari perubahan besar menjelang deadline.
- Ikuti STOP CONDITIONS; feature freeze saat sisa waktu <60 menit.
- Prioritaskan aplikasi yang bisa didemokan end-to-end.
- P1/P2 hanya sesudah seluruh P0, termasuk deployment, lulus.
- Jangan menandai task implementasi selesai karena dokumennya telah dibuat.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

export default function Home() {
  return (
    <main id="main" className="mx-auto max-w-[880px] px-4 py-8 sm:px-6">
      <h1 className="text-2xl leading-8 font-semibold">Langkah kecil, setiap hari</h1>
      <p className="mt-3 max-w-prose text-neutral-600">
        Bangun kebiasaan yang lebih ramah lingkungan melalui aksi sederhana.
      </p>
      <section aria-labelledby="daily-heading" className="mt-8 border-t border-neutral-300 pt-6">
        <h2 id="daily-heading" className="text-lg leading-[26px] font-semibold">Aksi hari ini</h2>
        <p className="mt-3 max-w-prose text-neutral-600">
          Aksi harian belum tersedia. Fitur rekomendasi dan pencatatan sedang disiapkan.
        </p>
      </section>
      <p className="mt-8 text-sm leading-5 text-neutral-600">Demo bersama · Gunakan hanya data sintetis.</p>
    </main>
  );
}

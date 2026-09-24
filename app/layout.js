import './globals.css';

export const metadata = {
  title: 'EcoAction',
  description: 'Langkah kecil untuk kebiasaan yang lebih ramah lingkungan.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:block focus:p-4">Lewati ke konten utama</a>
        <header className="border-b border-neutral-300">
          <div className="mx-auto max-w-[880px] px-4 py-6 sm:px-6">
            <span className="text-lg font-semibold text-green-800">EcoAction</span>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

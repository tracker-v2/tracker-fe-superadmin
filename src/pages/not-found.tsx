export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="grid h-screen place-items-center px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-indigo-900">404</p>
          <p className="text-base font-semibold text-indigo-900">404 - Tracker - Widya Matador</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
            Halaman tidak ditemukan
          </h1>
          <p className="mt-6 text-lg font-medium text-gray-500 sm:text-xl">
            Maaf, kami tidak dapat menemukan halaman yang Anda cari.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/"
              className="rounded-md bg-blue-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Kembali ke Beranda
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

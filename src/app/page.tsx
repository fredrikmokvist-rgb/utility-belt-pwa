import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="flex-1 overflow-y-auto min-h-0 bg-zinc-50 dark:bg-zinc-950 p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-4">
            UtilityBelt Tools
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
            A privacy-first, blazing fast collection of local utilities. No ads, no subscriptions, no cloud processing.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* PDF Editor Card */}
          <Link href="/pdf-editor" className="group relative bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">PDF Editor</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Edit, draw, add text, merge, reorder, and split PDF documents entirely within your browser. High performance virtualized rendering.
              </p>
            </div>
          </Link>

          {/* HEIC Converter Card */}
          <Link href="/heic-converter" className="group relative bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 dark:bg-amber-900/30 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">HEIC Converter</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Batch convert Apple HEIC photos to universal JPG format. Uses Web Workers so your browser never freezes during heavy conversions.
              </p>
            </div>
          </Link>

          {/* Coming Soon Card */}
          <div className="group relative bg-zinc-100 dark:bg-zinc-800/50 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800/80 overflow-hidden cursor-not-allowed">
            <div className="relative z-10 opacity-60 grayscale">
              <div className="w-14 h-14 bg-zinc-500 text-white rounded-2xl flex items-center justify-center shadow-md mb-6">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">More tools soon</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                We are constantly adding new privacy-first local tools. Stay tuned.
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

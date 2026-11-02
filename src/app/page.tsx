import Link from "next/link";
import { tools } from "@/lib/tools";

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
          {tools.map((tool) => (
            <Link key={tool.slug} href={tool.slug} className="group relative bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 ${tool.accentBg} rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
              <div className="relative z-10">
                <div className={`w-14 h-14 ${tool.iconBg} text-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} /></svg>
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">{tool.name}</h2>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </Link>
          ))}

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

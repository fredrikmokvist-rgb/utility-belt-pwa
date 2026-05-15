"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between px-8 py-3 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 h-16 shrink-0">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-white dark:text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white">
            UtilityBelt
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-1">
          <Link 
            href="/pdf-editor" 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/pdf-editor' ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
          >
            PDF Editor
          </Link>
          <Link 
            href="/heic-converter" 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/heic-converter' ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
          >
            HEIC Converter
          </Link>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Future user profile or settings here */}
      </div>
    </nav>
  );
}

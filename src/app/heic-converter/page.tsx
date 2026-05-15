"use client";

import HEICConverter from "@/components/HEICConverter";

export default function HEICConverterPage() {
  return (
    <main className="flex-1 overflow-y-auto min-h-0 bg-zinc-50 dark:bg-zinc-950 p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-4">
            HEIC to JPG Converter
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Drag and drop your Apple HEIC photos below. They are converted instantly inside your browser without being uploaded to any server.
          </p>
        </header>

        <HEICConverter />
      </div>
    </main>
  );
}

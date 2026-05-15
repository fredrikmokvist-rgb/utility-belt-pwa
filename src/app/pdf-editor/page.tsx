"use client";

import dynamic from "next/dynamic";

const MainEditor = dynamic(() => import("@/components/MainEditor"), {
  ssr: false,
});

export default function PDFEditorPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col">
      <MainEditor />
    </main>
  );
}

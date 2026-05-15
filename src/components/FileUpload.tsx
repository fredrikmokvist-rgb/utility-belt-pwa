"use client";

import { ChangeEvent, useRef } from "react";
import { usePDF } from "@/contexts/PDFContext";

export default function FileUpload() {
  const { loadFile } = usePDF();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      await loadFile(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg p-10 mx-auto border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 transition-all bg-white/50 backdrop-blur-md shadow-sm hover:shadow-md cursor-pointer" onClick={() => fileInputRef.current?.click()}>
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <div className="flex flex-col items-center gap-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">Upload PDF</p>
          <p className="mt-1 text-sm text-gray-500">Drag and drop or click to browse</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { usePDF } from "@/contexts/PDFContext";

interface PageActionsProps {
  pageIndex: number;
  onDrawClick: () => void;
  onTextClick: () => void;
}

export default function PageActions({ pageIndex, onDrawClick, onTextClick }: PageActionsProps) {
  const { rotatePage, deletePage, isProcessing } = usePDF();

  return (
    <div className="flex flex-col items-center gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-50">
      <button
        onClick={onDrawClick}
        disabled={isProcessing}
        className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl hover:bg-blue-50 hover:text-blue-600 transition-all disabled:opacity-50 hover:scale-105"
        title="Draw"
      >
        <svg className="w-5 h-5 text-gray-700 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>

      <button
        onClick={onTextClick}
        disabled={isProcessing}
        className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl hover:bg-blue-50 hover:text-blue-600 transition-all disabled:opacity-50 hover:scale-105"
        title="Add Text"
      >
        <svg className="w-5 h-5 text-gray-700 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 6h18M9 18h6" />
        </svg>
      </button>

      <button
        onClick={() => rotatePage(pageIndex, 90)}
        disabled={isProcessing}
        className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl hover:bg-white transition-all disabled:opacity-50 hover:scale-105"
        title="Rotate 90°"
      >
        <svg className="w-5 h-5 text-gray-700 hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      <button
        onClick={() => deletePage(pageIndex)}
        disabled={isProcessing}
        className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50 hover:scale-105 group/delete"
        title="Delete Page"
      >
        <svg className="w-5 h-5 text-red-500 group-hover/delete:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

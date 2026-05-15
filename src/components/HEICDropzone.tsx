"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";

interface HEICDropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

export default function HEICDropzone({ onFilesSelected }: HEICDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
          onFilesSelected(files);
        }
      }
    },
    [onFilesSelected]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files);
        onFilesSelected(files);
        e.target.value = "";
      }
    },
    [onFilesSelected]
  );

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative w-full p-12 border-2 border-dashed rounded-3xl transition-colors duration-300 flex flex-col items-center justify-center min-h-[300px] text-center ${
        isDragActive
          ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
          : "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        accept=".heic,.heif,image/heic,image/heif"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="w-20 h-20 mb-6 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm">
        <svg
          className={`w-10 h-10 transition-colors ${
            isDragActive ? "text-amber-500" : "text-zinc-400 dark:text-zinc-500"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
        {isDragActive ? "Drop files here" : "Drag & Drop HEIC files"}
      </h3>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
        or click anywhere to browse from your computer. Files are processed locally.
      </p>
    </motion.div>
  );
}

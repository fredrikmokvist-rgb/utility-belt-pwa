"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  title: string;
  activeTitle: string;
  hint?: string;
  icon: string;
  activeAccent: string;
  activeIconColor: string;
}

export default function Dropzone({
  onFilesSelected,
  accept,
  multiple = true,
  title,
  activeTitle,
  hint = "or click anywhere to browse from your computer. Files are processed locally.",
  icon,
  activeAccent,
  activeIconColor,
}: DropzoneProps) {
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
        onFilesSelected(Array.from(e.dataTransfer.files));
      }
    },
    [onFilesSelected]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFilesSelected(Array.from(e.target.files));
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
          ? activeAccent
          : "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="w-20 h-20 mb-6 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm">
        <svg
          className={`w-10 h-10 transition-colors ${
            isDragActive ? activeIconColor : "text-zinc-400 dark:text-zinc-500"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={icon}
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
        {isDragActive ? activeTitle : title}
      </h3>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">{hint}</p>
    </motion.div>
  );
}

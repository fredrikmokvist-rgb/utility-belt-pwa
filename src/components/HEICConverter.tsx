"use client";

import { useState, useRef, useEffect } from "react";
import HEICDropzone from "./HEICDropzone";
import JSZip from "jszip";
import { motion, AnimatePresence } from "framer-motion";

type FileStatus = "queued" | "processing" | "success" | "error" | "invalid";

interface HEICItem {
  id: string;
  originalFile: File;
  convertedBlob?: Blob;
  status: FileStatus;
  error?: string;
}

export default function HEICConverter() {
  const [items, setItems] = useState<HEICItem[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  // Process the queue whenever items change
  useEffect(() => {
    const processingCount = items.filter((i) => i.status === "processing").length;
    
    // Process up to 4 items concurrently to speed up batching without overwhelming the browser
    if (processingCount < 4) {
      const queuedItems = items.filter((i) => i.status === "queued");
      const itemsToStart = queuedItems.slice(0, 4 - processingCount);
      
      if (itemsToStart.length > 0) {
        setItems((prev) =>
          prev.map((item) =>
            itemsToStart.some((startItem) => startItem.id === item.id)
              ? { ...item, status: "processing" }
              : item
          )
        );

        itemsToStart.forEach((queuedItem) => {
          const processItem = async () => {
            try {
              const heic2any = (await import("heic2any")).default;
              const blob = await heic2any({
                blob: queuedItem.originalFile,
                toType: "image/jpeg",
                quality: 0.9,
              });
              
              setItems((prev) =>
                prev.map((i) =>
                  i.id === queuedItem.id ? { ...i, status: "success", convertedBlob: blob as Blob } : i
                )
              );
            } catch (error: any) {
              const errorMsg = error?.message || error?.code || (typeof error === 'object' ? JSON.stringify(error) : String(error));
              
              if (typeof errorMsg === 'string' && errorMsg.includes("already browser readable")) {
                setItems((prev) =>
                  prev.map((i) =>
                    i.id === queuedItem.id ? { ...i, status: "success", convertedBlob: queuedItem.originalFile } : i
                  )
                );
              } else {
                setItems((prev) =>
                  prev.map((i) =>
                    i.id === queuedItem.id ? { ...i, status: "error", error: errorMsg } : i
                  )
                );
              }
            }
          };

          processItem();
        });
      }
    }

    const hasIncomplete = items.some((i) => i.status === "queued" || i.status === "processing");
    setIsProcessingBatch(hasIncomplete && items.length > 0);
  }, [items]);

  const handleFilesSelected = (files: File[]) => {
    const newItems: HEICItem[] = files.map((file) => {
      const isHeic = file.type === "image/heic" || 
                     file.type === "image/heif" || 
                     file.name.toLowerCase().endsWith(".heic") || 
                     file.name.toLowerCase().endsWith(".heif");
      return {
        id: crypto.randomUUID(),
        originalFile: file,
        status: isHeic ? "queued" : "invalid",
        error: isHeic ? undefined : "Not a HEIC file",
      };
    });
    setItems((prev) => [...prev, ...newItems]);
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    const successfulItems = items.filter((i) => i.status === "success" && i.convertedBlob);

    if (successfulItems.length === 0) return;

    successfulItems.forEach((item) => {
      const newName = item.originalFile.name.replace(/\.heic$|\.heif$/i, ".jpg");
      zip.file(newName, item.convertedBlob!);
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted_images.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSingle = (item: HEICItem) => {
    if (!item.convertedBlob) return;
    const newName = item.originalFile.name.replace(/\.heic$|\.heif$/i, ".jpg");
    const url = URL.createObjectURL(item.convertedBlob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = newName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setItems([]);
  };

  const completedCount = items.filter(i => i.status === "success").length;
  const progressPercentage = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-20">
      {items.length === 0 ? (
        <HEICDropzone onFilesSelected={handleFilesSelected} />
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="w-full sm:w-1/2">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Processing Queue</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-3">
                {completedCount} of {items.length} completed
              </p>
              {/* Progress Bar */}
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
              <button
                onClick={handleClear}
                disabled={isProcessingBatch}
                className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-100 rounded-xl hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={handleDownloadAll}
                disabled={isProcessingBatch || completedCount === 0}
                className="flex-1 sm:flex-none px-6 py-2 text-sm font-medium text-white bg-amber-500 rounded-xl shadow-sm hover:bg-amber-600 disabled:opacity-50 transition-colors"
              >
                Download ZIP
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-10 h-10 shrink-0 bg-white dark:bg-zinc-900 rounded-lg flex items-center justify-center shadow-sm">
                      {item.status === "success" ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ) : item.status === "error" ? (
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      ) : (
                        <svg className="w-5 h-5 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {item.originalFile.name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                        {item.status === "error" || item.status === "invalid" ? `Failed: ${item.error}` : item.status}
                      </p>
                    </div>
                  </div>

                  {item.status === "success" && (
                    <button
                      onClick={() => handleDownloadSingle(item)}
                      className="shrink-0 p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 transition-colors"
                      title="Download JPG"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {!isProcessingBatch && (
            <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
               <HEICDropzone onFilesSelected={handleFilesSelected} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { usePDF } from "@/contexts/PDFContext";

interface PageRendererProps {
  pageNumber: number;
}

export default function PageRenderer({ pageNumber }: PageRendererProps) {
  const { fileUrl } = usePDF();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL("../workers/pdf.worker.ts", import.meta.url));
    }

    if (canvasRef.current && fileUrl) {
      const offscreen = canvasRef.current.transferControlToOffscreen();
      workerRef.current.postMessage({
        canvas: offscreen,
        url: fileUrl,
        pageNumber,
      }, [offscreen]);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [fileUrl, pageNumber]);

  return (
    <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg shadow-inner overflow-auto w-full h-full">
      <canvas ref={canvasRef} className="shadow-lg rounded bg-white max-w-full h-auto" />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { usePDF } from "@/contexts/PDFContext";
import { useInView } from "framer-motion";
import { getPdfDocument } from "@/lib/pdfCache";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PDFThumbnailProps {
  id: string;
  pageNumber: number;
  onClick: () => void;
}

export default function PDFThumbnail({ id, pageNumber, onClick }: PDFThumbnailProps) {
  const { fileUrl } = usePDF();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendered, setIsRendered] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const setRefs = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    setNodeRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  const isInView = useInView(containerRef, { margin: "500px" });

  useEffect(() => {
    if (!isInView) {
      setIsRendered(false);
      return;
    }

    if (!fileUrl || !canvasRef.current) {
      return;
    }

    let isCancelled = false;

    const renderPage = async () => {
      try {
        const pdfDoc = await getPdfDocument(fileUrl);
        if (isCancelled) return;

        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const renderContext: any = {
          canvasContext: ctx,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        if (!isCancelled) {
          setIsRendered(true);
        }
      } catch (error) {
        console.error("PDF Thumbnail Render Error:", error);
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [isInView, fileUrl, pageNumber]);

  return (
    <div
      ref={setRefs}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`relative flex items-center justify-center p-2 mb-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all min-h-[120px] ${
        isDragging ? "opacity-50 ring-2 ring-blue-500" : ""
      }`}
    >
      <div className="absolute top-1 left-1 text-xs font-bold text-zinc-500 bg-white/80 rounded-full w-5 h-5 flex items-center justify-center shadow-sm z-20">
        {pageNumber}
      </div>
      
      {!isRendered && (
        <div className="absolute animate-pulse bg-zinc-300 dark:bg-zinc-700 w-[80%] h-[80%] rounded-md" />
      )}
      
      {isInView && (
        <canvas 
          ref={canvasRef} 
          className={`shadow-md rounded-sm bg-white max-w-full h-auto z-10 transition-opacity duration-300 ${isRendered ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { usePDF, Point, Stroke, RGBColor, TextItem } from "@/contexts/PDFContext";
import { motion, useInView } from "framer-motion";
import { getPdfDocument } from "@/lib/pdfCache";
import PageActions from "./PageActions";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PDFPageProps {
  pageId: string;
  pageNumber: number;
}

export default function PDFPage({ pageId, pageNumber }: PDFPageProps) {
  const { fileUrl, addDrawing, addText } = usePDF();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendered, setIsRendered] = useState(false);
  
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStrokePoints, setCurrentStrokePoints] = useState<Point[] | null>(null);
  const [activeColor, setActiveColor] = useState<RGBColor>({ r: 0.8, g: 0.2, b: 0.2 });
  const [activeThickness, setActiveThickness] = useState<number>(3);
  
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [activeTextSize, setActiveTextSize] = useState<number>(16);
  const [scales, setScales] = useState({ scaleX: 1, scaleY: 1 });

  const isInView = useInView(containerRef, { margin: "200px" });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pageId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  useEffect(() => {
    if (!isInView || isDragging) {
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

        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        if (overlayCanvasRef.current) {
          overlayCanvasRef.current.width = viewport.width;
          overlayCanvasRef.current.height = viewport.height;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const renderContext: any = {
          canvasContext: ctx,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        if (!isCancelled) {
          setIsRendered(true);
          // Calculate scale immediately after render
          const rect = canvas.getBoundingClientRect();
          setScales({
            scaleX: canvas.width / rect.width,
            scaleY: canvas.height / rect.height,
          });
        }
      } catch (error) {
        console.error("PDF Render Error:", error);
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [isInView, fileUrl, pageNumber, isDragging]);

  // Handle window resize for accurate scale
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && isRendered) {
        const rect = canvasRef.current.getBoundingClientRect();
        setScales({
          scaleX: canvasRef.current.width / rect.width,
          scaleY: canvasRef.current.height / rect.height,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isRendered]);

  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      ctx.strokeStyle = `rgba(${Math.round(stroke.color.r * 255)}, ${Math.round(stroke.color.g * 255)}, ${Math.round(stroke.color.b * 255)}, 0.8)`;
      ctx.lineWidth = stroke.thickness;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });

    if (currentStrokePoints && currentStrokePoints.length >= 2) {
      ctx.strokeStyle = `rgba(${Math.round(activeColor.r * 255)}, ${Math.round(activeColor.g * 255)}, ${Math.round(activeColor.b * 255)}, 0.8)`;
      ctx.lineWidth = activeThickness;
      ctx.beginPath();
      ctx.moveTo(currentStrokePoints[0].x, currentStrokePoints[0].y);
      for (let i = 1; i < currentStrokePoints.length; i++) {
        ctx.lineTo(currentStrokePoints[i].x, currentStrokePoints[i].y);
      }
      ctx.stroke();
    }
  }, [strokes, currentStrokePoints, activeColor, activeThickness]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    e.preventDefault();
    e.stopPropagation();
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * scales.scaleX;
    const y = (e.clientY - rect.top) * scales.scaleY;
    
    setCurrentStrokePoints([{ x, y }]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !currentStrokePoints) return;
    e.preventDefault();
    e.stopPropagation();
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * scales.scaleX;
    const y = (e.clientY - rect.top) * scales.scaleY;
    
    setCurrentStrokePoints(prev => prev ? [...prev, { x, y }] : null);
  };

  const handlePointerUp = () => {
    if (currentStrokePoints) {
      setStrokes(prev => [...prev, {
        points: currentStrokePoints,
        color: activeColor,
        thickness: activeThickness
      }]);
      setCurrentStrokePoints(null);
    }
  };

  const handleApplyDrawing = async () => {
    if (strokes.length > 0) {
      const canvas = overlayCanvasRef.current;
      if (canvas) {
        await addDrawing(pageNumber - 1, strokes, canvas.width, canvas.height);
      }
    }
    setIsDrawingMode(false);
    setStrokes([]);
  };

  const handleCancelDrawing = () => {
    setIsDrawingMode(false);
    setStrokes([]);
  };

  const handleTextOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTextMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;
    
    const internalX = cssX * scales.scaleX;
    const internalY = cssY * scales.scaleY;
    const internalSize = activeTextSize * scales.scaleY;
    
    setTexts(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        x: internalX,
        y: internalY,
        text: "",
        color: activeColor,
        size: internalSize,
      }
    ]);
  };

  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!draggingTextId) return;

    const handleGlobalPointerMove = (e: PointerEvent) => {
      e.preventDefault();
      const container = overlayCanvasRef.current?.parentElement;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const cssX = e.clientX - rect.left - dragOffset.x;
      const cssY = e.clientY - rect.top - dragOffset.y;
      
      const newInternalX = cssX * scales.scaleX;
      const newInternalY = cssY * scales.scaleY;
      
      setTexts(prev => prev.map(t => t.id === draggingTextId ? { ...t, x: newInternalX, y: newInternalY } : t));
    };

    const handleGlobalPointerUp = () => {
      setDraggingTextId(null);
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [draggingTextId, dragOffset, scales]);

  const handleApplyText = async () => {
    if (texts.length > 0) {
      const canvas = canvasRef.current;
      if (canvas) {
        try {
          await addText(pageNumber - 1, texts, canvas.width, canvas.height);
        } catch (err) {
          console.error("Failed to apply text:", err);
          alert("Ett fel uppstod när texten skulle sparas i PDF:en. Vissa specialtecken kanske inte stöds av standardtypsnittet.");
          return;
        }
      }
    }
    setIsTextMode(false);
    setTexts([]);
  };

  const handleCancelText = () => {
    setIsTextMode(false);
    setTexts([]);
  };

  const ColorPicker = () => (
    <div className="flex gap-2 pr-3 border-r border-zinc-200 dark:border-zinc-700">
      <button onClick={() => setActiveColor({ r: 0.8, g: 0.2, b: 0.2 })} className={`w-6 h-6 rounded-full bg-red-500 transition-all ${activeColor.r === 0.8 && activeColor.b === 0.2 ? 'ring-2 ring-offset-2 ring-red-500 scale-110' : 'hover:scale-110'}`} />
      <button onClick={() => setActiveColor({ r: 0.2, g: 0.4, b: 0.8 })} className={`w-6 h-6 rounded-full bg-blue-500 transition-all ${activeColor.r === 0.2 && activeColor.b === 0.8 ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-110'}`} />
      <button onClick={() => setActiveColor({ r: 0.1, g: 0.1, b: 0.1 })} className={`w-6 h-6 rounded-full bg-zinc-800 transition-all ${activeColor.r === 0.1 ? 'ring-2 ring-offset-2 ring-zinc-800 scale-110' : 'hover:scale-110'}`} />
      <button onClick={() => setActiveColor({ r: 0.9, g: 0.8, b: 0.1 })} className={`w-6 h-6 rounded-full bg-yellow-400 transition-all ${activeColor.r === 0.9 ? 'ring-2 ring-offset-2 ring-yellow-400 scale-110' : 'hover:scale-110'}`} />
    </div>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group flex flex-col p-4 my-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl shadow-inner min-h-[800px] w-full max-w-4xl mx-auto border border-zinc-200 dark:border-zinc-700 ${isDragging ? "opacity-50" : ""}`}
    >
      <div ref={containerRef} className="absolute inset-0" />

      {/* Sticky Top-Right Area */}
      <div className="sticky top-4 z-50 w-full h-0 pointer-events-none flex justify-end overflow-visible">
        <div className="pointer-events-auto flex justify-end transform translate-x-0 sm:translate-x-12">
          
          {(!isDrawingMode && !isTextMode) && (
            <PageActions 
              pageIndex={pageNumber - 1} 
              onDrawClick={() => { setIsDrawingMode(true); setIsTextMode(false); }} 
              onTextClick={() => { setIsTextMode(true); setIsDrawingMode(false); }} 
            />
          )}

          {isDrawingMode && (
            <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-zinc-200 dark:bg-zinc-900/90 dark:border-zinc-700 -translate-x-12 sm:translate-x-0">
              <ColorPicker />
              <div className="flex gap-2 pr-3 border-r border-zinc-200 dark:border-zinc-700 items-center">
                 <button onClick={() => setActiveThickness(2)} className={`w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all ${activeThickness === 2 ? 'bg-zinc-200 dark:bg-zinc-700' : ''}`}><div className="w-1 h-1 bg-zinc-800 dark:bg-zinc-200 rounded-full" /></button>
                 <button onClick={() => setActiveThickness(4)} className={`w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all ${activeThickness === 4 ? 'bg-zinc-200 dark:bg-zinc-700' : ''}`}><div className="w-2 h-2 bg-zinc-800 dark:bg-zinc-200 rounded-full" /></button>
                 <button onClick={() => setActiveThickness(8)} className={`w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all ${activeThickness === 8 ? 'bg-zinc-200 dark:bg-zinc-700' : ''}`}><div className="w-3 h-3 bg-zinc-800 dark:bg-zinc-200 rounded-full" /></button>
              </div>
              <button onClick={handleCancelDrawing} className="px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 font-medium transition-colors">Cancel</button>
              <button onClick={handleApplyDrawing} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg shadow hover:bg-green-700 font-medium transition-colors">Apply</button>
            </div>
          )}

          {isTextMode && (
            <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-zinc-200 dark:bg-zinc-900/90 dark:border-zinc-700 -translate-x-12 sm:translate-x-0">
              <ColorPicker />
              <div className="flex gap-2 pr-3 border-r border-zinc-200 dark:border-zinc-700 items-center">
                 <button onClick={() => setActiveTextSize(12)} className={`px-2 py-1 text-sm font-semibold rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 ${activeTextSize === 12 ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-white' : 'text-zinc-500'}`}>Small</button>
                 <button onClick={() => setActiveTextSize(16)} className={`px-2 py-1 text-sm font-semibold rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 ${activeTextSize === 16 ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-white' : 'text-zinc-500'}`}>Med</button>
                 <button onClick={() => setActiveTextSize(24)} className={`px-2 py-1 text-sm font-semibold rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 ${activeTextSize === 24 ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-white' : 'text-zinc-500'}`}>Large</button>
              </div>
              <button onClick={handleCancelText} className="px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 font-medium transition-colors">Cancel</button>
              <button onClick={handleApplyText} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg shadow hover:bg-green-700 font-medium transition-colors">Apply</button>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Top-Left Area: Drag handle */}
      {(!isDrawingMode && !isTextMode) && (
        <div className="sticky top-4 z-50 w-full h-0 pointer-events-none flex justify-start overflow-visible">
          <div 
            {...attributes} 
            {...listeners} 
            className="pointer-events-auto p-2 cursor-grab active:cursor-grabbing bg-white/80 backdrop-blur-md rounded-lg shadow opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
        </div>
      )}

      {isInView && !isRendered && (
        <div className="absolute animate-pulse bg-zinc-200 dark:bg-zinc-700 rounded-lg w-[80%] h-[90%]" />
      )}
      
      {isInView && (
        <div className="relative z-10 mx-auto w-fit mt-8 sm:mt-0">
          <motion.canvas 
            ref={canvasRef} 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isRendered ? 1 : 0, scale: isRendered ? 1 : 0.95 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="shadow-2xl rounded-sm bg-white max-w-full h-auto block" 
          />
          
          <canvas
            ref={overlayCanvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerOut={handlePointerUp}
            className={`absolute top-0 left-0 w-full h-full rounded-sm ${isDrawingMode ? 'cursor-crosshair pointer-events-auto z-20' : 'pointer-events-none opacity-0'}`}
          />

          {isTextMode && (
            <div 
              className="absolute inset-0 z-20 cursor-text"
              onClick={handleTextOverlayClick}
            >
              {texts.map((item) => (
                <div 
                  key={item.id}
                  className="absolute group"
                  style={{
                    left: item.x / scales.scaleX,
                    top: item.y / scales.scaleY,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Drag Handle & Delete */}
                  <div className="absolute -top-7 left-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                    <div 
                      className="h-6 w-8 bg-zinc-800 text-white cursor-move flex items-center justify-center rounded-tl-md shadow-md"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        const itemRect = e.currentTarget.parentElement!.parentElement!.getBoundingClientRect();
                        setDragOffset({
                          x: e.clientX - itemRect.left,
                          y: e.clientY - itemRect.top
                        });
                        setDraggingTextId(item.id);
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
                    </div>
                    <div 
                      className="h-6 w-6 bg-red-500 text-white cursor-pointer flex items-center justify-center rounded-tr-md shadow-md hover:bg-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTexts(prev => prev.filter(t => t.id !== item.id));
                      }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                  </div>

                  <textarea
                    autoFocus
                    className="bg-transparent outline-none resize-none overflow-hidden m-0 p-0 leading-[1.2] min-w-[20px]"
                    style={{
                      color: `rgb(${Math.round(item.color.r * 255)}, ${Math.round(item.color.g * 255)}, ${Math.round(item.color.b * 255)})`,
                      fontSize: `${item.size / scales.scaleY}px`,
                      fontFamily: "Helvetica, Arial, sans-serif",
                      minHeight: `${(item.size / scales.scaleY) * 1.2}px`,
                      border: "1px dashed rgba(0,0,0,0.2)",
                    }}
                    value={item.text}
                    onChange={(e) => {
                      const newText = e.target.value;
                      setTexts(prev => prev.map(t => t.id === item.id ? { ...t, text: newText } : t));
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                      e.target.style.width = Math.max(20, e.target.scrollWidth) + 'px';
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onFocus={(e) => e.target.style.border = "1px dashed rgba(0,0,0,0.5)"}
                    onBlur={(e) => e.target.style.border = "1px solid transparent"}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

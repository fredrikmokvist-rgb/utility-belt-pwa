"use client";

import { createContext, useContext, useState, ReactNode, useTransition } from "react";
import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";

interface HistoryState {
  buffer: Uint8Array;
  pageIds: string[];
}

export interface Point {
  x: number;
  y: number;
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface Stroke {
  points: Point[];
  color: RGBColor;
  thickness: number;
}

export interface TextItem {
  id: string;
  x: number;
  y: number;
  text: string;
  color: RGBColor;
  size: number;
}

interface PDFContextState {
  file: File | null;
  fileUrl: string | null;
  pdfDoc: PDFDocument | null;
  pageCount: number;
  pageIds: string[];
  isProcessing: boolean;
  historyLength: number;
  loadFile: (file: File) => Promise<void>;
  reset: () => void;
  rotatePage: (index: number, deg: number) => Promise<void>;
  deletePage: (index: number) => Promise<void>;
  movePage: (oldIndex: number, newIndex: number) => Promise<void>;
  mergeFile: (file: File) => Promise<void>;
  saveDocument: (filename?: string) => void;
  undo: () => Promise<void>;
  addDrawing: (pageIndex: number, strokes: Stroke[], canvasWidth: number, canvasHeight: number) => Promise<void>;
  addText: (pageIndex: number, texts: TextItem[], canvasWidth: number, canvasHeight: number) => Promise<void>;
}

const PDFContext = createContext<PDFContextState | undefined>(undefined);

export function PDFProvider({ children }: { children: ReactNode }) {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pageIds, setPageIds] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [isPending, startTransition] = useTransition();

  const saveSnapshot = async () => {
    if (!pdfDoc) return;
    const buffer = await pdfDoc.save();
    setHistory(prev => {
      const newHistory = [...prev, { buffer, pageIds: [...pageIds] }];
      if (newHistory.length > 15) newHistory.shift();
      return newHistory;
    });
  };

  const updateDocumentState = async (doc: PDFDocument, nextIds: string[]) => {
    const uint8Array = await doc.save();
    const blob = new Blob([uint8Array as any], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    startTransition(() => {
      setFileUrl((prevUrl) => {
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl);
        }
        return url;
      });
      setPdfDoc(doc);
      setPageCount(doc.getPageCount());
      setPageIds(nextIds);
    });
  };

  const loadFile = async (newFile: File) => {
    try {
      const arrayBuffer = await newFile.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer);
      const url = URL.createObjectURL(newFile);
      const initialIds = Array.from({ length: doc.getPageCount() }, () => crypto.randomUUID());
      
      startTransition(() => {
        setFileUrl((prevUrl) => {
          if (prevUrl) URL.revokeObjectURL(prevUrl);
          return url;
        });
        setFile(newFile);
        setPdfDoc(doc);
        setPageCount(doc.getPageCount());
        setPageIds(initialIds);
        setHistory([]);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const reset = () => {
    setFileUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return null;
    });
    setFile(null);
    setPdfDoc(null);
    setPageCount(0);
    setPageIds([]);
    setHistory([]);
  };

  const rotatePage = async (index: number, deg: number) => {
    if (!pdfDoc) return;
    await saveSnapshot();
    const pages = pdfDoc.getPages();
    const page = pages[index];
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(currentRotation + deg));
    await updateDocumentState(pdfDoc, pageIds);
  };

  const deletePage = async (index: number) => {
    if (!pdfDoc) return;
    await saveSnapshot();
    pdfDoc.removePage(index);
    const nextIds = [...pageIds];
    nextIds.splice(index, 1);
    await updateDocumentState(pdfDoc, nextIds);
  };

  const movePage = async (oldIndex: number, newIndex: number) => {
    if (!pdfDoc) return;
    await saveSnapshot();
    
    const newDoc = await PDFDocument.create();
    const pageIndices = Array.from({ length: pdfDoc.getPageCount() }, (_, i) => i);
    const [movedIndex] = pageIndices.splice(oldIndex, 1);
    pageIndices.splice(newIndex, 0, movedIndex);
    
    const copiedPages = await newDoc.copyPages(pdfDoc, pageIndices);
    copiedPages.forEach((p) => newDoc.addPage(p));
    
    const nextIds = [...pageIds];
    const [movedId] = nextIds.splice(oldIndex, 1);
    nextIds.splice(newIndex, 0, movedId);
    
    await updateDocumentState(newDoc, nextIds);
  };

  const mergeFile = async (newFile: File) => {
    if (!pdfDoc) return;
    try {
      await saveSnapshot();
      const arrayBuffer = await newFile.arrayBuffer();
      const externalDoc = await PDFDocument.load(arrayBuffer);
      const copiedPages = await pdfDoc.copyPages(externalDoc, externalDoc.getPageIndices());
      
      copiedPages.forEach((p) => pdfDoc.addPage(p));
      
      const newIds = Array.from({ length: copiedPages.length }, () => crypto.randomUUID());
      const nextIds = [...pageIds, ...newIds];
      
      await updateDocumentState(pdfDoc, nextIds);
    } catch (error) {
      console.error(error);
    }
  };

  const saveDocument = (filename: string = "edited-document.pdf") => {
    if (!fileUrl) return;
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const undo = async () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));

    try {
      const newDoc = await PDFDocument.load(lastState.buffer);
      const url = URL.createObjectURL(new Blob([lastState.buffer as any], { type: "application/pdf" }));

      startTransition(() => {
        setFileUrl(prevUrl => {
          if (prevUrl) URL.revokeObjectURL(prevUrl);
          return url;
        });
        setPdfDoc(newDoc);
        setPageCount(newDoc.getPageCount());
        setPageIds(lastState.pageIds);
      });
    } catch (error) {
      console.error("Undo failed:", error);
    }
  };

  const addDrawing = async (pageIndex: number, strokes: Stroke[], canvasWidth: number, canvasHeight: number) => {
    if (!pdfDoc) return;
    await saveSnapshot();
    
    const page = pdfDoc.getPages()[pageIndex];
    const { width: pdfWidth, height: pdfHeight } = page.getSize();
    
    for (const stroke of strokes) {
      if (stroke.points.length < 2) continue;
      const strokeColor = rgb(stroke.color.r, stroke.color.g, stroke.color.b);
      const thickness = stroke.thickness;
      
      for (let i = 1; i < stroke.points.length; i++) {
        const p1 = stroke.points[i - 1];
        const p2 = stroke.points[i];
        
        const x1 = (p1.x / canvasWidth) * pdfWidth;
        const y1 = pdfHeight - (p1.y / canvasHeight) * pdfHeight;
        
        const x2 = (p2.x / canvasWidth) * pdfWidth;
        const y2 = pdfHeight - (p2.y / canvasHeight) * pdfHeight;
        
        page.drawLine({
          start: { x: x1, y: y1 },
          end: { x: x2, y: y2 },
          thickness,
          color: strokeColor,
        });
      }
    }
    
    await updateDocumentState(pdfDoc, pageIds);
  };

  const addText = async (pageIndex: number, texts: TextItem[], canvasWidth: number, canvasHeight: number) => {
    if (!pdfDoc) return;
    await saveSnapshot();

    const page = pdfDoc.getPages()[pageIndex];
    const { width: pdfWidth, height: pdfHeight } = page.getSize();
    const cropBox = page.getCropBox();
    
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (const textItem of texts) {
      if (!textItem.text.trim()) continue;

      const pdfSize = textItem.size * (pdfHeight / canvasHeight);
      const x = cropBox.x + (textItem.x / canvasWidth) * pdfWidth;
      const y = cropBox.y + pdfHeight - (textItem.y / canvasHeight) * pdfHeight - pdfSize;

      page.drawText(textItem.text, {
        x,
        y,
        size: pdfSize,
        font: helveticaFont,
        color: rgb(textItem.color.r, textItem.color.g, textItem.color.b),
        lineHeight: pdfSize * 1.2,
      });
    }

    await updateDocumentState(pdfDoc, pageIds);
  };

  return (
    <PDFContext.Provider value={{ file, fileUrl, pdfDoc, pageCount, pageIds, isProcessing: isPending, historyLength: history.length, loadFile, reset, rotatePage, deletePage, movePage, mergeFile, saveDocument, undo, addDrawing, addText }}>
      {children}
    </PDFContext.Provider>
  );
}

export function usePDF() {
  const context = useContext(PDFContext);
  if (context === undefined) {
    throw new Error("usePDF must be used within a PDFProvider");
  }
  return context;
}

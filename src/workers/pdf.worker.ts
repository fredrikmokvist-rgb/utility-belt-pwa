import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const documentCache = new Map<string, pdfjsLib.PDFDocumentProxy>();
const canvasCache = new Map<string, OffscreenCanvas>();

self.onmessage = async (e: MessageEvent) => {
  const { canvas, url, pageNumber, pageId } = e.data;
  
  let targetCanvas = canvas;
  if (canvas) {
    canvasCache.set(pageId, canvas);
  } else {
    targetCanvas = canvasCache.get(pageId);
  }

  if (!targetCanvas || !url || !pageNumber || !pageId) return;

  try {
    let pdfDoc = documentCache.get(url);
    if (!pdfDoc) {
      const loadingTask = pdfjsLib.getDocument(url);
      pdfDoc = await loadingTask.promise;
      documentCache.set(url, pdfDoc);
    }
    
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.5 });
    
    targetCanvas.width = viewport.width;
    targetCanvas.height = viewport.height;
    
    const ctx = targetCanvas.getContext("2d");
    if (!ctx) throw new Error("Context error");
    
    const renderContext: any = {
      canvasContext: ctx,
      viewport: viewport,
    };
    
    await page.render(renderContext).promise;
    
    self.postMessage({ success: true, pageId, pageNumber });
  } catch (error) {
    self.postMessage({ success: false, pageId, error: String(error) });
  }
};

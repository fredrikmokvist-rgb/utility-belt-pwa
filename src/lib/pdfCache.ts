export const documentCache = new Map<string, any>();

export const getPdfDocument = async (url: string) => {
  if (documentCache.has(url)) return documentCache.get(url);
  
  documentCache.clear();
  
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  
  const loadingTask = pdfjsLib.getDocument(url);
  const doc = await loadingTask.promise;
  documentCache.set(url, doc);
  return doc;
};

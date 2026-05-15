export const getPDFWorker = (): Worker => {
  if (typeof window === "undefined") {
    return null as unknown as Worker;
  }
  if (!(window as any).pdfWorkerInstance) {
    (window as any).pdfWorkerInstance = new Worker(new URL("../workers/pdf.worker.ts", import.meta.url));
  }
  return (window as any).pdfWorkerInstance;
};

const waitForGlobal = (key: string, timeout = 8000) => {
  return new Promise<any>((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const value = (window as any)[key];
      if (value) return resolve(value);
      if (Date.now() - start > timeout) return reject(new Error(`${key} failed to load`));
      requestAnimationFrame(check);
    };
    check();
  });
};

export const enginesReady = (async () => {
  const [pdfjsLib] = await Promise.all([
    waitForGlobal('pdfjsLib'),
    waitForGlobal('jspdf'),
    waitForGlobal('PDFLib'),
    waitForGlobal('JSZip'),
    waitForGlobal('XLSX'),
    waitForGlobal('html2canvas'),
    waitForGlobal('mammoth'),
    waitForGlobal('Tesseract'),
  ]);

  // Ensure workerSrc set if CDN script loaded before this runs
  if (pdfjsLib?.GlobalWorkerOptions && pdfjsLib.GlobalWorkerOptions.workerSrc === undefined) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  return true;
})();

if (typeof window !== 'undefined') {
  (window as any).__enginesReady = enginesReady;
}

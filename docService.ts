
import { UploadedFile, ProcessingResult } from '@/types';
import { PAPER_SIZES } from '@/constants';
import { enginesReady } from './libInit';

const sendUsageLog = async (event: string, payload: Record<string, any>) => {
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, ...payload }),
    });
  } catch {
    // best-effort logging, ignore errors
  }
};

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const ensureEnginesLoaded = async () => {
  try {
    await enginesReady;
  } catch (err: any) {
    throw new Error('Required processing engines did not load: ' + err.message);
  }
};

export const docService = {
  getRandomLoadingMessage: () => {
    const msgs = ["Processing...", "Almost there...", "Optimizing...", "Saving...", "Merging layers...", "Analyzing structure...", "Rendering pages...", "Applying filters..."];
    return msgs[Math.floor(Math.random() * msgs.length)];
  },

  convert: async (file: UploadedFile, format: string, onProgress?: (msg: string) => void, options?: any): Promise<ProcessingResult> => {
      await ensureEnginesLoaded();
      // XLSX to PDF
      if (file.type === 'XLSX' && window.XLSX) {
          const arrayBuffer = await file.file.arrayBuffer();
          const workbook = window.XLSX.read(arrayBuffer);
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (!window.jspdf) throw new Error("PDF Engine not loaded");
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();
          let y = 10;
          jsonData.forEach((row: any[]) => {
              doc.text(row.join('  '), 10, y);
              y += 10;
              if (y > 280) { doc.addPage(); y = 10; }
          });
          
          const blob = doc.output('blob');
          const result = {
              success: true,
              downloadUrl: URL.createObjectURL(blob),
              fileName: `converted_${file.file.name.split('.')[0]}.pdf`,
              fileSize: formatSize(blob.size)
          };

          sendUsageLog('convert', { source: 'xlsx', target: 'pdf', size: file.size, mode: 'client' });
          return result;
      }
      // DOCX to PDF
      else if (file.type === 'DOCX') {
          // Prefer backend conversion for fidelity; fallback to client mammoth
          try {
              onProgress?.('Uploading to secure converter...');
              const arrayBuffer = await file.file.arrayBuffer();
              const fileData = bufferToBase64(arrayBuffer);
              const response = await fetch('/api/convert-docx', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ fileName: file.file.name, fileData }),
              });

              if (!response.ok) {
                  const message = await response.text();
                  throw new Error(message || 'Backend conversion failed');
              }

              const pdfBlob = await response.blob();
              const result: ProcessingResult = {
                  success: true,
                  downloadUrl: URL.createObjectURL(pdfBlob),
                  fileName: file.file.name.replace(/\.docx$/i, '') + '.pdf',
                  fileSize: formatSize(pdfBlob.size)
              };

              sendUsageLog('convert', { source: 'docx', target: 'pdf', size: file.size, mode: 'backend' });
              return result;
          } catch (err: any) {
              if (!window.mammoth) {
                  throw new Error(err?.message || 'DOCX conversion failed and no client fallback available');
              }
              onProgress?.('Falling back to in-browser conversion...');
              const arrayBuffer = await file.file.arrayBuffer();
              const result = await window.mammoth.convertToHtml({ arrayBuffer });
              const html = result.value;
              const pdf = await docService.htmlToPdf(html);
              sendUsageLog('convert', { source: 'docx', target: 'pdf', size: file.size, mode: 'client-fallback', error: err?.message });
              return pdf;
          }
      }
      // Image to PDF
      else if ((file.type === 'JPG' || file.type === 'PNG') && format === 'PDF') {
          if (!window.jspdf) throw new Error("PDF Engine not loaded");
          const { jsPDF } = window.jspdf;
          
          const doc = new jsPDF(options?.orientation === 'Landscape' ? 'l' : 'p', 'mm', options?.pageSize === 'A4' ? 'a4' : options?.pageSize === 'Letter' ? 'letter' : undefined);
          const imgProps = doc.getImageProperties(file.previewUrl || URL.createObjectURL(file.file));
          const pdfWidth = doc.internal.pageSize.getWidth();
          
          // Calculate dims
          let w = pdfWidth;
          let h = (imgProps.height * pdfWidth) / imgProps.width;
          let x = 0;
          let y = 0;
          
          // Apply margins
          if (options?.margin === 'small') { 
              const m = 10; 
              w = pdfWidth - (m*2); 
              h = (imgProps.height * w) / imgProps.width; 
              x = m; y = m; 
          }
          if (options?.margin === 'large') { 
              const m = 25; 
              w = pdfWidth - (m*2); 
              h = (imgProps.height * w) / imgProps.width; 
              x = m; y = m; 
          }

          doc.addImage(file.previewUrl || URL.createObjectURL(file.file), file.type === 'JPG' ? 'JPEG' : 'PNG', x, y, w, h);
          const blob = doc.output('blob');

          const result = {
              success: true,
              downloadUrl: URL.createObjectURL(blob),
              fileName: `converted_${file.file.name.split('.')[0]}.pdf`,
              fileSize: formatSize(blob.size)
          };

          sendUsageLog('convert', { source: file.type.toLowerCase(), target: 'pdf', size: file.size, mode: 'client' });
          return result;
      }
      // PDF to JPG (Uses Extract Images logic essentially, but tailored)
      else if (file.type === 'PDF' && format === 'JPG') {
          const result = await docService.extractImages(file, onProgress);
          sendUsageLog('convert', { source: 'pdf', target: 'jpg', size: file.size, mode: 'client' });
          return result;
      }

      throw new Error("Conversion not supported or engine not loaded.");
  },

  compress: async (file: UploadedFile, level: number): Promise<ProcessingResult> => {
      try {
          await ensureEnginesLoaded();
          if (!window.pdfjsLib) throw new Error("PDF.js engine not loaded");
          if (!window.jspdf) throw new Error("jsPDF engine not loaded");

          const quality = Math.max(0.4, 1 - (level / 140)); // 1 -> 0.4
          const scale = Math.max(0.55, 1.2 - (level / 120)); // 1.2 -> 0.55

          const arrayBuffer = await file.file.arrayBuffer();
          const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

          let doc: any = null;

          for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const viewport = page.getViewport({ scale });
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.width = viewport.width;
              canvas.height = viewport.height;

              await page.render({ canvasContext: context, viewport }).promise;
              const imgData = canvas.toDataURL('image/jpeg', quality);

              const orientation = viewport.width > viewport.height ? 'landscape' : 'portrait';
              const format: [number, number] = [viewport.width, viewport.height];

              if (i === 1) {
                  const { jsPDF } = window.jspdf;
                  doc = new jsPDF({ unit: 'px', format, orientation });
              } else {
                  doc.addPage(format, orientation);
              }

              doc.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
          }

          const blob = doc.output('blob');

          const result = {
              success: true,
              downloadUrl: URL.createObjectURL(blob),
              fileName: `compressed_${file.file.name}`,
              fileSize: formatSize(blob.size)
          };

          sendUsageLog('compress', { sizeBefore: file.size, sizeAfter: blob.size, level });
          return result;
      } catch (err: any) {
          throw new Error("Compression failed: " + err.message);
      }
  },
  
  generateThumbnail: async (file: File): Promise<string> => {
      try {
          await ensureEnginesLoaded();
          if (file.type !== 'application/pdf') return "";
          if (!window.pdfjsLib) return "";
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          return canvas.toDataURL();
      } catch (e) { return ""; }
  },

  merge: async (files: UploadedFile[], normalize: boolean): Promise<ProcessingResult> => {
      try {
          await ensureEnginesLoaded();
          if (!window.PDFLib) throw new Error("PDF Engine not loaded");
          const { PDFDocument, PageSizes } = window.PDFLib;
          const mergedPdf = await PDFDocument.create();

          for (const file of files) {
              const fileBuffer = await file.file.arrayBuffer();
              if (file.type === 'PDF') {
                  const srcPdf = await PDFDocument.load(fileBuffer);
                  if (normalize) {
                      const embeddedPages = await mergedPdf.embedPages(srcPdf, srcPdf.getPageIndices());
                      for (const embeddedPage of embeddedPages) {
                          const page = mergedPdf.addPage(PageSizes.A4);
                          const { width, height } = page.getSize();
                          const dims = embeddedPage.scaleToFit(width, height);
                          page.drawPage(embeddedPage, { ...dims, x: width/2 - dims.width/2, y: height/2 - dims.height/2 });
                      }
                  } else {
                      const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
                      copiedPages.forEach((page) => mergedPdf.addPage(page));
                  }
              } else if (file.type === 'JPG' || file.type === 'PNG') {
                  let image;
                  if (file.type === 'JPG') image = await mergedPdf.embedJpg(fileBuffer);
                  else image = await mergedPdf.embedPng(fileBuffer);
                  const page = mergedPdf.addPage(PageSizes.A4);
                  const { width, height } = page.getSize();
                  const imgDims = image.scaleToFit(width, height);
                  page.drawImage(image, { x: width/2 - imgDims.width/2, y: height/2 - imgDims.height/2, width: imgDims.width, height: imgDims.height });
              }
          }
          const pdfBytes = await mergedPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          return { success: true, downloadUrl: URL.createObjectURL(blob), fileName: `merged_${Date.now()}.pdf`, fileSize: formatSize(blob.size) };
      } catch (err: any) { throw new Error("Merge failed: " + err.message); }
  },

  split: async (file: UploadedFile, options: any, onProgress?: (msg: string) => void): Promise<ProcessingResult> => {
      try {
          await ensureEnginesLoaded();
          if (!window.PDFLib) throw new Error("PDF Engine not loaded");
          const arrayBuffer = await file.file.arrayBuffer();
          const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
          const newPdf = await window.PDFLib.PDFDocument.create();
          
          let indicesToCopy: number[] = [];
          const totalPages = pdfDoc.getPageCount();

          if (options.extractAll) {
              if (!window.JSZip) throw new Error("Zip Engine not loaded");
              const zip = new window.JSZip();
              for (let i = 0; i < totalPages; i++) {
                  const singleDoc = await window.PDFLib.PDFDocument.create();
                  const [page] = await singleDoc.copyPages(pdfDoc, [i]);
                  singleDoc.addPage(page);
                  const bytes = await singleDoc.save();
                  zip.file(`page_${i+1}.pdf`, bytes);
                  onProgress && onProgress(`Processing page ${i+1}...`);
              }
              const zipContent = await zip.generateAsync({ type: "blob" });
              return { success: true, downloadUrl: URL.createObjectURL(zipContent), fileName: `split_${file.file.name}.zip`, fileSize: formatSize(zipContent.size) };
          } else {
              const parts = options.range.split(',');
              parts.forEach((part: string) => {
                  if (part.includes('-')) {
                      const [start, end] = part.split('-').map(n => parseInt(n.trim()) - 1);
                      for (let i = start; i <= end; i++) if (i >= 0 && i < totalPages) indicesToCopy.push(i);
                  } else {
                      const i = parseInt(part.trim()) - 1;
                      if (i >= 0 && i < totalPages) indicesToCopy.push(i);
                  }
              });
              
              const copiedPages = await newPdf.copyPages(pdfDoc, indicesToCopy);
              copiedPages.forEach(p => newPdf.addPage(p));
              const pdfBytes = await newPdf.save();
              const blob = new Blob([pdfBytes], { type: 'application/pdf' });
              return { success: true, downloadUrl: URL.createObjectURL(blob), fileName: `split_${file.file.name}`, fileSize: formatSize(blob.size) };
          }
      } catch (err: any) { throw new Error("Split failed: " + err.message); }
  },

  rotate: async (file: UploadedFile, rotation: number): Promise<ProcessingResult> => {
      try {
          await ensureEnginesLoaded();
          if (!window.PDFLib) throw new Error("PDF Engine not loaded");
          const arrayBuffer = await file.file.arrayBuffer();
          const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
          const pages = pdfDoc.getPages();
          pages.forEach((page: any) => {
              const currentRotation = page.getRotation().angle;
              page.setRotation(window.PDFLib.degrees(currentRotation + rotation));
          });
          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          return { success: true, downloadUrl: URL.createObjectURL(blob), fileName: `rotated_${file.file.name}`, fileSize: formatSize(blob.size) };
      } catch (err: any) { throw new Error("Rotation failed: " + err.message); }
  },

  addWatermark: async (file: UploadedFile, text: string, options: any): Promise<ProcessingResult> => {
      try {
          await ensureEnginesLoaded();
          if (!window.PDFLib) throw new Error("PDF Engine not loaded");
          const arrayBuffer = await file.file.arrayBuffer();
          const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
          const pages = pdfDoc.getPages();
          const { degrees, rgb } = window.PDFLib;
          let imageEmbed;
          if (options.type === 'image' && options.imageFile) {
              const imgBuffer = await options.imageFile.arrayBuffer();
              if (options.imageFile.type.includes('png')) imageEmbed = await pdfDoc.embedPng(imgBuffer);
              else imageEmbed = await pdfDoc.embedJpg(imgBuffer);
          }
          pages.forEach((page: any) => {
              const { width, height } = page.getSize();
              if (options.type === 'image' && imageEmbed) {
                  const dims = imageEmbed.scale(options.scale || 0.5);
                  let x = width / 2 - dims.width / 2;
                  let y = height / 2 - dims.height / 2;
                  if (options.position === 'bottom') { x = width - dims.width - 20; y = 20; }
                  page.drawImage(imageEmbed, { x, y, width: dims.width, height: dims.height, opacity: options.opacity || 0.5 });
              } else {
                  const fontSize = 50;
                  let x = width / 2 - 100;
                  let y = height / 2;
                  let rotate = degrees(45);
                  if (options.position === 'bottom') { x = width - 200; y = 50; rotate = degrees(0); }
                  page.drawText(text, { x, y, size: fontSize, color: rgb(0.95, 0.1, 0.1), opacity: options.opacity || 0.5, rotate });
              }
          });
          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          return { success: true, downloadUrl: URL.createObjectURL(blob), fileName: `watermarked_${file.file.name}`, fileSize: formatSize(blob.size) };
      } catch (err: any) { throw new Error("Watermark failed: " + err.message); }
  },

  resize: async (file: UploadedFile, options: any, onProgress?: (msg: string) => void): Promise<ProcessingResult> => {
      try {
          await ensureEnginesLoaded();
          if (!window.PDFLib) throw new Error("PDF Engine not loaded");
          const { PDFDocument } = window.PDFLib;
          
          const arrayBuffer = await file.file.arrayBuffer();
          const srcPdf = await PDFDocument.load(arrayBuffer);
          const newPdf = await PDFDocument.create();
          
          // Determine target dimensions
          let targetWidth = 595.28; // A4 Default
          let targetHeight = 841.89;
          
          if (options.targetSize === 'Custom' && options.width && options.height) {
              // Convert mm to points
              targetWidth = options.width * 2.8346;
              targetHeight = options.height * 2.8346;
          } else if (options.targetSize && PAPER_SIZES[options.targetSize as keyof typeof PAPER_SIZES]) {
              const s = PAPER_SIZES[options.targetSize as keyof typeof PAPER_SIZES];
              targetWidth = s.width;
              targetHeight = s.height;
          }

          const embeddedPages = await newPdf.embedPages(srcPdf, srcPdf.getPageIndices());
          
          for (let i = 0; i < embeddedPages.length; i++) {
              onProgress && onProgress(`Resizing page ${i+1}...`);
              const embeddedPage = embeddedPages[i];
              const page = newPdf.addPage([targetWidth, targetHeight]);
              
              if (options.fitContent) {
                  const dims = embeddedPage.scaleToFit(targetWidth, targetHeight);
                  page.drawPage(embeddedPage, {
                      ...dims,
                      x: targetWidth / 2 - dims.width / 2,
                      y: targetHeight / 2 - dims.height / 2,
                  });
              } else {
                  // Center without scaling (might crop)
                  page.drawPage(embeddedPage, {
                      x: targetWidth / 2 - embeddedPage.width / 2,
                      y: targetHeight / 2 - embeddedPage.height / 2,
                      width: embeddedPage.width,
                      height: embeddedPage.height
                  });
              }
          }
          
          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          return { success: true, downloadUrl: URL.createObjectURL(blob), fileName: `resized_${file.file.name}`, fileSize: formatSize(blob.size) };
      } catch (err: any) { throw new Error("Resize failed: " + err.message); }
  },

  crop: async (file: UploadedFile, margins: { top: number, bottom: number, left: number, right: number }): Promise<ProcessingResult> => {
      try {
          await ensureEnginesLoaded();
          if (!window.PDFLib) throw new Error("PDF Engine not loaded");
          const arrayBuffer = await file.file.arrayBuffer();
          const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
          const pages = pdfDoc.getPages();
          const mmToPt = 2.8346;
          const mTop = margins.top * mmToPt;
          const mBottom = margins.bottom * mmToPt;
          const mLeft = margins.left * mmToPt;
          const mRight = margins.right * mmToPt;
          pages.forEach((page: any) => {
              const { x, y, width, height } = page.getMediaBox();
              const newX = x + mLeft;
              const newY = y + mBottom;
              const newWidth = Math.max(0, width - mLeft - mRight);
              const newHeight = Math.max(0, height - mTop - mBottom);
              page.setMediaBox(newX, newY, newWidth, newHeight);
              page.setCropBox(newX, newY, newWidth, newHeight);
          });
          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          return { success: true, downloadUrl: URL.createObjectURL(blob), fileName: `cropped_${file.file.name}`, fileSize: formatSize(blob.size) };
      } catch (err: any) { throw new Error("Crop failed: " + err.message); }
  },

  getPDFPageCount: async (file: File): Promise<number> => {
      await ensureEnginesLoaded();
      if (!window.pdfjsLib) return 0;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
      return pdf.numPages;
  },

  getPageThumbnail: async (file: File, pageIndex: number): Promise<string> => {
      await ensureEnginesLoaded();
      if (!window.pdfjsLib) return "";
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
      const page = await pdf.getPage(pageIndex + 1);
      const viewport = page.getViewport({ scale: 0.3 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport: viewport }).promise;
      return canvas.toDataURL();
  },

  organize: async (file: UploadedFile, pages: any[], onProgress?: (msg: string) => void): Promise<ProcessingResult> => {
      try {
          if (!window.PDFLib) throw new Error("PDF Engine not loaded");
          const arrayBuffer = await file.file.arrayBuffer();
          const srcPdf = await window.PDFLib.PDFDocument.load(arrayBuffer);
          const newPdf = await window.PDFLib.PDFDocument.create();
          const indices = pages.map((p: any) => p.originalIndex);
          const copiedPages = await newPdf.copyPages(srcPdf, indices);
          copiedPages.forEach((page: any, i: number) => {
              const rotation = pages[i].rotation;
              if (rotation !== 0) {
                  const currentRotation = page.getRotation().angle;
                  page.setRotation(window.PDFLib.degrees(currentRotation + rotation));
              }
              newPdf.addPage(page);
          });
          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          return { success: true, downloadUrl: URL.createObjectURL(blob), fileName: `organized_${file.file.name}`, fileSize: formatSize(blob.size) };
      } catch (err: any) { throw new Error("Organize failed: " + err.message); }
  },

  protect: async (file: UploadedFile, password: string): Promise<ProcessingResult> => {
      try {
          if (!window.PDFLib) throw new Error("PDF Engine not loaded");
          const arrayBuffer = await file.file.arrayBuffer();
          const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
          const pdfBytes = await pdfDoc.save({ userPassword: password, ownerPassword: password, encryptionKeyLength: 128 });
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          return { success: true, downloadUrl: URL.createObjectURL(blob), fileName: `protected_${file.file.name}`, fileSize: formatSize(blob.size) };
      } catch (err: any) { throw new Error("Protection failed: " + err.message); }
  },

  unlock: async (file: UploadedFile, password: string): Promise<ProcessingResult> => {
      try {
          if (!window.PDFLib) throw new Error("PDF Engine not loaded");
          const arrayBuffer = await file.file.arrayBuffer();
          const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer, { password });
          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          return { success: true, downloadUrl: URL.createObjectURL(blob), fileName: `unlocked_${file.file.name}`, fileSize: formatSize(blob.size) };
      } catch (err: any) { throw new Error("Unlock failed. Check password."); }
  },

  flatten: async (file: UploadedFile): Promise<ProcessingResult> => {
      try {
          if (!window.PDFLib) throw new Error("PDF Engine not loaded");
          const arrayBuffer = await file.file.arrayBuffer();
          const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
          const form = pdfDoc.getForm();
          try { form.flatten(); } catch (e) {}
          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          return { success: true, downloadUrl: URL.createObjectURL(blob), fileName: `flattened_${file.file.name}`, fileSize: formatSize(blob.size) };
      } catch (err: any) { throw new Error("Flatten failed: " + err.message); }
  },

  addPageNumbers: async (file: UploadedFile, options: any): Promise<ProcessingResult> => {
      try {
          if (!window.PDFLib) throw new Error("PDF Engine not loaded");
          const arrayBuffer = await file.file.arrayBuffer();
          const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
          const pages = pdfDoc.getPages();
          const { rgb } = window.PDFLib;
          pages.forEach((page: any, idx: number) => {
              const { width } = page.getSize();
              const num = options.startFrom + idx;
              let text = `${num}`;
              if (options.format === 'page n') text = `Page ${num}`;
              if (options.format === 'page n of m') text = `Page ${num} of ${pages.length}`;
              page.drawText(text, { x: width / 2 - 20, y: 20, size: 12, color: rgb(0, 0, 0) });
          });
          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          return { success: true, downloadUrl: URL.createObjectURL(blob), fileName: `numbered_${file.file.name}`, fileSize: formatSize(blob.size) };
      } catch (err: any) { throw new Error("Page numbering failed: " + err.message); }
  },

  repair: async (file: UploadedFile): Promise<ProcessingResult> => {
      try {
          if (!window.PDFLib) throw new Error("PDF Engine not loaded");
          const arrayBuffer = await file.file.arrayBuffer();
          const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          return { success: true, downloadUrl: URL.createObjectURL(blob), fileName: `repaired_${file.file.name}`, fileSize: formatSize(blob.size) };
      } catch (err: any) { throw new Error("Repair failed: " + err.message); }
  },

  sign: async (file: UploadedFile, signatureDataUrl: string): Promise<ProcessingResult> => {
      try {
          if (!window.PDFLib) throw new Error("PDF Engine not loaded");
          const arrayBuffer = await file.file.arrayBuffer();
          const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
          const pages = pdfDoc.getPages();
          const lastPage = pages[pages.length - 1];
          const { width } = lastPage.getSize();
          const image = await pdfDoc.embedPng(signatureDataUrl);
          const dims = image.scale(0.5);
          lastPage.drawImage(image, { x: width / 2 - dims.width / 2, y: 50, width: dims.width, height: dims.height });
          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          return { success: true, downloadUrl: URL.createObjectURL(blob), fileName: `signed_${file.file.name}`, fileSize: formatSize(blob.size) };
      } catch (err: any) { throw new Error("Signing failed: " + err.message); }
  },

  grayscale: async (file: UploadedFile, onProgress?: (msg: string) => void): Promise<ProcessingResult> => {
      try {
          if (!window.pdfjsLib || !window.jspdf) throw new Error("Engines not loaded");
          
          const { jsPDF } = window.jspdf;
          const arrayBuffer = await file.file.arrayBuffer();
          const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
          const doc = new jsPDF();
          
          // Clear default first page
          doc.deletePage(1);

          for (let i = 1; i <= pdf.numPages; i++) {
              onProgress && onProgress(`Processing page ${i} of ${pdf.numPages}...`);
              
              const page = await pdf.getPage(i);
              const viewport = page.getViewport({ scale: 1.5 }); // Good balance of quality/speed
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              
              if (!ctx) throw new Error("Canvas context failed");
              
              await page.render({ canvasContext: ctx, viewport }).promise;
              
              // Apply Grayscale Filter manually
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const data = imageData.data;
              for (let j = 0; j < data.length; j += 4) {
                  const avg = (data[j] + data[j + 1] + data[j + 2]) / 3;
                  data[j] = avg;     // R
                  data[j + 1] = avg; // G
                  data[j + 2] = avg; // B
              }
              ctx.putImageData(imageData, 0, 0);
              
              const imgData = canvas.toDataURL('image/jpeg', 0.8);
              
              // Add to PDF
              doc.addPage([viewport.width, viewport.height], viewport.width > viewport.height ? 'l' : 'p');
              doc.addImage(imgData, 'JPEG', 0, 0, viewport.width * 0.264583, viewport.height * 0.264583); // px to mm approx
          }
          
          const blob = doc.output('blob');
          return { success: true, downloadUrl: URL.createObjectURL(blob), fileName: `grayscale_${file.file.name}`, fileSize: formatSize(blob.size) };
      } catch (err: any) { throw new Error("Grayscale failed: " + err.message); }
  },

  ocr: async (file: UploadedFile, lang: string, onProgress?: (msg: string) => void): Promise<ProcessingResult> => {
      if (!window.Tesseract) throw new Error("OCR Engine not loaded");
      // Use thumbnail generator for first page for demo speed, or loop all pages for full text
      // For this implementation, we'll do the first page to keep it responsive.
      const thumb = await docService.generateThumbnail(file.file);
      const result = await window.Tesseract.recognize(thumb, lang, { logger: (m: any) => onProgress && onProgress(m.status) });
      const blob = new Blob([result.data.text], { type: 'text/plain' });
      return { success: true, downloadUrl: URL.createObjectURL(blob), fileName: `ocr_${file.file.name}.txt`, fileSize: formatSize(blob.size) };
  },

  extractImages: async (file: UploadedFile, onProgress?: (msg: string) => void): Promise<ProcessingResult> => {
      if (!window.JSZip || !window.pdfjsLib) throw new Error("Engine not loaded");
      const arrayBuffer = await file.file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
      const zip = new window.JSZip();
      for (let i=0; i<pdf.numPages; i++) {
          onProgress && onProgress(`Extracting page ${i+1}...`);
          const page = await pdf.getPage(i+1);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;
          const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.9));
          zip.file(`image_${i+1}.jpg`, blob);
      }
      const zipContent = await zip.generateAsync({ type: "blob" });
      return { success: true, downloadUrl: URL.createObjectURL(zipContent), fileName: `images_${file.file.name}.zip`, fileSize: formatSize(zipContent.size) };
  },

  getMetadata: async (file: File): Promise<any> => {
      if (!window.PDFLib) throw new Error("PDF Engine not loaded");
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      return {
          title: pdfDoc.getTitle() || '',
          author: pdfDoc.getAuthor() || '',
          subject: pdfDoc.getSubject() || '',
          keywords: pdfDoc.getKeywords() || '',
          creator: pdfDoc.getCreator() || '',
          producer: pdfDoc.getProducer() || ''
      };
  },

  setMetadata: async (file: File, meta: any) => {
    try {
        if (!window.PDFLib) throw new Error("PDF Engine not loaded");
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
        if(meta.title) pdfDoc.setTitle(meta.title);
        if(meta.author) pdfDoc.setAuthor(meta.author);
        if(meta.subject) pdfDoc.setSubject(meta.subject);
        if(meta.keywords) pdfDoc.setKeywords(meta.keywords.split(',').map((k: string) => k.trim()));
        if(meta.producer) pdfDoc.setProducer(meta.producer);
        if(meta.creator) pdfDoc.setCreator(meta.creator);
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        return { success: true, downloadUrl: URL.createObjectURL(blob), fileName: `meta_${file.name}`, fileSize: formatSize(blob.size) };
    } catch (err: any) { throw new Error("Failed to save metadata: " + err.message); }
  },

  htmlToPdf: async (htmlContent: string, isUrl: boolean = false): Promise<ProcessingResult> => {
      try {
          if (!window.html2canvas) throw new Error("Rendering engine not loaded");
          if (!window.jspdf) throw new Error("PDF Engine not loaded");
          const container = document.createElement('div');
          container.style.position = 'fixed'; container.style.top = '-9999px'; container.style.width = '1200px'; container.style.backgroundColor = '#ffffff';
          document.body.appendChild(container);
          container.innerHTML = htmlContent;
          const canvas = await window.html2canvas(container, { scale: 2, useCORS: true, logging: false });
          document.body.removeChild(container);
          const imgData = canvas.toDataURL('image/jpeg', 0.9);
          const { jsPDF } = window.jspdf;
          const imgWidth = 210; const pageHeight = 295; const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          const doc = new jsPDF('p', 'mm');
          let position = 0;
          doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          while (heightLeft >= 0) { position = heightLeft - imgHeight; doc.addPage(); doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight); heightLeft -= pageHeight; }
          const blob = doc.output('blob');
          return { success: true, downloadUrl: URL.createObjectURL(blob), fileName: `web_convert_${Date.now()}.pdf`, fileSize: formatSize(blob.size) };
      } catch (err: any) { throw new Error("HTML Conversion failed: " + err.message); }
  },

  convertToPdfA: async (file: UploadedFile): Promise<ProcessingResult> => {
      try {
          if (!window.PDFLib) throw new Error("PDF Engine not loaded");
          const arrayBuffer = await file.file.arrayBuffer();
          const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          return { success: true, downloadUrl: URL.createObjectURL(blob), fileName: `pdfa_${file.file.name}`, fileSize: formatSize(blob.size) };
      } catch (err: any) { throw new Error("PDF/A Conversion failed: " + err.message); }
  },

  redact: async (file: UploadedFile, rects: {page: number, x: number, y: number, w: number, h: number}[]): Promise<ProcessingResult> => {
      try {
          if (!window.PDFLib) throw new Error("PDF Engine not loaded");
          const arrayBuffer = await file.file.arrayBuffer();
          const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
          const { rgb } = window.PDFLib;
          const pages = pdfDoc.getPages();
          rects.forEach(r => {
              if (pages[r.page]) {
                  const page = pages[r.page];
                  const { height } = page.getSize();
                  page.drawRectangle({
                      x: r.x,
                      y: height - r.y - r.h,
                      width: r.w,
                      height: r.h,
                      color: rgb(0,0,0)
                  });
              }
          });
          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          return { success: true, downloadUrl: URL.createObjectURL(blob), fileName: `redacted_${file.file.name}`, fileSize: formatSize(blob.size) };
      } catch (err: any) { throw new Error("Redaction failed: " + err.message); }
  }
};

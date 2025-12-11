
export const APP_NAME = "FreePDFtools";
export const CONTACT_EMAIL = "support@freepdftools.com";

export const ALLOWED_EXTENSIONS = {
  document: ['.pdf', '.docx', '.pptx', '.doc', '.xlsx', '.xls'],
  image: ['.jpg', '.jpeg', '.png'],
};

export const ROUTES = {
  HOME: '/',
  CONVERT: '/convert',
  COMPRESS: '/compress',
  MERGE: '/merge',
  SPLIT: '/split',
  ROTATE: '/rotate',
  WATERMARK: '/watermark',
  RESIZE: '/resize',
  CROP: '/crop',
  ORGANIZE: '/organize',
  PROTECT: '/protect',
  UNLOCK: '/unlock',
  PAGE_NUMBERS: '/page-numbers',
  REPAIR: '/repair',
  SIGN: '/sign',
  GRAYSCALE: '/grayscale',
  FLATTEN: '/flatten',
  OCR: '/ocr',
  EXTRACT_IMAGES: '/extract-images',
  EDIT_METADATA: '/edit-metadata',
  HTML_TO_PDF: '/html-to-pdf',
  PDF_TO_PDFA: '/pdf-to-pdfa',
  INVOICE_GENERATOR: '/invoice-generator',
  REDACT: '/redact',
  GUIDES: '/guides',
  PRIVACY: '/privacy-policy',
  TERMS: '/terms',
  ABOUT: '/about',
};

export const PAPER_SIZES = {
  A4: { width: 595.28, height: 841.89 },
  A3: { width: 841.89, height: 1190.55 },
  A5: { width: 419.53, height: 595.28 },
  Letter: { width: 612.00, height: 792.00 },
  Legal: { width: 612.00, height: 1008.00 },
};

export const AD_SLOTS = {
  SIDEBAR: "1234567890",
  HEADER: "0987654321",
  REWARDED: "1122334455",
  HOME_MID: "2233445566",
  TOOL_BOTTOM: "3344556677"
};

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy

Single-page React app with a small set of Vercel serverless functions for heavy processing. Лёгкие инструменты остаются в браузере, тяжёлые (сжатие, DOCX/XLSX→PDF, HTML Pro, OCR, PDF/A) идут на serverless.

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   `npm install`
2. Start the dev server:
   `npm run dev`
3. The API routes under `api/` run on Vercel (or via `vercel dev`). The Vite dev server serves the SPA; API calls should target a running Vercel function instance in local or deployed mode. Никаких внешних API-ключей не требуется.

**Dependencies used on the backend:** `pdf-lib`, `pdfjs-dist` + `@napi-rs/canvas`, `sharp`, `mammoth`, `xlsx`, `pdfkit`, `tesseract.js`. Все работают в среде Vercel без сторонних сервисов.

## Синхронизация с GitHub

Текущая копия собрана на локальной ветке `work` без привязанного удалённого репозитория, поэтому изменения не появляются на GitHub автоматически. Чтобы обновления дошли до GitHub и попали в сборку Vercel:

1. Добавьте удалённый репозиторий (замените URL на нужный):
   ```bash
   git remote add origin https://github.com/xixlyanka/PDFv.2.git
   ```
2. Убедитесь, что на GitHub есть ветка `main` (или создайте её), и опубликуйте локальные коммиты:
   ```bash
   git push -u origin work:main
   ```
3. После первого пуша можно продолжать отправлять обновления командой `git push` — они будут попадать в GitHub и использоваться в автоматических сборках.

## API endpoints (Vercel serverless)

- `POST /api/compress` — серверное сжатие PDF (без внешних API), принимает `file` и `level`.
- `POST /api/convert-docx` — DOCX/XLSX → PDF через `mammoth`, `xlsx` и `pdfkit` на сервере.
- `POST /api/html-to-pdf` — серверный экспорт HTML в PDF (строка в поле `html` или загруженный файл).
- `POST /api/ocr` — извлечение текста из PDF на сервере (multi-page OCR, без внешних сервисов; есть graceful fallback на текстовый парсинг при сбое OCR).
- `POST /api/pdfa` — пересохранение PDF в совместимом варианте PDF/A.

Файлы принимаются как `multipart/form-data` (поле `file`). Ошибки возвращаются в JSON с ключом `error`.

## Где работает сервер, а где браузер

- **Server-side:** Compress (PDF), DOCX/XLSX→PDF (Pro), HTML→PDF (Pro режим), OCR полный режим (все страницы), PDF→PDF/A. Файлы отправляются на серверless-обработку, обрабатываются и сразу удаляются.
- **Client-side:** Merge/Split/Rotate/Resize/Crop/Organize/Protect/Unlock/Flatten/Page Numbers/Redact/Sign/Metadata/Extract Images/Grayscale, быстрый OCR (1-я страница), базовый HTML→PDF. Файлы не покидают устройство.

## Что изменилось

- Добавлены serverless-функции в `api/` для тяжёлых операций (compress, DOCX/XLSX → PDF, OCR, HTML→PDF, PDF/A) без сторонних сервисов.
- `docService` умеет отправлять файлы на backend через универсальный helper и откатываться на клиентский путь при сбое.
- В инструментах обновлены подсказки/бейджи: серверные операции помечены, клиентские остались без изменений в UI.
- OCR получил два режима: быстрый локальный и полный серверный.
- README обновлён под гибридную архитектуру (SPA + serverless), без требований к внешним ключам.

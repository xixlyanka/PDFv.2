<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Wgs8hbFDdKuV0VrIKVvQ30WJ-bV2O4ZK

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

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

## Что изменилось

- Добавлена базовая таблица стилей `index.css`, чтобы ссылка из `index.html` всегда резолвилась, а минимальные глобальные стили применялись как в dev, так и на продакшене.
- Точка входа (`index.tsx`) теперь импортирует провайдеры напрямую из корневых файлов контекстов, поэтому билд больше не зависит от наличия каталога `contexts/` и проходит без ошибок резолва модулей.
- Добавлен механизм ожидания загрузки библиотек для обработки PDF/изображений (`libInit.ts`), чтобы инструменты (сжатие, конвертация, OCR и др.) не стартовали, пока необходимые движки из CDN не загрузились.
- Добавлен серверный эндпоинт `/api/convert-docx`, который отправляет DOCX в внешний конвертер (ConvertAPI по умолчанию) и возвращает готовый PDF. Фронтенд теперь сначала пробует этот путь, а при ошибке откатывается к прежней клиентской конвертации через `mammoth`.
- Добавлен эндпоинт `/api/log`, принимающий события использования (convert/compress и т.д.) и пишущий их в ` /tmp/usage-log.jsonl` на стороне функции. `docService` отправляет best-effort логи для конверсий.

## Настройка серверных эндпоинтов

- Создайте переменную среды `DOCX_CONVERT_API_SECRET` — секрет для ConvertAPI или совместимого сервиса. Опционально можно указать `DOCX_CONVERT_API_ENDPOINT`, если требуется другой URL.
- Эндпоинты размещены в `api/`, поэтому при деплое на Vercel будут работать как serverless-функции. Фронтенд вызывает `/api/convert-docx` для DOCX → PDF, что снимает нагрузку с браузера.

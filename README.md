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

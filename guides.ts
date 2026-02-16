import { Language } from '@/translations';

export interface Guide {
  id: string;
  slug: string;
  category: string;
  date: string;
  translations: {
    [key in Language]?: {
        title: string;
        excerpt: string;
        content: string;
        readTime: string;
    }
  }
}

export const guides: Guide[] = [
  {
    id: '1',
    slug: 'how-to-compress-pdf',
    category: 'Compress',
    date: 'Oct 24, 2023',
    translations: {
        en: {
            title: 'How to Compress PDF Files for Email',
            excerpt: 'Learn how to reduce PDF file size without losing quality so you can send them via email easily.',
            readTime: '3 min read',
            content: `
              <h2>Why Compress PDFs?</h2>
              <p>Large PDF files can be a hassle. Email providers like Gmail often limit attachments to 25MB. If your report or portfolio is larger than that, you need to compress it.</p>
              
              <h3>Step 1: Upload your file</h3>
              <p>Go to the <strong>Compress PDF</strong> tool on FreePDFtools. Drag and drop your file into the box.</p>
              
              <h3>Step 2: Choose Compression Level</h3>
              <p>Use the slider to select your desired quality. 
              <ul>
                <li><strong>Low Compression (0-30%):</strong> Best for printing. High quality, larger file size.</li>
                <li><strong>Medium Compression (30-70%):</strong> Good for viewing on screens. Balanced size.</li>
                <li><strong>High Compression (70-100%):</strong> Best for email. Smallest size, lower quality images.</li>
              </ul>
              </p>
              
              <h3>Step 3: Download</h3>
              <p>Click "Compress PDF" and wait a moment. Our browser-based engine will optimize the file structure. Once done, request your download!</p>
            `
        },
        ru: {
            title: 'Как сжать PDF файл для отправки по почте',
            excerpt: 'Узнайте, как уменьшить размер PDF файла без потери качества для отправки по электронной почте.',
            readTime: '3 мин',
            content: `
              <h2>Зачем сжимать PDF?</h2>
              <p>Большие PDF-файлы — это проблема. Почтовые сервисы, такие как Gmail, ограничивают вложения 25 МБ. Если ваш отчет больше, его нужно сжать.</p>
              
              <h3>Шаг 1: Загрузите файл</h3>
              <p>Перейдите в инструмент <strong>Сжать PDF</strong>. Перетащите файл в окно загрузки.</p>
              
              <h3>Шаг 2: Выберите уровень</h3>
              <p>Используйте ползунок для выбора качества. 
              <ul>
                <li><strong>Слабое сжатие:</strong> Для печати. Лучшее качество.</li>
                <li><strong>Среднее:</strong> Оптимально для просмотра на экране.</li>
                <li><strong>Сильное:</strong> Для отправки по почте. Минимальный размер.</li>
              </ul>
              </p>
            `
        },
        uk: {
            title: 'Як стиснути PDF файл для email',
            excerpt: 'Дізнайтеся, як зменшити розмір PDF файлу без втрати якості для відправки електронною поштою.',
            readTime: '3 хв',
            content: `
              <h2>Навіщо стискати PDF?</h2>
              <p>Великі PDF-файли — це проблема. Gmail обмежує вкладення 25 МБ. Якщо ваш звіт більший, його потрібно стиснути.</p>
              
              <h3>Крок 1: Завантажте файл</h3>
              <p>Перейдіть в інструмент <strong>Стиснути PDF</strong>.</p>
            `
        }
    }
  },
  {
    id: '2',
    slug: 'secure-pdf-password',
    category: 'Security',
    date: 'Oct 28, 2023',
    translations: {
        en: {
            title: 'How to Password Protect Sensitive Documents',
            excerpt: 'Ensure your contracts and personal data are safe by adding strong encryption to your PDFs.',
            readTime: '4 min read',
            content: `
              <h2>Why Security Matters</h2>
              <p>Sending bank statements, legal contracts, or personal ID scans via email is risky. Password protection adds a layer of encryption (AES-256).</p>
              
              <h3>Using the Protect Tool</h3>
              <p>Navigate to the <strong>Protect PDF</strong> page. Upload your document.</p>
              
              <h3>Set a Strong Password</h3>
              <p>Enter a password that includes numbers and symbols. The longer, the better. Our tool processes this locally.</p>
            `
        },
        ru: {
            title: 'Как защитить PDF паролем',
            excerpt: 'Защитите свои контракты и личные данные с помощью надежного шифрования.',
            readTime: '4 мин',
            content: `
              <h2>Зачем нужна защита?</h2>
              <p>Отправка выписок и паспортов по почте небезопасна. Защита паролем добавляет шифрование.</p>
              
              <h3>Используйте инструмент Защиты</h3>
              <p>Перейдите на страницу <strong>Защитить PDF</strong>. Придумайте сложный пароль.</p>
            `
        }
    }
  },
  {
    id: '3',
    slug: 'merge-pdf-files',
    category: 'Merge',
    date: 'Nov 05, 2023',
    translations: {
        en: {
            title: 'Combining Multiple PDFs into One Report',
            excerpt: 'Stop sending 10 separate attachments. Learn how to merge them into a single, professional document.',
            readTime: '2 min read',
            content: `
              <h2>Organize Your Documents</h2>
              <p>Whether it's invoices for tax season or chapters of a thesis, keeping files together is crucial for organization.</p>
              
              <h3>How to Merge</h3>
              <ol>
                <li>Open the <strong>Merge PDF</strong> tool.</li>
                <li>Select multiple files at once or drag them in one by one.</li>
                <li><strong>Reorder:</strong> Use the Up/Down arrows to arrange them in the correct sequence.</li>
                <li>Click "Merge PDFs".</li>
              </ol>
            `
        }
    }
  },
  {
    id: '4',
    slug: 'sign-documents-online',
    category: 'Sign',
    date: 'Nov 12, 2023',
    translations: {
        en: {
            title: 'How to Sign PDF Documents Online Free',
            excerpt: 'No need to print and scan. Draw your signature directly in your browser and apply it to any page.',
            readTime: '3 min read',
            content: `
              <h2>Digital Signatures Made Easy</h2>
              <p>Printing, signing, scanning, and emailing back is a thing of the past. You can now sign documents digitally in seconds.</p>
              
              <h3>Using the Sign Tool</h3>
              <ol>
                <li>Upload your PDF to the <strong>Sign PDF</strong> tool.</li>
                <li>Use your mouse (or finger on mobile) to draw your signature in the box.</li>
                <li>Click "Sign Document". We will place your signature at the bottom of the last page automatically.</li>
              </ol>
            `
        },
        ru: {
            title: 'Как подписать PDF онлайн бесплатно',
            excerpt: 'Не нужно печатать и сканировать. Нарисуйте подпись в браузере и добавьте её на страницу.',
            readTime: '3 мин',
            content: `
              <h2>Электронные подписи — это просто</h2>
              <p>Печать, подпись и сканирование — это прошлое. Подпишите документ за секунды.</p>
              
              <h3>Как использовать</h3>
              <ol>
                <li>Загрузите файл в инструмент <strong>Подписать PDF</strong>.</li>
                <li>Нарисуйте подпись мышкой или пальцем.</li>
                <li>Нажмите "Подписать".</li>
              </ol>
            `
        }
    }
  }
];
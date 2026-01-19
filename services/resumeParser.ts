
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// This is the modern, recommended way for Vite to handle web workers.
// It ensures the worker file is correctly located and bundled in production.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result;
        if (!arrayBuffer || !(arrayBuffer instanceof ArrayBuffer)) {
          return reject(new Error('Failed to read file.'));
        }

        if (fileType === 'application/pdf') {
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer })
            .promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += `${content.items.map((item: any) => item.str).join(' ')}\n`;
          }
          resolve(text);
        } else if (
          fileType ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          const result = await mammoth.extractRawText({ arrayBuffer });
          resolve(result.value);
        } else {
          reject(new Error('Unsupported file type.'));
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
}

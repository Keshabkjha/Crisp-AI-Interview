import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Revert to the robust CDN-based worker for the no-build environment.
// This ensures the resume parser works reliably without a build step.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;


export const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      if (!event.target?.result) {
        return reject(new Error("Failed to read file contents."));
      }

      const arrayBuffer = event.target.result as ArrayBuffer;

      try {
        if (file.type === 'application/pdf') {
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let textContent = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const text = await page.getTextContent();
            textContent += text.items.map((s: any) => s.str).join(' ');
          }
          resolve(textContent);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const result = await mammoth.extractRawText({ arrayBuffer });
          resolve(result.value);
        } else {
          reject(new Error("Unsupported file type. Please upload a PDF or DOCX."));
        }
      } catch (error) {
        console.error("Error parsing file:", error);
        reject(new Error("Failed to parse the document. The file may be invalid, corrupted, or password-protected."));
      }
    };

    reader.onerror = () => reject(new Error("An error occurred while reading the file. Please try again."));
    reader.readAsArrayBuffer(file);
  });
};
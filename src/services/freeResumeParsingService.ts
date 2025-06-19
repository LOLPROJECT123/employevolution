
import * as mammoth from 'mammoth';
import { parseResumeContent } from '@/utils/resume/enhancedResumeParser';
import { ParsedResume } from '@/types/resume';

export interface FreeParsingResult {
  success: boolean;
  text: string;
  parsedData: ParsedResume;
  method: 'pdf-fallback' | 'mammoth' | 'text' | 'fallback';
  error?: string;
}

export class FreeResumeParsingService {
  async parseResume(file: File): Promise<FreeParsingResult> {
    try {
      let extractedText = '';
      let method: 'pdf-fallback' | 'mammoth' | 'text' | 'fallback' = 'fallback';

      // Handle PDF files with basic text extraction
      if (file.type === 'application/pdf') {
        method = 'pdf-fallback';
        extractedText = await this.extractTextFromPDF(file);
      }
      // Handle DOCX files with mammoth
      else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        method = 'mammoth';
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      }
      // Handle plain text files
      else if (file.type === 'text/plain') {
        method = 'text';
        extractedText = await this.readTextFile(file);
      }
      // Fallback for other file types
      else {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      // Parse the extracted text into structured data
      const parsedData = parseResumeContent(extractedText);

      return {
        success: true,
        text: extractedText,
        parsedData,
        method
      };

    } catch (error) {
      console.error('Free resume parsing failed:', error);
      return {
        success: false,
        text: '',
        parsedData: this.getEmptyResumeStructure(),
        method: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown parsing error'
      };
    }
  }

  private async extractTextFromPDF(file: File): Promise<string> {
    // Simple browser-compatible PDF text extraction
    // This is a basic approach that tries to extract readable text from PDF bytes
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          let text = '';
          
          // Basic text extraction by looking for readable characters
          // This is simplified and won't work for all PDFs, especially image-based ones
          for (let i = 0; i < uint8Array.length - 1; i++) {
            const char = String.fromCharCode(uint8Array[i]);
            // Look for printable ASCII characters and common symbols
            if (char.match(/[a-zA-Z0-9\s@.\-(),:;!?'"]/)) {
              text += char;
            }
          }
          
          // Clean up the extracted text
          text = text
            .replace(/\s+/g, ' ')
            .replace(/[^\x20-\x7E\n]/g, '')
            .trim();
          
          // If we got very little text, provide a helpful message
          if (text.length < 50) {
            text = 'PDF text extraction was limited. Please consider using a DOCX or TXT file for better results, or complete your profile manually.';
          }
          
          resolve(text);
        } catch (error) {
          console.error('PDF text extraction error:', error);
          resolve('Unable to extract text from PDF. Please try a different file format or fill in manually.');
        }
      };
      
      reader.onerror = () => {
        resolve('Error reading PDF file. Please try a different file format.');
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  private async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          resolve(event.target.result);
        } else {
          reject(new Error('Failed to read text file'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }

  private getEmptyResumeStructure(): ParsedResume {
    return {
      personalInfo: {
        name: '',
        email: '',
        phone: '',
        location: '',
        dateOfBirth: ''
      },
      workExperiences: [],
      education: [],
      projects: [],
      skills: [],
      languages: [],
      socialLinks: {
        linkedin: '',
        github: '',
        portfolio: '',
        other: ''
      },
      activities: []
    };
  }
}

export const freeResumeParsingService = new FreeResumeParsingService();

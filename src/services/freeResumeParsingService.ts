
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import { parseResumeContent } from '@/utils/resume/enhancedResumeParser';
import { ParsedResume } from '@/types/resume';

export interface FreeParsingResult {
  success: boolean;
  text: string;
  parsedData: ParsedResume;
  method: 'pdf-parse' | 'mammoth' | 'text' | 'fallback';
  error?: string;
}

export class FreeResumeParsingService {
  async parseResume(file: File): Promise<FreeParsingResult> {
    try {
      let extractedText = '';
      let method: 'pdf-parse' | 'mammoth' | 'text' | 'fallback' = 'fallback';

      // Handle PDF files with pdf-parse
      if (file.type === 'application/pdf') {
        method = 'pdf-parse';
        const arrayBuffer = await file.arrayBuffer();
        // Convert Uint8Array to Buffer for pdf-parse
        const buffer = Buffer.from(arrayBuffer);
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
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

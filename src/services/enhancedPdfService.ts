
import { ocrService, OCRResult, OCRProgress } from './ocrService';

export interface PDFProcessingOptions {
  onProgress?: (progress: OCRProgress) => void;
  useOCRFallback?: boolean;
  minTextThreshold?: number;
}

export interface PDFProcessingResult {
  text: string;
  method: 'text-extraction' | 'ocr' | 'hybrid';
  confidence: number;
  pageCount: number;
  success: boolean;
  error?: string;
}

class EnhancedPdfService {
  async processPDF(file: File, options: PDFProcessingOptions = {}): Promise<PDFProcessingResult> {
    const { onProgress, useOCRFallback = true, minTextThreshold = 100 } = options;
    
    try {
      console.log('Starting PDF processing for:', file.name);
      
      // First, try basic text extraction
      onProgress?.({
        status: 'extracting-text',
        progress: 25,
        message: 'Extracting text from PDF...'
      });

      const textExtractionResult = await this.extractTextFromPDF(file);
      
      // Check if we got sufficient text
      if (textExtractionResult.length > minTextThreshold) {
        console.log('PDF text extraction successful, sufficient text found');
        return {
          text: textExtractionResult,
          method: 'text-extraction',
          confidence: 95,
          pageCount: 1, // We'll improve page counting later
          success: true
        };
      }

      // If text extraction yielded poor results and OCR fallback is enabled
      if (useOCRFallback) {
        console.log('Text extraction yielded poor results, falling back to OCR');
        
        onProgress?.({
          status: 'converting-to-images',
          progress: 50,
          message: 'Converting PDF to images for OCR...'
        });

        // Convert PDF to images and process with OCR
        const ocrResult = await this.processPDFWithOCR(file, {
          onProgress: (progress) => {
            onProgress?.({
              ...progress,
              progress: 50 + (progress.progress * 0.5) // Adjust progress range
            });
          }
        });

        if (ocrResult.success && ocrResult.text.length > 50) {
          return {
            text: ocrResult.text,
            method: 'ocr',
            confidence: ocrResult.confidence,
            pageCount: 1,
            success: true
          };
        }

        // If both methods found some text, combine them
        if (textExtractionResult.length > 0 && ocrResult.text.length > 0) {
          const combinedText = `${textExtractionResult}\n\n${ocrResult.text}`;
          return {
            text: combinedText,
            method: 'hybrid',
            confidence: Math.max(50, ocrResult.confidence),
            pageCount: 1,
            success: true
          };
        }
      }

      // If all methods failed
      return {
        text: textExtractionResult || 'Could not extract text from PDF',
        method: 'text-extraction',
        confidence: 0,
        pageCount: 1,
        success: false,
        error: 'Unable to extract sufficient text from PDF'
      };

    } catch (error) {
      console.error('PDF processing failed:', error);
      return {
        text: '',
        method: 'text-extraction',
        confidence: 0,
        pageCount: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown PDF processing error'
      };
    }
  }

  private async extractTextFromPDF(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          let text = '';
          
          // Basic text extraction - this is a simplified approach
          // In production, you'd want to use pdf-parse or PDF.js
          for (let i = 0; i < uint8Array.length; i++) {
            const char = String.fromCharCode(uint8Array[i]);
            if (char.match(/[a-zA-Z0-9\s@.\-()]/)) {
              text += char;
            }
          }
          
          // Clean up the extracted text
          text = text
            .replace(/\s+/g, ' ')
            .replace(/[^\x20-\x7E]/g, '')
            .trim();
          
          resolve(text);
        } catch (error) {
          console.error('Text extraction error:', error);
          resolve('');
        }
      };
      
      reader.onerror = () => resolve('');
      reader.readAsArrayBuffer(file);
    });
  }

  private async processPDFWithOCR(
    file: File, 
    options: { onProgress?: (progress: OCRProgress) => void }
  ): Promise<OCRResult> {
    try {
      // For now, we'll treat the PDF as an image file for OCR
      // In a full implementation, you'd use PDF.js to convert each page to canvas/image
      // and then process each page separately
      
      return await ocrService.processImage(file, {
        preprocessImage: true,
        onProgress: options.onProgress
      });
    } catch (error) {
      console.error('PDF OCR processing failed:', error);
      return {
        text: '',
        confidence: 0,
        success: false,
        error: error instanceof Error ? error.message : 'PDF OCR failed'
      };
    }
  }

  async isPDFImageBased(file: File): Promise<boolean> {
    try {
      const textExtractionResult = await this.extractTextFromPDF(file);
      // If we get very little text, it's likely image-based
      return textExtractionResult.length < 100;
    } catch {
      return true; // Assume image-based if we can't extract text
    }
  }
}

export const enhancedPdfService = new EnhancedPdfService();

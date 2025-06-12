
import Tesseract from 'tesseract.js';

export interface OCRProgress {
  status: string;
  progress: number;
  message: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  success: boolean;
  error?: string;
}

export interface OCROptions {
  language?: string;
  onProgress?: (progress: OCRProgress) => void;
  preprocessImage?: boolean;
}

class OCRService {
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.worker = await Tesseract.createWorker('eng', 1, {
        logger: m => console.log('OCR Logger:', m)
      });

      await this.worker.setParameters({
        tessedit_page_seg_mode: Tesseract.PSM.AUTO,
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?@#$%^&*()_+-=[]{}|;:,.<>? \n\t',
      });

      this.isInitialized = true;
      console.log('OCR Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR service:', error);
      throw new Error('OCR initialization failed');
    }
  }

  async processImage(
    imageData: File | HTMLImageElement | HTMLCanvasElement | string,
    options: OCROptions = {}
  ): Promise<OCRResult> {
    try {
      await this.initialize();
      
      if (!this.worker) {
        throw new Error('OCR worker not initialized');
      }

      const { language = 'eng', onProgress, preprocessImage = true } = options;

      // Preprocess image if requested
      let processedImageData = imageData;
      if (preprocessImage && imageData instanceof File) {
        processedImageData = await this.preprocessImage(imageData);
      }

      console.log('Starting OCR processing...');
      
      // Simulate progress updates since we can't use logger in recognize options
      if (onProgress) {
        onProgress({
          status: 'recognizing text',
          progress: 25,
          message: 'Starting text recognition...'
        });
      }

      const { data } = await this.worker.recognize(processedImageData);

      console.log('OCR processing completed');

      // Final progress update
      if (onProgress) {
        onProgress({
          status: 'recognizing text',
          progress: 100,
          message: 'Text recognition completed!'
        });
      }

      return {
        text: data.text.trim(),
        confidence: data.confidence,
        success: true
      };

    } catch (error) {
      console.error('OCR processing failed:', error);
      return {
        text: '',
        confidence: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown OCR error'
      };
    }
  }

  private async preprocessImage(file: File): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply preprocessing filters
        this.enhanceContrast(data);
        this.convertToGrayscale(data);
        this.sharpenImage(data, canvas.width, canvas.height);

        // Put processed data back
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas);
      };

      img.onerror = () => reject(new Error('Failed to load image for preprocessing'));
      img.src = URL.createObjectURL(file);
    });
  }

  private enhanceContrast(data: Uint8ClampedArray): void {
    const factor = 1.5; // Contrast enhancement factor
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));     // Red
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128)); // Green
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128)); // Blue
    }
  }

  private convertToGrayscale(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;     // Red
      data[i + 1] = gray; // Green
      data[i + 2] = gray; // Blue
    }
  }

  private sharpenImage(data: Uint8ClampedArray, width: number, height: number): void {
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];

    const side = Math.round(Math.sqrt(kernel.length));
    const halfSide = Math.floor(side / 2);
    const src = new Uint8ClampedArray(data);

    for (let y = halfSide; y < height - halfSide; y++) {
      for (let x = halfSide; x < width - halfSide; x++) {
        const pixelIndex = (y * width + x) * 4;
        let r = 0, g = 0, b = 0;

        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = y + cy - halfSide;
            const scx = x + cx - halfSide;
            const srcIndex = (scy * width + scx) * 4;
            const wt = kernel[cy * side + cx];

            r += src[srcIndex] * wt;
            g += src[srcIndex + 1] * wt;
            b += src[srcIndex + 2] * wt;
          }
        }

        data[pixelIndex] = Math.min(255, Math.max(0, r));
        data[pixelIndex + 1] = Math.min(255, Math.max(0, g));
        data[pixelIndex + 2] = Math.min(255, Math.max(0, b));
      }
    }
  }

  private getProgressMessage(status: string, progress: number): string {
    const percentage = Math.round(progress * 100);
    
    switch (status) {
      case 'loading tesseract core':
        return 'Loading OCR engine...';
      case 'initializing tesseract':
        return 'Initializing text recognition...';
      case 'loading language traineddata':
        return 'Loading language data...';
      case 'initializing api':
        return 'Setting up OCR API...';
      case 'recognizing text':
        return `Scanning document... ${percentage}%`;
      default:
        return `Processing... ${percentage}%`;
    }
  }

  async detectImageText(file: File): Promise<boolean> {
    try {
      // Quick confidence check - if OCR finds text with reasonable confidence,
      // we assume this is an image-based document
      const result = await this.processImage(file, { preprocessImage: false });
      return result.success && result.confidence > 60 && result.text.length > 50;
    } catch {
      return false;
    }
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

export const ocrService = new OCRService();

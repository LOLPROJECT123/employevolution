
import { ParsedResume } from "@/types/resume";
import { parseResumeContent } from "./resume/enhancedResumeParser";
import { ocrService, OCRProgress } from "@/services/ocrService";
import { enhancedPdfService } from "@/services/enhancedPdfService";
import { toast } from "sonner";

export interface EnhancedParsingOptions {
  showToast?: boolean;
  onProgress?: (progress: OCRProgress) => void;
  useOCR?: boolean;
}

// Supported file types for different processing methods
const TEXT_BASED_TYPES = ['text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff'];
const PDF_TYPE = 'application/pdf';

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        resolve(event.target.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};

export const parseResumeEnhanced = async (
  file: File, 
  options: EnhancedParsingOptions = {}
): Promise<ParsedResume> => {
  const { showToast = false, onProgress, useOCR = true } = options;
  
  try {
    console.log('Starting enhanced resume parsing for file:', file.name, 'Type:', file.type);
    
    let extractedText = '';
    let processingMethod = 'unknown';
    
    // Determine processing strategy based on file type
    if (PDF_TYPE === file.type) {
      console.log('Processing PDF file...');
      processingMethod = 'pdf';
      
      const pdfResult = await enhancedPdfService.processPDF(file, {
        onProgress,
        useOCRFallback: useOCR,
        minTextThreshold: 100
      });
      
      extractedText = pdfResult.text;
      
      if (showToast) {
        if (pdfResult.success) {
          toast.success(`PDF processed using ${pdfResult.method}. Confidence: ${pdfResult.confidence}%`);
        } else {
          toast.warning('PDF processing had issues, but continuing with available text.');
        }
      }
      
    } else if (IMAGE_TYPES.includes(file.type) && useOCR) {
      console.log('Processing image file with OCR...');
      processingMethod = 'ocr';
      
      onProgress?.({
        status: 'initializing',
        progress: 0,
        message: 'Initializing OCR for image processing...'
      });
      
      const ocrResult = await ocrService.processImage(file, {
        preprocessImage: true,
        onProgress
      });
      
      if (ocrResult.success) {
        extractedText = ocrResult.text;
        
        if (showToast) {
          toast.success(`Image processed with ${ocrResult.confidence}% confidence`);
        }
      } else {
        throw new Error(ocrResult.error || 'OCR processing failed');
      }
      
    } else if (TEXT_BASED_TYPES.includes(file.type)) {
      console.log('Processing text-based file...');
      processingMethod = 'text';
      
      onProgress?.({
        status: 'reading-file',
        progress: 50,
        message: 'Reading text file...'
      });
      
      extractedText = await readFileAsText(file);
      
    } else {
      console.log('Unsupported file type, attempting OCR fallback...');
      
      if (useOCR) {
        processingMethod = 'ocr-fallback';
        
        const ocrResult = await ocrService.processImage(file, {
          preprocessImage: true,
          onProgress
        });
        
        if (ocrResult.success) {
          extractedText = ocrResult.text;
        } else {
          throw new Error('Unsupported file type and OCR fallback failed');
        }
      } else {
        throw new Error(`Unsupported file type: ${file.type}`);
      }
    }

    console.log(`Text extraction complete. Method: ${processingMethod}, Length: ${extractedText.length}`);

    // Progress update for parsing phase
    onProgress?.({
      status: 'parsing-content',
      progress: 90,
      message: 'Parsing resume content...'
    });

    // Use the enhanced parser to extract structured data
    const parsedData = parseResumeContent(extractedText);
    console.log('Enhanced parsing complete:', parsedData);

    // Validate and ensure we have a proper structure
    const validatedData: ParsedResume = {
      personalInfo: {
        name: parsedData.personalInfo?.name || "",
        email: parsedData.personalInfo?.email || "",
        phone: parsedData.personalInfo?.phone || "",
        location: parsedData.personalInfo?.location || ""
      },
      workExperiences: parsedData.workExperiences || [],
      education: parsedData.education || [],
      projects: parsedData.projects || [],
      skills: parsedData.skills || [],
      languages: parsedData.languages || [],
      socialLinks: parsedData.socialLinks || {
        linkedin: "",
        github: "",
        portfolio: "",
        other: ""
      },
      activities: parsedData.activities || []
    };

    // Final progress update
    onProgress?.({
      status: 'complete',
      progress: 100,
      message: 'Resume parsing completed!'
    });

    if (showToast) {
      if (validatedData.personalInfo.name || validatedData.workExperiences.length > 0) {
        toast.success(`Resume parsed successfully! Extracted ${validatedData.workExperiences.length} work experiences and ${validatedData.skills.length} skills.`);
      } else {
        toast.success("Resume uploaded! Please complete your profile information manually.");
      }
    }

    return validatedData;

  } catch (error) {
    console.error("Enhanced resume parsing error:", error);
    
    if (showToast) {
      if (error instanceof Error) {
        toast.error(`Resume parsing failed: ${error.message}`);
      } else {
        toast.error("Resume parsing failed. Please try again or fill in manually.");
      }
    }
    
    // Return a default structure that allows the user to proceed
    return {
      personalInfo: {
        name: "",
        email: "",
        phone: "",
        location: ""
      },
      workExperiences: [],
      education: [],
      projects: [],
      skills: [],
      languages: [],
      socialLinks: {
        linkedin: "",
        github: "",
        portfolio: "",
        other: ""
      },
      activities: []
    };
  }
};

// Helper function to check if a file can be processed
export const canProcessFile = (file: File): boolean => {
  const supportedTypes = [...TEXT_BASED_TYPES, ...IMAGE_TYPES, PDF_TYPE];
  return supportedTypes.includes(file.type);
};

// Helper function to determine if OCR will be used
export const willUseOCR = (file: File): boolean => {
  return IMAGE_TYPES.includes(file.type) || file.type === PDF_TYPE;
};

// Helper function to get file processing method
export const getProcessingMethod = (file: File): string => {
  if (file.type === PDF_TYPE) return 'PDF (text extraction + OCR fallback)';
  if (IMAGE_TYPES.includes(file.type)) return 'Image (OCR)';
  if (TEXT_BASED_TYPES.includes(file.type)) return 'Text extraction';
  return 'OCR fallback';
};

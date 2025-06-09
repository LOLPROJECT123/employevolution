import { ParsedResume } from "@/types/resume";
import { parseResumeEnhanced, EnhancedParsingOptions } from "./enhancedResumeParser";

// Keep the original function for backward compatibility
export const parseResume = async (file: File, showToast: boolean = false): Promise<ParsedResume> => {
  const options: EnhancedParsingOptions = {
    showToast,
    useOCR: true
  };
  
  return parseResumeEnhanced(file, options);
};

// Export the enhanced version for new implementations
export { parseResumeEnhanced, canProcessFile, willUseOCR, getProcessingMethod } from "./enhancedResumeParser";

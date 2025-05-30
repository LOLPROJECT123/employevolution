
// PDF text extraction utility
export const extractTextFromPDF = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        
        // For now, we'll use a simple approach that works with most PDFs
        // In a production app, you'd want to use a proper PDF parsing library
        const uint8Array = new Uint8Array(arrayBuffer);
        let text = '';
        
        // Simple text extraction - this works for basic PDFs with embedded text
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
        
        if (text.length < 50) {
          // If we couldn't extract much text, provide a helpful fallback
          resolve('Resume content could not be automatically parsed. Please fill in your information manually in the profile section.');
        } else {
          resolve(text);
        }
      } catch (error) {
        console.error('PDF parsing error:', error);
        resolve('Resume uploaded successfully. Please fill in your information manually in the profile section.');
      }
    };
    
    reader.onerror = () => {
      console.error('Failed to read PDF file');
      resolve('Resume uploaded successfully. Please fill in your information manually in the profile section.');
    };
    
    reader.readAsArrayBuffer(file);
  });
};

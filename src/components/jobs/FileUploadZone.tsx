
import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileText, X, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  acceptedFileTypes?: string;
  maxFileSizeMB?: number;
  fileType: 'resume' | 'cover_letter';
}

export function FileUploadZone({
  onFileSelect,
  acceptedFileTypes = ".pdf,.doc,.docx,.txt,.rtf",
  maxFileSizeMB = 5,
  fileType
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert MB to bytes
  const maxSizeBytes = maxFileSizeMB * 1024 * 1024;

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Check if file is valid
    if (!file) return;

    // Check file type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const isValidType = acceptedFileTypes.includes(fileExtension);
    
    if (!isValidType) {
      toast.error(`Invalid file type. Please upload ${acceptedFileTypes.replace(/,/g, ', ')} files.`);
      return;
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      toast.error(`File size exceeds the ${maxFileSizeMB}MB limit.`);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
    toast.success(`${fileType === 'resume' ? 'Resume' : 'Cover letter'} uploaded successfully!`);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg ${
        isDragging ? 'border-primary bg-primary/10' : 'border-border'
      } transition-colors flex flex-col items-center justify-center p-6 relative`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        className="sr-only"
      />

      {selectedFile ? (
        <div className="w-full">
          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-md">
            <div className="flex items-center space-x-2 truncate">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium truncate">{selectedFile.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRemoveFile} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm font-medium mb-1">
            Drag and drop your {fileType === 'resume' ? 'resume' : 'cover letter'} here
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            PDF, DOC, DOCX, TXT or RTF (max {maxFileSizeMB}MB)
          </p>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleButtonClick}
          >
            Browse files
          </Button>
        </>
      )}
    </div>
  );
}

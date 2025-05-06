
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";

interface ResumeSectionProps {
  onResumeUpload: (file: File) => void;
}

const ResumeSection: React.FC<ResumeSectionProps> = ({ onResumeUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [resume, setResume] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setResume(file);
      onResumeUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setResume(file);
      onResumeUpload(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Resume</h2>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Upload Resume
        </Button>
      </div>

      <Card 
        className={`border-2 border-dashed p-8 text-center ${
          isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
            <Upload className="h-8 w-8 text-gray-500" />
          </div>
          <div>
            <h3 className="font-medium">Drag & drop your resume here</h3>
            <p className="text-sm text-muted-foreground">Supports PDF, DOC, DOCX formats</p>
          </div>
          <div>
            <label htmlFor="resume-upload" className="cursor-pointer">
              <span className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                Browse Files
              </span>
              <input
                id="resume-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResumeSection;

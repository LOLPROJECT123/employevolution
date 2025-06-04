
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { resumeVersionService, ResumeVersion } from '@/services/resumeVersionService';
import { extractTextFromPDF } from '@/utils/pdfParser';
import { toast } from 'sonner';

interface ResumeUploadProps {
  onSuccess: (resume: ResumeVersion) => void;
  onCancel: () => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Please upload a PDF, DOC, or DOCX file');
      return;
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    if (!name) {
      setName(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const parseResumeContent = async (file: File) => {
    try {
      if (file.type === 'application/pdf') {
        const text = await extractTextFromPDF(file);
        return {
          extractedText: text,
          personalInfo: { name: '', email: '', phone: '' },
          workExperiences: [],
          education: [],
          skills: [],
          projects: []
        };
      }
      
      // For DOC/DOCX files, return basic structure
      return {
        extractedText: 'Content parsing available for PDF files only',
        personalInfo: { name: '', email: '', phone: '' },
        workExperiences: [],
        education: [],
        skills: [],
        projects: []
      };
    } catch (error) {
      console.error('Error parsing resume:', error);
      return null;
    }
  };

  const handleUpload = async () => {
    if (!file || !user || !name.trim()) {
      toast.error('Please select a file and provide a name');
      return;
    }

    setLoading(true);
    try {
      // Parse resume content
      const parsedData = await parseResumeContent(file);

      // Convert file to base64
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Create resume version
      const resumeData = {
        name: name.trim(),
        file_content: fileContent,
        parsed_data: parsedData
      };

      const newResume = await resumeVersionService.createResumeVersion(user.id, resumeData);
      
      if (newResume) {
        toast.success('Resume uploaded successfully!');
        onSuccess(newResume);
      } else {
        toast.error('Failed to upload resume');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Resume
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : file 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('resume-file-input')?.click()}
          >
            <input
              id="resume-file-input"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileSelect(e.target.files?.[0]!)}
              className="hidden"
            />
            
            {file ? (
              <div className="space-y-2">
                <FileText className="h-8 w-8 mx-auto text-green-600" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <p className="text-gray-600">
                  Drop your resume here or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Supports PDF, DOC, DOCX files up to 10MB
                </p>
              </div>
            )}
          </div>

          {/* Resume Name Input */}
          <div>
            <Label htmlFor="resume-name">Resume Name</Label>
            <Input
              id="resume-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Software Engineer Resume"
              className="mt-1"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!file || !name.trim() || loading}
              className="flex-1"
            >
              {loading ? 'Uploading...' : 'Upload Resume'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeUpload;

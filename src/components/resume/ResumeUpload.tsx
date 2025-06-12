import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileText, X, Image, FileImage, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { resumeVersionService, ResumeVersion } from '@/services/resumeVersionService';
import { parseResumeEnhanced, canProcessFile, willUseOCR, getProcessingMethod } from '@/utils/enhancedResumeParser';
import { resumeProfileImportService } from '@/services/resumeProfileImportService';
import { OCRProgress } from '@/services/ocrService';
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
  const [processingProgress, setProcessingProgress] = useState<OCRProgress | null>(null);
  const [importToProfile, setImportToProfile] = useState(true);
  const [replaceExistingData, setReplaceExistingData] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile) return;

    // Check if file can be processed
    if (!canProcessFile(selectedFile)) {
      toast.error('Unsupported file type. Please upload PDF, DOC, DOCX, or image files (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (15MB max - increased for image files)
    if (selectedFile.size > 15 * 1024 * 1024) {
      toast.error('File size must be less than 15MB');
      return;
    }

    setFile(selectedFile);
    if (!name) {
      setName(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }

    // Show user what processing method will be used
    const method = getProcessingMethod(selectedFile);
    const isOCR = willUseOCR(selectedFile);
    
    if (isOCR) {
      toast.info(`File will be processed using: ${method}. This may take 30-60 seconds for OCR processing.`);
    } else {
      toast.info(`File will be processed using: ${method}`);
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

  const handleUpload = async () => {
    if (!file || !user || !name.trim()) {
      toast.error('Please select a file and provide a name');
      return;
    }

    setLoading(true);
    setProcessingProgress({ status: 'starting', progress: 0, message: 'Starting file processing...' });

    try {
      // Parse resume content with progress tracking
      const parsedData = await parseResumeEnhanced(file, {
        showToast: false, // We'll handle our own toasts
        onProgress: (progress) => {
          setProcessingProgress(progress);
        },
        useOCR: true
      });

      setProcessingProgress({ status: 'uploading', progress: 95, message: 'Saving resume...' });

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
        // Import to profile if requested
        if (importToProfile) {
          setProcessingProgress({ status: 'importing', progress: 98, message: 'Importing data to profile...' });
          
          const importResult = await resumeProfileImportService.importResumeToProfile(
            user.id, 
            parsedData, 
            { replaceExisting: replaceExistingData, mergeData: !replaceExistingData }
          );

          if (importResult.success) {
            const importedItems = [];
            if (importResult.imported.personalInfo) importedItems.push('personal info');
            if (importResult.imported.workExperiences > 0) importedItems.push(`${importResult.imported.workExperiences} work experiences`);
            if (importResult.imported.education > 0) importedItems.push(`${importResult.imported.education} education entries`);
            if (importResult.imported.projects > 0) importedItems.push(`${importResult.imported.projects} projects`);
            if (importResult.imported.skills > 0) importedItems.push(`${importResult.imported.skills} skills`);
            if (importResult.imported.languages > 0) importedItems.push(`${importResult.imported.languages} languages`);
            
            if (importedItems.length > 0) {
              toast.success(`Resume uploaded and imported: ${importedItems.join(', ')}`);
            } else {
              toast.success('Resume uploaded successfully! No new data to import.');
            }
          } else {
            toast.warning('Resume uploaded but profile import failed. You can import manually later.');
          }
        } else {
          toast.success('Resume uploaded and parsed successfully!');
        }
        
        setProcessingProgress({ status: 'complete', progress: 100, message: 'Upload completed!' });
        onSuccess(newResume);
      } else {
        toast.error('Failed to upload resume');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume. Please try again.');
    } finally {
      setLoading(false);
      setProcessingProgress(null);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="h-8 w-8 mx-auto text-blue-600" />;
    }
    return <FileText className="h-8 w-8 mx-auto text-green-600" />;
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
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp,.bmp,.tiff"
              onChange={(e) => handleFileSelect(e.target.files?.[0]!)}
              className="hidden"
            />
            
            {file ? (
              <div className="space-y-2">
                {getFileIcon(file)}
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-xs text-blue-600">
                  {getProcessingMethod(file)}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <p className="text-gray-600">
                  Drop your resume here or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Supports PDF, DOC, DOCX, and image files (JPG, PNG, etc.) up to 15MB
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Text documents</span>
                  <span className="text-gray-300">•</span>
                  <Image className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Scanned images</span>
                </div>
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
              disabled={loading}
            />
          </div>

          {/* Profile Import Options */}
          {file && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Profile Import Options</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="import-to-profile" 
                  checked={importToProfile}
                  onCheckedChange={(checked) => setImportToProfile(checked as boolean)}
                />
                <Label htmlFor="import-to-profile" className="text-sm">
                  Import extracted data to my profile
                </Label>
              </div>
              
              {importToProfile && (
                <div className="flex items-center space-x-2 ml-6">
                  <Checkbox 
                    id="replace-existing" 
                    checked={replaceExistingData}
                    onCheckedChange={(checked) => setReplaceExistingData(checked as boolean)}
                  />
                  <Label htmlFor="replace-existing" className="text-sm">
                    Replace existing profile data
                  </Label>
                </div>
              )}
              
              <p className="text-xs text-blue-700">
                {importToProfile 
                  ? replaceExistingData 
                    ? "Will replace your current profile data with extracted information"
                    : "Will merge extracted data with your existing profile"
                  : "Resume will be saved but your profile won't be updated"
                }
              </p>
            </div>
          )}

          {/* Processing Progress */}
          {processingProgress && (
            <div className="space-y-2">
              <Label>Processing Progress</Label>
              <Progress value={processingProgress.progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {processingProgress.message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!file || !name.trim() || loading}
              className="flex-1"
            >
              {loading ? 'Processing...' : 'Upload Resume'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeUpload;

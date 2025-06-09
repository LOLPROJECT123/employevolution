
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileText, FileImage, Image } from 'lucide-react';
import { documentService, UserDocument } from '@/services/documentService';
import { canProcessFile, willUseOCR, getProcessingMethod } from '@/utils/enhancedResumeParser';
import { toast } from '@/hooks/use-toast';

interface DocumentUploadProps {
  onSuccess: (document: UserDocument) => void;
  onCancel: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onSuccess, onCancel }) => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<UserDocument['type']>('resume');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!canProcessFile(selectedFile)) {
      toast({
        title: "Unsupported file type",
        description: "Please select a PDF, DOC, DOCX, TXT, or image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (15MB max for OCR processing)
    if (selectedFile.size > 15 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 15MB",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    if (!name) {
      setName(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }

    // Show processing method info
    const method = getProcessingMethod(selectedFile);
    const isOCR = willUseOCR(selectedFile);
    
    if (isOCR) {
      toast({
        title: "OCR Processing",
        description: `This ${selectedFile.type.includes('image') ? 'image' : 'PDF'} will be processed using OCR technology for text extraction.`,
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress(25);

      const document = await documentService.uploadDocument(
        file,
        type,
        name,
        description,
        tags.length > 0 ? tags : undefined
      );

      setUploadProgress(100);
      onSuccess(document);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="h-12 w-12 text-blue-600 mx-auto" />;
    }
    return <FileText className="h-12 w-12 text-green-600 mx-auto" />;
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-4">
            <Label>Select File</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp,.bmp,.tiff"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    handleFileSelect(selectedFile);
                  }
                }}
              />
              {file ? (
                <div className="space-y-2">
                  {getFileIcon(file)}
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {willUseOCR(file) && (
                    <div className="flex items-center justify-center gap-1 text-blue-600">
                      <Image className="h-3 w-3" />
                      <span className="text-xs">OCR Processing Available</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="font-medium">Drop your file here or click to browse</p>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF, DOC, DOCX, TXT, and image files (JPG, PNG, etc.)
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>Text Documents</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileImage className="h-3 w-3" />
                      <span>Scanned Images</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Document Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Document Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter document name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Document Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as UserDocument['type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resume">Resume</SelectItem>
                  <SelectItem value="cover_letter">Cover Letter</SelectItem>
                  <SelectItem value="portfolio">Portfolio</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="transcript">Transcript</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this document"
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (Optional)</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <Label>Upload Progress</Label>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel} disabled={uploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!file || !name || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUpload;

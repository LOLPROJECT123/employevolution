
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Eye, Wand2, CheckCircle } from 'lucide-react';
import { useResumeAutoImport } from '@/hooks/useResumeAutoImport';
import { toast } from '@/hooks/use-toast';

interface EnhancedResumeVersionManagerProps {
  onDataImported?: () => void;
}

export const EnhancedResumeVersionManager: React.FC<EnhancedResumeVersionManagerProps> = ({ 
  onDataImported 
}) => {
  const { importResumeToProfile, isImporting, importProgress } = useResumeAutoImport();
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, DOC, DOCX, or TXT file.",
        variant: "destructive",
      });
      return;
    }

    try {
      const extractedData = await importResumeToProfile(file);
      
      if (extractedData && onDataImported) {
        onDataImported();
      }
    } catch (error) {
      console.error('File upload error:', error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Smart Resume Import
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Upload your resume and we'll automatically extract and populate your profile with work experience, education, skills, and contact information.
              </AlertDescription>
            </Alert>

            {isImporting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Processing Resume</span>
                  <span className="text-sm text-muted-foreground">{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Extracting profile information and updating your profile...
                </p>
              </div>
            )}

            <div
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                ${isImporting ? 'opacity-50 pointer-events-none' : 'hover:border-blue-400 hover:bg-gray-50'}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="resume-upload"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => handleFileUpload(e.target.files)}
                disabled={isImporting}
              />
              
              <div className="space-y-4">
                <Upload className={`mx-auto h-12 w-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                <div>
                  <p className="text-lg font-medium">
                    {dragActive ? 'Drop your resume here' : 'Upload your resume'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF, DOC, DOCX, and TXT files
                  </p>
                </div>
                <Button variant="outline" disabled={isImporting}>
                  Choose File
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <Eye className="mx-auto h-6 w-6 text-blue-600" />
                <p className="text-sm font-medium">Extract Info</p>
                <p className="text-xs text-muted-foreground">Parse resume content</p>
              </div>
              <div className="space-y-1">
                <CheckCircle className="mx-auto h-6 w-6 text-green-600" />
                <p className="text-sm font-medium">Auto-fill Profile</p>
                <p className="text-xs text-muted-foreground">Populate all sections</p>
              </div>
              <div className="space-y-1">
                <Download className="mx-auto h-6 w-6 text-purple-600" />
                <p className="text-sm font-medium">Save Data</p>
                <p className="text-xs text-muted-foreground">Store in database</p>
              </div>
              <div className="space-y-1">
                <Wand2 className="mx-auto h-6 w-6 text-orange-600" />
                <p className="text-sm font-medium">Ready to Apply</p>
                <p className="text-xs text-muted-foreground">Profile complete</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What Gets Imported</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Contact Information</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Name and phone number</li>
                <li>• Email address</li>
                <li>• Location/address</li>
                <li>• LinkedIn and GitHub URLs</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Professional Experience</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Work experience with dates</li>
                <li>• Job titles and companies</li>
                <li>• Role descriptions</li>
                <li>• Project details</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Education</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Schools and degrees</li>
                <li>• Graduation dates</li>
                <li>• GPA (if mentioned)</li>
                <li>• Field of study</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Skills & Languages</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Technical skills</li>
                <li>• Programming languages</li>
                <li>• Spoken languages</li>
                <li>• Proficiency levels</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

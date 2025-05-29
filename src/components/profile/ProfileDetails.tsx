
import React, { useState } from "react";
import { parseResume } from "@/utils/resumeParser";
import { ParsedResume } from "@/types/resume";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, X } from "lucide-react";

interface ProfileDetailsProps {
  onResumeDataUpdate?: (resumeData: ParsedResume) => void;
}

const ProfileDetails = ({ onResumeDataUpdate }: ProfileDetailsProps) => {
  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [parsing, setParsing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadedFile(file);
    setParsing(true);
    
    try {
      const parsed = await parseResume(file, true);
      setResume(parsed);
      
      // Pass the resume data to parent component
      if (onResumeDataUpdate) {
        onResumeDataUpdate(parsed);
      }
    } catch (error) {
      console.error('Resume parsing failed:', error);
    } finally {
      setParsing(false);
    }
  };

  const clearUpload = () => {
    setResume(null);
    setUploadedFile(null);
    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      {!uploadedFile ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors relative">
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Upload Your Resume</h3>
            <p className="text-sm text-muted-foreground">
              Drag & drop your resume here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PDF and TXT formats
            </p>
          </div>
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={handleResumeUpload}
            disabled={parsing}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.querySelector('input[type="file"]')?.click()}
              >
                Replace
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearUpload}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {/* Hidden file input for replace functionality */}
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={handleResumeUpload}
            disabled={parsing}
            className="hidden"
          />
        </div>
      )}

      {parsing && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="animate-spin inline-block h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></span>
          Parsing your resume and updating profile...
        </div>
      )}

      {resume && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">✅ Resume Successfully Parsed!</h4>
            <p className="text-sm text-green-700">
              Your profile has been updated with information from your resume. 
              Review the populated data and make any necessary adjustments.
            </p>
          </div>

          {/* Quick Preview of Parsed Data */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-3">Extracted Information Preview:</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Contact Info:</p>
                <p>Name: {resume.personalInfo.name || 'Not found'}</p>
                <p>Email: {resume.personalInfo.email || 'Not found'}</p>
                <p>Phone: {resume.personalInfo.phone || 'Not found'}</p>
                <p>Location: {resume.personalInfo.location || 'Not found'}</p>
              </div>
              
              <div>
                <p className="font-medium">Professional Summary:</p>
                <p>Work Experiences: {resume.workExperiences.length}</p>
                <p>Education: {resume.education.length}</p>
                <p>Projects: {resume.projects.length}</p>
                <p>Skills: {resume.skills.length}</p>
                <p>Languages: {resume.languages.length}</p>
              </div>
            </div>

            {resume.socialLinks.linkedin && (
              <div className="mt-3">
                <p className="font-medium mb-2">Social Links:</p>
                <p className="text-sm">LinkedIn: {resume.socialLinks.linkedin}</p>
                {resume.socialLinks.github && <p className="text-sm">GitHub: {resume.socialLinks.github}</p>}
                {resume.socialLinks.portfolio && <p className="text-sm">Portfolio: {resume.socialLinks.portfolio}</p>}
              </div>
            )}
            
            {resume.skills.length > 0 && (
              <div className="mt-3">
                <p className="font-medium mb-2">Skills Detected:</p>
                <div className="flex flex-wrap gap-1">
                  {resume.skills.slice(0, 8).map((skill, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {resume.skills.length > 8 && (
                    <Badge variant="secondary" className="text-xs">
                      +{resume.skills.length - 8} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDetails;


import React, { useState } from "react";
import { parseResume } from "@/utils/resumeParser";
import { ParsedResume } from "@/types/resume";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";

interface ProfileDetailsProps {
  onResumeDataUpdate?: (resumeData: ParsedResume) => void;
}

const ProfileDetails = ({ onResumeDataUpdate }: ProfileDetailsProps) => {
  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [parsing, setParsing] = useState(false);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setParsing(true);
    try {
      const parsed = await parseResume(file, true); // Show toast
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

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
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
                <p>Name: {resume.personalInfo.name}</p>
                <p>Email: {resume.personalInfo.email}</p>
                <p>Phone: {resume.personalInfo.phone}</p>
                <p>Location: {resume.personalInfo.location}</p>
              </div>
              
              <div>
                <p className="font-medium">Professional Summary:</p>
                <p>Work Experiences: {resume.workExperiences.length}</p>
                <p>Education: {resume.education.length}</p>
                <p>Projects: {resume.projects.length}</p>
                <p>Skills: {resume.skills.length}</p>
              </div>
            </div>
            
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

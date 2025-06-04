import React, { useState, useEffect } from "react";
import { parseResume } from "@/utils/resumeParser";
import { ParsedResume } from "@/types/resume";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, X, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { resumeFileService, ResumeFile } from "@/services/resumeFileService";
import { toast } from "sonner";

interface ProfileDetailsProps {
  onResumeDataUpdate?: (resumeData: ParsedResume) => void;
  showNextButton?: boolean;
  onNext?: () => void;
}

const ProfileDetails = ({ onResumeDataUpdate, showNextButton = false, onNext }: ProfileDetailsProps) => {
  const { user } = useAuth();
  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [parsing, setParsing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [existingResumeFile, setExistingResumeFile] = useState<ResumeFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [parsingSuccess, setParsingSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      loadExistingResume();
    }
  }, [user]);

  const loadExistingResume = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('🔍 Loading existing resume for user:', user.id);
      const resumeFile = await resumeFileService.getCurrentResumeFile(user.id);
      
      if (resumeFile) {
        console.log('📄 Found existing resume file:', resumeFile.file_name);
        setExistingResumeFile(resumeFile);
        setResume(resumeFile.parsed_data);
        
        // Create a virtual file object for display
        const virtualFile = new File(
          [resumeFile.file_content], 
          resumeFile.file_name, 
          { type: resumeFile.file_type }
        );
        setUploadedFile(virtualFile);
        setParsingSuccess(true);
        
        // Check and fix onboarding status if needed
        const onboardingStatus = await resumeFileService.getOnboardingStatus(user.id);
        if (onboardingStatus && !onboardingStatus.resume_uploaded) {
          console.log('🔧 Fixing onboarding status - resume exists but status is false');
          await resumeFileService.updateOnboardingStatus(user.id, { 
            resume_uploaded: true 
          });
          
          // Notify parent component
          if (onResumeDataUpdate) {
            onResumeDataUpdate(resumeFile.parsed_data);
          }
        }
      } else {
        console.log('📄 No existing resume file found');
      }
    } catch (error) {
      console.error('❌ Error loading existing resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    console.log('🚀 Starting resume upload process for file:', file.name);
    setUploadedFile(file);
    setParsing(true);
    setParsingSuccess(null);
    
    try {
      // Step 1: Parse the resume
      console.log('📝 Step 1: Parsing resume content...');
      const parsed = await parseResume(file, false);
      setResume(parsed);
      
      // Step 2: Save to database
      console.log('💾 Step 2: Saving resume file to database...');
      const saveSuccess = await resumeFileService.saveResumeFile(user.id, file, parsed);
      
      if (!saveSuccess) {
        throw new Error('Failed to save resume file to database');
      }
      
      console.log('✅ Resume file saved successfully');
      
      // Step 3: Update onboarding status
      console.log('🔄 Step 3: Updating onboarding status...');
      const statusSuccess = await resumeFileService.updateOnboardingStatus(user.id, { 
        resume_uploaded: true 
      });
      
      if (!statusSuccess) {
        console.error('❌ Failed to update onboarding status');
        toast.error("Resume saved but failed to update progress. Please refresh the page.");
        return;
      }
      
      console.log('✅ Onboarding status updated successfully');
      
      // Step 4: Determine parsing success and show appropriate feedback
      const hasPersonalInfo = parsed.personalInfo.name || parsed.personalInfo.email;
      const hasWorkExp = parsed.workExperiences.length > 0;
      const hasEducation = parsed.education.length > 0;
      const hasSkills = parsed.skills.length > 0;
      
      const parsedSuccessfully = Boolean(hasPersonalInfo || hasWorkExp || hasEducation || hasSkills);
      setParsingSuccess(parsedSuccessfully);
      
      if (parsedSuccessfully) {
        toast.success("Resume uploaded and parsed successfully! Some information was extracted automatically.");
      } else {
        toast.success("Resume uploaded successfully! Please complete your profile information manually.");
      }
      
      // Step 5: Notify parent component
      if (onResumeDataUpdate) {
        console.log('📤 Notifying parent component of resume data update');
        onResumeDataUpdate(parsed);
      }

      // Step 6: Reload to ensure UI is in sync
      await loadExistingResume();
      
    } catch (error) {
      console.error('❌ Resume upload failed:', error);
      setParsingSuccess(false);
      
      // Provide specific error messages
      if (error.message.includes('database')) {
        toast.error("Failed to save resume to database. Please try again.");
      } else if (error.message.includes('parsing')) {
        toast.error("Failed to parse resume content. Please try a different file or complete manually.");
      } else {
        toast.error("Failed to process resume. Please try again.");
      }
    } finally {
      setParsing(false);
    }
  };

  const clearUpload = () => {
    setResume(null);
    setUploadedFile(null);
    setExistingResumeFile(null);
    setParsingSuccess(null);
    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const triggerFileUpload = () => {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="ml-2">Loading your resume...</span>
      </div>
    );
  }

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
                <div className="flex items-center gap-2">
                  {parsingSuccess === true && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {parsingSuccess === false && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                  <p className="text-sm text-muted-foreground">
                    {existingResumeFile ? 'Saved to your profile' : 'Uploaded successfully'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={triggerFileUpload}
                disabled={parsing}
              >
                Replace
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearUpload}
                disabled={parsing}
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
          Processing your resume and saving to your profile...
        </div>
      )}

      {resume && !parsing && (
        <div className="space-y-4">
          <div className={`border rounded-lg p-4 ${parsingSuccess ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-start gap-2">
              {parsingSuccess ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              )}
              <div>
                <h4 className={`font-medium ${parsingSuccess ? 'text-green-800' : 'text-yellow-800'}`}>
                  {parsingSuccess ? '✅ Resume Successfully Processed!' : '⚠️ Resume Uploaded - Manual Entry Required'}
                </h4>
                <p className={`text-sm ${parsingSuccess ? 'text-green-700' : 'text-yellow-700'}`}>
                  {parsingSuccess 
                    ? 'Your resume has been saved and information was extracted. You can now proceed to complete your profile.'
                    : 'Your resume has been saved but automatic parsing was limited. Please complete your profile information manually.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Quick Preview of Parsed Data */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-3">Resume Information Preview:</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Contact Info:</p>
                <p>Name: {resume.personalInfo.name || 'Please fill manually'}</p>
                <p>Email: {resume.personalInfo.email || 'Please fill manually'}</p>
                <p>Phone: {resume.personalInfo.phone || 'Please fill manually'}</p>
                <p>Location: {resume.personalInfo.location || 'Please fill manually'}</p>
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

          {/* Next Button */}
          {showNextButton && uploadedFile && (
            <div className="pt-4 border-t">
              <Button 
                onClick={onNext}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3"
                size="lg"
              >
                Complete Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileDetails;

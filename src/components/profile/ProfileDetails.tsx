import React, { useState } from "react";
import { parseResume } from "@/utils/resumeParser";
import { ParsedResume } from "@/types/resume";
import { Badge } from "@/components/ui/badge";
import { getUserProfile, UserProfile } from "@/utils/profileUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { smartProfileSync } from "@/utils/profileSynchronizer";

const ProfileDetails = () => {
  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [parsing, setParsing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [parsedResumeData, setParsedResumeData] = useState<ParsedResume | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Partial<UserProfile>>(() => getUserProfile());

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setParsing(true);
    
    try {
      // Parse the resume
      const parsed = await parseResume(file, false); // No pop-up
      setResume(parsed);
      
      // Check if profile already exists with data
      const userProfile = getUserProfile();
      const hasExistingData = Boolean(
        userProfile.name ||
        (userProfile.skills && userProfile.skills.length > 0) ||
        (userProfile.experience && userProfile.experience.length > 0)
      );
      
      // If profile exists with data, ask for confirmation before overwriting
      if (hasExistingData) {
        setParsedResumeData(parsed);
        setCurrentProfile(userProfile);
        setShowConfirmDialog(true);
      } else {
        // Otherwise just update the profile directly
        await smartProfileSync(parsed, true, true);
        toast.success("Profile updated from resume");
      }
    } catch (error) {
      console.error("Error parsing resume:", error);
      toast.error("Failed to parse resume. Please try again.");
    } finally {
      setParsing(false);
    }
  };
  
  const handleConfirmOverwrite = async () => {
    if (parsedResumeData) {
      await smartProfileSync(parsedResumeData, true, true);
      toast.success("Profile updated from resume");
      setShowConfirmDialog(false);
      // Update the current profile state to reflect changes
      setCurrentProfile(getUserProfile());
    }
  };
  
  const handleSmartMerge = async () => {
    if (parsedResumeData) {
      await smartProfileSync(parsedResumeData, false, true);
      toast.success("Profile updated from resume (merged with existing data)");
      setShowConfirmDialog(false);
      // Update the current profile state to reflect changes
      setCurrentProfile(getUserProfile());
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-3">Profile Details</h2>
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".pdf,.txt,.docx"
            className="block"
            onChange={handleResumeUpload}
            disabled={parsing}
          />
          <div className="text-xs text-muted-foreground">
            Upload your resume to auto-populate your profile
          </div>
        </div>
        
        {parsing && (
          <div className="flex items-center mt-2 gap-2 text-sm text-muted-foreground">
            <span className="animate-spin inline-block h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></span>
            Parsing your resume...
          </div>
        )}
      </div>

      {resume && (
        <div className="space-y-6">
          {/* Contact Info */}
          <div>
            <h3 className="font-medium mb-1">Contact Information</h3>
            <div className="text-sm">
              <div>Name: {resume.personalInfo.name}</div>
              <div>Email: {resume.personalInfo.email}</div>
              <div>Phone: {resume.personalInfo.phone}</div>
              <div>Location: {resume.personalInfo.location}</div>
              {resume.socialLinks?.linkedin && (
                <div>
                  LinkedIn: <a target="_blank" rel="noopener" className="text-blue-600 underline" href={resume.socialLinks.linkedin}>{resume.socialLinks.linkedin}</a>
                </div>
              )}
              {resume.socialLinks?.github && (
                <div>
                  GitHub: <a target="_blank" rel="noopener" className="text-blue-600 underline" href={resume.socialLinks.github}>{resume.socialLinks.github}</a>
                </div>
              )}
            </div>
          </div>

          {/* Work Experience */}
          <div>
            <h3 className="font-medium mb-1">Work Experience</h3>
            <ul className="space-y-2">
              {resume.workExperiences && Array.isArray(resume.workExperiences) && resume.workExperiences.map((exp, idx) => (
                <li key={idx} className="border rounded p-2 bg-slate-50 dark:bg-slate-900/40">
                  <div className="font-semibold">{exp.role || exp.company}</div>
                  <div className="text-sm text-muted-foreground">{exp.startDate} - {exp.endDate}</div>
                  <div className="text-sm mt-1">
                    {Array.isArray(exp.description) ? exp.description.map((desc, i) => (
                      <p key={i} className="mb-1">{desc}</p>
                    )) : <p>{exp.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Education */}
          <div>
            <h3 className="font-medium mb-1">Education</h3>
            <ul className="space-y-2">
              {resume.education && Array.isArray(resume.education) && resume.education.map((edu, idx) => (
                <li key={idx} className="border rounded p-2 bg-slate-50 dark:bg-slate-900/40">
                  <div className="font-semibold">{edu.degree}</div>
                  <div className="text-sm">{edu.school}</div>
                  <div className="text-sm text-muted-foreground">{edu.startDate} - {edu.endDate}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Skills */}
          <div>
            <h3 className="font-medium mb-1">Skills</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {resume.skills && resume.skills.map((skill, idx) => (
                <Badge key={idx} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dialog for confirming overwrite */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile from Resume</DialogTitle>
            <DialogDescription>
              Your profile already contains data. How would you like to proceed?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">Current Name: {currentProfile.name}</p>
            <p className="text-sm text-muted-foreground">Resume Name: {parsedResumeData?.personalInfo.name}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button variant="default" className="bg-blue-600" onClick={handleSmartMerge}>
              Smart Merge
            </Button>
            <Button variant="destructive" onClick={handleConfirmOverwrite}>
              Overwrite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileDetails;

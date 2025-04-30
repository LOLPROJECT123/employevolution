import React, { useState } from "react";
import { parseResume } from "@/utils/resumeParser";
import { ParsedResume } from "@/types/resume";
import { Badge } from "@/components/ui/badge";
import { getUserProfile } from "@/utils/profileUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserProfile } from "@/utils/profileUtils";
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
        userProfile.firstName || 
        userProfile.lastName ||
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
              {resume.socialLinks.linkedin && (
                <div>
                  LinkedIn: <a target="_blank" rel="noopener" className="text-blue-600 underline" href={resume.socialLinks.linkedin}>{resume.socialLinks.linkedin}</a>
                </div>
              )}
              {resume.socialLinks.github && (
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
              {resume.workExperiences.map((exp, idx) => (
                <li key={idx} className="border rounded p-2 bg-slate-50 dark:bg-slate-900/40">
                  <div className="font-semibold">{exp.role}</div>
                  <div className="text-sm">{exp.company}, {exp.location} — {exp.startDate} to {exp.endDate}</div>
                  <ul className="list-disc ml-5 text-xs mt-1">
                    {exp.description.map((d, i) => (<li key={i}>{d}</li>))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>

          {/* Education */}
          <div>
            <h3 className="font-medium mb-1">Education</h3>
            <ul className="space-y-2">
              {resume.education.map((edu, idx) => (
                <li key={idx} className="border rounded p-2 bg-slate-50 dark:bg-slate-900/40">
                  <div className="font-semibold">{edu.school}</div>
                  <div className="text-sm">{edu.degree}</div>
                  <div className="text-xs">{edu.startDate} to {edu.endDate}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Projects */}
          <div>
            <h3 className="font-medium mb-1">Projects</h3>
            <ul className="space-y-2">
              {resume.projects.map((proj, idx) => (
                <li key={idx} className="border rounded p-2 bg-slate-50 dark:bg-slate-900/40">
                  <div className="font-semibold">{proj.name}</div>
                  <div className="text-xs">{proj.startDate} to {proj.endDate}</div>
                  <ul className="list-disc ml-5 text-xs">
                    {proj.description.map((d, i) => (<li key={i}>{d}</li>))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>

          {/* Skills */}
          <div>
            <h3 className="font-medium mb-1">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill, i) => (
                <Badge key={i} variant="outline">{skill}</Badge>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile from Resume</DialogTitle>
            <DialogDescription>
              Your profile already contains data. How would you like to proceed?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Current Profile Data:</h3>
              <div className="text-xs text-muted-foreground">
                <p>Name: {currentProfile.firstName} {currentProfile.lastName}</p>
                {currentProfile.email && <p>Email: {currentProfile.email}</p>}
                {currentProfile.skills && currentProfile.skills.length > 0 && (
                  <p>Skills: {currentProfile.skills.slice(0, 5).join(", ")}{currentProfile.skills.length > 5 ? "..." : ""}</p>
                )}
                {currentProfile.experience && currentProfile.experience.length > 0 && (
                  <p>Experience: {currentProfile.experience.length} entries</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Resume Data:</h3>
              <div className="text-xs text-muted-foreground">
                {parsedResumeData && (
                  <>
                    <p>Name: {parsedResumeData.personalInfo.name}</p>
                    <p>Email: {parsedResumeData.personalInfo.email}</p>
                    <p>Skills: {parsedResumeData.skills.slice(0, 5).join(", ")}{parsedResumeData.skills.length > 5 ? "..." : ""}</p>
                    <p>Experience: {parsedResumeData.workExperiences.length} entries</p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleSmartMerge}>
              Smart Merge
            </Button>
            <Button onClick={handleConfirmOverwrite}>
              Overwrite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileDetails;

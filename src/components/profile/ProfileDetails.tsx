
import React, { useState } from "react";
import { parseResume, ParsedResume } from "@/utils/resumeParser";
import { Badge } from "@/components/ui/badge";

const ProfileDetails = () => {
  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [parsing, setParsing] = useState(false);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    const parsed = await parseResume(file, false); // No pop-up
    setResume(parsed);
    setParsing(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-3">Profile Details</h2>
      <div className="mb-4">
        <input
          type="file"
          accept=".pdf,.txt"
          className="block"
          onChange={handleResumeUpload}
          disabled={parsing}
        />
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
    </div>
  );
};

export default ProfileDetails;

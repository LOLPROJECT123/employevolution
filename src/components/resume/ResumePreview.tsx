
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ResumeVersion } from '@/services/resumeVersionService';

interface ResumePreviewProps {
  resume: ResumeVersion | null;
  isOpen: boolean;
  onClose: () => void;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resume, isOpen, onClose }) => {
  if (!resume || !resume.parsed_data) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resume Preview</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            No resume data available for preview
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { parsed_data } = resume;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{resume.name} - Resume Preview</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-4">
          {/* Personal Information */}
          {parsed_data.personalInfo && (
            <div>
              <h2 className="text-2xl font-bold mb-2">{parsed_data.personalInfo.name}</h2>
              <div className="space-y-1 text-muted-foreground">
                {parsed_data.personalInfo.email && (
                  <p>📧 {parsed_data.personalInfo.email}</p>
                )}
                {parsed_data.personalInfo.phone && (
                  <p>📞 {parsed_data.personalInfo.phone}</p>
                )}
                {parsed_data.personalInfo.location && (
                  <p>📍 {parsed_data.personalInfo.location}</p>
                )}
              </div>
            </div>
          )}

          {/* Social Links */}
          {parsed_data.socialLinks && Object.values(parsed_data.socialLinks).some(link => link) && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Links</h3>
              <div className="flex flex-wrap gap-2">
                {parsed_data.socialLinks.linkedin && (
                  <Badge variant="outline">LinkedIn</Badge>
                )}
                {parsed_data.socialLinks.github && (
                  <Badge variant="outline">GitHub</Badge>
                )}
                {parsed_data.socialLinks.portfolio && (
                  <Badge variant="outline">Portfolio</Badge>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Work Experience */}
          {parsed_data.workExperiences && parsed_data.workExperiences.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Work Experience</h3>
              <div className="space-y-4">
                {parsed_data.workExperiences.map((exp, index) => (
                  <div key={index} className="border-l-2 border-blue-200 pl-4">
                    <h4 className="font-medium">{exp.role}</h4>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                    {(exp.startDate || exp.endDate) && (
                      <p className="text-xs text-muted-foreground">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </p>
                    )}
                    {exp.description && exp.description.length > 0 && (
                      <ul className="mt-2 text-sm space-y-1">
                        {exp.description.map((desc, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-muted-foreground mt-1">•</span>
                            <span>{desc}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {parsed_data.education && parsed_data.education.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Education</h3>
              <div className="space-y-3">
                {parsed_data.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-green-200 pl-4">
                    <h4 className="font-medium">{edu.school}</h4>
                    {edu.degree && <p className="text-sm text-muted-foreground">{edu.degree}</p>}
                    {(edu.startDate || edu.endDate) && (
                      <p className="text-xs text-muted-foreground">
                        {edu.startDate} - {edu.endDate}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {parsed_data.projects && parsed_data.projects.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Projects</h3>
              <div className="space-y-3">
                {parsed_data.projects.map((project, index) => (
                  <div key={index} className="border-l-2 border-purple-200 pl-4">
                    <h4 className="font-medium">{project.name}</h4>
                    {project.description && project.description.length > 0 && (
                      <ul className="mt-1 text-sm space-y-1">
                        {project.description.map((desc, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-muted-foreground mt-1">•</span>
                            <span>{desc}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {parsed_data.skills && parsed_data.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {parsed_data.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {parsed_data.languages && parsed_data.languages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {parsed_data.languages.map((language, index) => (
                  <Badge key={index} variant="outline">{language}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          {parsed_data.activities && parsed_data.activities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Activities & Leadership</h3>
              <div className="space-y-2">
                {parsed_data.activities.map((activity, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{activity.organization}</span>
                    {activity.role && <span className="text-muted-foreground"> - {activity.role}</span>}
                    {activity.description && <p className="text-muted-foreground">{activity.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumePreview;

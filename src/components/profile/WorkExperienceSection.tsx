
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Briefcase, Edit, Plus } from "lucide-react";
import EditWorkExperience from "./EditWorkExperience";

export interface WorkExperience {
  id: number;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string[];
}

interface WorkExperienceSectionProps {
  experiences: WorkExperience[];
  onAddExperience: (experience: WorkExperience) => void;
  onEditExperience: (experience: WorkExperience) => void;
  onDeleteExperience: (id: number) => void;
}

const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({
  experiences,
  onAddExperience,
  onEditExperience,
  onDeleteExperience,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<WorkExperience | undefined>(undefined);

  const handleEdit = (experience: WorkExperience) => {
    setCurrentExperience(experience);
  };

  const handleSave = (experience: WorkExperience) => {
    if (currentExperience) {
      onEditExperience(experience);
    } else {
      onAddExperience(experience);
    }
    setCurrentExperience(undefined);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Work Experience</h2>
        <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </div>

      {experiences.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Briefcase className="h-8 w-8 text-gray-500" />
            <h3 className="font-medium">No work experience added yet</h3>
            <p className="text-sm text-muted-foreground">
              Add your work history to improve your profile
            </p>
            <Button variant="default" onClick={() => setIsAddModalOpen(true)}>
              Add Experience
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {experiences.map((experience) => (
            <Card key={experience.id} className="p-4">
              <div className="flex justify-between">
                <div className="flex gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-2 h-fit rounded">
                    <Briefcase className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold">{experience.role}</h3>
                    <p className="text-muted-foreground">{experience.company}</p>
                    <p className="text-muted-foreground text-sm">{experience.location}</p>
                    <p className="text-muted-foreground text-sm">
                      {experience.startDate} - {experience.endDate}
                    </p>
                    <div className="mt-2 space-y-1">
                      {experience.description.map((desc, index) => (
                        <p key={index} className="text-sm">{desc}</p>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(experience)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <EditWorkExperience
        open={isAddModalOpen || !!currentExperience}
        onClose={() => {
          setIsAddModalOpen(false);
          setCurrentExperience(undefined);
        }}
        experience={currentExperience}
        onSave={handleSave}
        onDelete={onDeleteExperience}
      />
    </div>
  );
};

export default WorkExperienceSection;

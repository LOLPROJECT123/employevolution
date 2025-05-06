
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, GraduationCap, Plus } from "lucide-react";

interface Education {
  id: number;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

interface EducationSectionProps {
  educations: Education[];
  onAddEducation: (education: Education) => void;
  onEditEducation: (education: Education) => void;
  onDeleteEducation: (id: number) => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({
  educations,
  onAddEducation,
  onEditEducation,
  onDeleteEducation,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEducation, setCurrentEducation] = useState<Education | null>(null);

  const handleAddClick = () => {
    setCurrentEducation(null);
    setIsEditModalOpen(true);
  };

  const handleEditClick = (education: Education) => {
    setCurrentEducation(education);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Education</h2>
        <Button variant="outline" onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </div>

      {educations.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <GraduationCap className="h-8 w-8 text-gray-500" />
            <h3 className="font-medium">No education added yet</h3>
            <p className="text-sm text-muted-foreground">
              Add your education history to improve your profile
            </p>
            <Button variant="default" onClick={handleAddClick}>
              Add Education
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {educations.map((education) => (
            <Card key={education.id} className="p-4">
              <div className="flex justify-between">
                <div className="flex gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-2 h-fit rounded">
                    <GraduationCap className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold">{education.school}</h3>
                    <p>
                      {education.degree}, {education.field}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {education.startDate} - {education.endDate}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditClick(education)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Education edit modal would be used here */}
      {/* For now, just showing a placeholder for where it would be */}
    </div>
  );
};

export default EducationSection;

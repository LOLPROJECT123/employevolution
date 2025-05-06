
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, Plus, Wrench } from "lucide-react";
import EditProject from "./EditProject";

export interface Project {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  description: string[];
}

interface ProjectsSectionProps {
  projects: Project[];
  onAddProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: number) => void;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  onAddProject,
  onEditProject,
  onDeleteProject,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | undefined>(undefined);

  const handleAddClick = () => {
    setCurrentProject(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (project: Project) => {
    setCurrentProject(project);
    setIsModalOpen(true);
  };

  const handleSave = (project: Project) => {
    if (currentProject) {
      onEditProject(project);
    } else {
      onAddProject(project);
    }
    setIsModalOpen(false);
    setCurrentProject(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Projects</h2>
        <Button variant="outline" onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Wrench className="h-8 w-8 text-gray-500" />
            <h3 className="font-medium">No projects added yet</h3>
            <p className="text-sm text-muted-foreground">
              Add your projects to showcase your skills and experience
            </p>
            <Button variant="default" onClick={handleAddClick}>
              Add Project
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <Card key={project.id} className="p-4">
              <div className="flex justify-between">
                <div className="flex gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-2 h-fit rounded">
                    <Wrench className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold">{project.name}</h3>
                    <p className="text-muted-foreground text-sm">
                      {project.startDate} - {project.endDate}
                    </p>
                    <div className="mt-2 space-y-1">
                      {project.description.map((desc, index) => (
                        <p key={index} className="text-sm">{desc}</p>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditClick(project)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <EditProject
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentProject(undefined);
        }}
        project={currentProject}
        onSave={handleSave}
        onDelete={onDeleteProject}
      />
    </div>
  );
};

export default ProjectsSection;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Code, Plus, Trash2 } from 'lucide-react';

interface Project {
  name: string;
  description: string[];
  technologies?: string[];
  startDate?: string;
  endDate?: string;
  url?: string;
}

interface ProjectsSectionProps {
  data: Project[];
  onChange: (data: Project[]) => void;
}

const ProjectsSection = ({ data, onChange }: ProjectsSectionProps) => {
  const addProject = () => {
    onChange([...data, {
      name: '',
      description: [''],
      technologies: [],
      startDate: '',
      endDate: '',
      url: ''
    }]);
  };

  const updateProject = (index: number, field: string, value: string | string[]) => {
    const updated = data.map((project, i) => 
      i === index ? { ...project, [field]: value } : project
    );
    onChange(updated);
  };

  const removeProject = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((project, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">Project {index + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeProject(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project Title *</Label>
                <Input
                  value={project.name}
                  onChange={(e) => updateProject(index, 'name', e.target.value)}
                  placeholder="My Awesome Project"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Project URL</Label>
                <Input
                  value={project.url || ''}
                  onChange={(e) => updateProject(index, 'url', e.target.value)}
                  placeholder="https://github.com/username/project"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  value={project.startDate || ''}
                  onChange={(e) => updateProject(index, 'startDate', e.target.value)}
                  placeholder="January 2023"
                />
              </div>
              
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  value={project.endDate || ''}
                  onChange={(e) => updateProject(index, 'endDate', e.target.value)}
                  placeholder="March 2023"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Technologies/Skills Used</Label>
              <Input
                value={project.technologies?.join(', ') || ''}
                onChange={(e) => updateProject(index, 'technologies', e.target.value.split(', ').filter(Boolean))}
                placeholder="React, Node.js, MongoDB, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={project.description.join('\n')}
                onChange={(e) => updateProject(index, 'description', e.target.value.split('\n'))}
                placeholder="Describe your project, what it does, and your role..."
                rows={4}
              />
            </div>
          </div>
        ))}
        
        <Button onClick={addProject} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProjectsSection;

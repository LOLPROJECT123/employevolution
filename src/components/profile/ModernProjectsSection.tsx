
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Code, Plus, Edit, Calendar, ExternalLink, Cpu } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  url?: string;
  startDate: string;
  endDate: string;
  technologies?: string[];
  description: string;
}

interface ModernProjectsSectionProps {
  data: Project[];
  onAdd: () => void;
  onEdit: (index: number) => void;
}

const ModernProjectsSection = ({ data, onAdd, onEdit }: ModernProjectsSectionProps) => {
  const { theme } = useTheme();

  return (
    <Card className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5 text-blue-400" />
          Projects
        </CardTitle>
        <Button onClick={onAdd} size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            <Code className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <p>No projects added yet</p>
          </div>
        ) : (
          data.map((project, index) => (
            <Card key={project.id} className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Code className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{project.name}</h3>
                        {project.url && (
                          <a 
                            href={project.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Project
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className={`flex items-center space-x-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                      {(project.startDate || project.endDate) && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {project.startDate} - {project.endDate || 'Present'}
                          </span>
                        </div>
                      )}
                    </div>

                    {project.technologies && project.technologies.length > 0 && (
                      <div className={`flex items-center space-x-2 mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Cpu className="h-4 w-4" />
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.map((tech, techIndex) => (
                            <span 
                              key={techIndex}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {project.description && (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {project.description}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(index)}
                    className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default ModernProjectsSection;

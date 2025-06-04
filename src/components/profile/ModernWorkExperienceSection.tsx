
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Plus, Edit, MapPin, Calendar } from 'lucide-react';

interface WorkExperience {
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string[];
}

interface ModernWorkExperienceSectionProps {
  data: WorkExperience[];
  onAdd: () => void;
  onEdit: (index: number) => void;
}

const ModernWorkExperienceSection = ({ data, onAdd, onEdit }: ModernWorkExperienceSectionProps) => {
  return (
    <Card className="bg-gray-900 border-gray-800 text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-blue-400" />
          Work Experience
        </CardTitle>
        <Button onClick={onAdd} size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p>No work experience added yet</p>
            <Button onClick={onAdd} variant="outline" className="mt-4">
              Add Your First Experience
            </Button>
          </div>
        ) : (
          data.map((experience, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-white">{experience.role}</h3>
                        <p className="text-blue-400">{experience.company}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{experience.startDate} - {experience.endDate}</span>
                      </div>
                      {experience.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{experience.location}</span>
                        </div>
                      )}
                    </div>

                    {experience.description && experience.description.length > 0 && (
                      <ul className="space-y-1 text-gray-300 text-sm">
                        {experience.description.slice(0, 3).map((item, i) => (
                          <li key={i} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(index)}
                    className="text-gray-400 hover:text-white"
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

export default ModernWorkExperienceSection;

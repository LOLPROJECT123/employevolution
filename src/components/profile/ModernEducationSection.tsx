
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Plus, Edit, Calendar } from 'lucide-react';

interface Education {
  school: string;
  degree: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  gpa?: string;
}

interface ModernEducationSectionProps {
  data: Education[];
  onAdd: () => void;
  onEdit: (index: number) => void;
}

const ModernEducationSection = ({ data, onAdd, onEdit }: ModernEducationSectionProps) => {
  return (
    <Card className="bg-gray-900 border-gray-800 text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-blue-400" />
          Education
        </CardTitle>
        <Button onClick={onAdd} size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p>No education added yet</p>
            <Button onClick={onAdd} variant="outline" className="mt-4">
              Add Your Education
            </Button>
          </div>
        ) : (
          data.map((education, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-white">{education.school}</h3>
                        <p className="text-blue-400">
                          {education.degree}
                          {education.field_of_study && ` in ${education.field_of_study}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                      {(education.start_date || education.end_date) && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {education.start_date} - {education.end_date || 'Present'}
                          </span>
                        </div>
                      )}
                      {education.gpa && (
                        <span className="text-green-400">GPA: {education.gpa}</span>
                      )}
                    </div>
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

export default ModernEducationSection;

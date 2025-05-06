
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Building, Clock, Edit, MapPin, DollarSign, Sparkles } from "lucide-react";

export interface JobPreferences {
  desiredRoles: string[];
  experienceLevel: string;
  industries: string[];
  companySize: string[];
  salary: string;
  benefits: string[];
  locations: string[];
  workModel: string;
  jobTypes: string[];
  skills: string[];
}

interface JobPreferencesSectionProps {
  preferences: JobPreferences;
  onEdit: () => void;
}

const JobPreferencesSection: React.FC<JobPreferencesSectionProps> = ({
  preferences,
  onEdit,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Job Preferences</h2>
          <p className="text-sm text-muted-foreground">
            Set your job preferences to find the perfect match
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <div className="mb-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Role & Experience</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-1">Desired Roles</p>
              <div className="flex flex-wrap gap-2">
                {preferences.desiredRoles.map(role => (
                  <Badge key={role} variant="secondary" className="px-2 py-1">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Experience Level</p>
              <p>{preferences.experienceLevel}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Industries & Companies</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-1">Industries</p>
              <div className="flex flex-wrap gap-2">
                {preferences.industries.map(industry => (
                  <Badge key={industry} variant="secondary" className="px-2 py-1">
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Company Size</p>
              <div className="flex flex-wrap gap-2">
                {preferences.companySize.map(size => (
                  <Badge key={size} variant="secondary" className="px-2 py-1">
                    {size}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Compensation</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-1">Salary Expectation</p>
              <p>{preferences.salary}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Benefits</p>
              <div className="flex flex-wrap gap-2">
                {preferences.benefits.map(benefit => (
                  <Badge key={benefit} variant="secondary" className="px-2 py-1">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Location & Work Model</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-1">Preferred Locations</p>
              <div className="flex flex-wrap gap-2">
                {preferences.locations.map(location => (
                  <Badge key={location} variant="secondary" className="px-2 py-1">
                    {location}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Work Model</p>
              <p>{preferences.workModel}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Job Types</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              {preferences.jobTypes.map(type => (
                <Badge key={type} variant="secondary" className="px-2 py-1">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Skills & Qualifications</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              {preferences.skills.map(skill => (
                <Badge key={skill} variant="secondary" className="px-2 py-1">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        <Button className="w-full">Update Job Preferences</Button>
      </div>
    </div>
  );
};

export default JobPreferencesSection;

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X, Plus } from "lucide-react";

interface JobPreferences {
  jobTypes: string[];
  preferredLocations: string[];
  salary: {
    currency: string;
    min: number;
    max: number;
    period: string;
  };
  remotePreference: string;
  experienceLevel: string;
  industries: string[];
  roles: string[];
  skills: string[];
  benefits: string[];
  companySize: string[];
  workAuthorization: {
    authorized: boolean;
    needSponsorship: boolean;
    countries: string[];
  };
}

interface EditJobPreferencesProps {
  open: boolean;
  onClose: () => void;
  onOpenChange?: (open: boolean) => void;
  section: 'roles' | 'industries' | 'compensation' | 'location' | 'jobTypes' | 'skills' | 'workAuth';
  initialData: JobPreferences;
  onSave: (data: Partial<JobPreferences>) => void;
}

const EditJobPreferences: React.FC<EditJobPreferencesProps> = ({
  open,
  onClose,
  onOpenChange,
  section,
  initialData,
  onSave,
}) => {
  const [jobTypes, setJobTypes] = useState<string[]>([...initialData.jobTypes]);
  const [preferredLocations, setPreferredLocations] = useState<string[]>([...initialData.preferredLocations]);
  const [salaryMin, setSalaryMin] = useState(initialData.salary.min);
  const [salaryMax, setSalaryMax] = useState(initialData.salary.max);
  const [salaryCurrency, setSalaryCurrency] = useState(initialData.salary.currency);
  const [salaryPeriod, setSalaryPeriod] = useState(initialData.salary.period);
  const [remotePreference, setRemotePreference] = useState(initialData.remotePreference);
  const [experienceLevel, setExperienceLevel] = useState(initialData.experienceLevel);
  const [industries, setIndustries] = useState<string[]>([...initialData.industries]);
  const [roles, setRoles] = useState<string[]>([...initialData.roles]);
  const [skills, setSkills] = useState<string[]>([...initialData.skills]);
  const [benefits, setBenefits] = useState<string[]>([...initialData.benefits]);
  const [companySize, setCompanySize] = useState<string[]>([...initialData.companySize]);
  const [workAuth, setWorkAuth] = useState({...initialData.workAuthorization});
  
  const [newItem, setNewItem] = useState("");
  const [newCountry, setNewCountry] = useState("");

  const handleAddItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (newItem.trim() !== "") {
      setList([...list, newItem.trim()]);
      setNewItem("");
    }
  };

  const handleRemoveItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    const newList = [...list];
    newList.splice(index, 1);
    setList(newList);
  };

  const handleAddCountry = () => {
    if (newCountry.trim() !== "") {
      setWorkAuth({
        ...workAuth,
        countries: [...workAuth.countries, newCountry.trim()]
      });
      setNewCountry("");
    }
  };

  const handleRemoveCountry = (index: number) => {
    const newCountries = [...workAuth.countries];
    newCountries.splice(index, 1);
    setWorkAuth({
      ...workAuth,
      countries: newCountries
    });
  };

  const handleSalaryChange = (values: number[]) => {
    setSalaryMin(values[0]);
    setSalaryMax(values[1]);
  };

  const handleSave = () => {
    let updatedData: Partial<JobPreferences> = {};

    switch (section) {
      case 'roles':
        updatedData = { 
          roles, 
          experienceLevel 
        };
        break;
      case 'industries':
        updatedData = { 
          industries, 
          companySize 
        };
        break;
      case 'compensation':
        updatedData = { 
          salary: {
            currency: salaryCurrency,
            min: salaryMin,
            max: salaryMax,
            period: salaryPeriod
          },
          benefits 
        };
        break;
      case 'location':
        updatedData = { 
          preferredLocations, 
          remotePreference 
        };
        break;
      case 'jobTypes':
        updatedData = { jobTypes };
        break;
      case 'skills':
        updatedData = { skills };
        break;
      case 'workAuth':
        updatedData = { workAuthorization: workAuth };
        break;
    }

    onSave(updatedData);
    onClose();
  };

  const renderRolesAndExperienceSection = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium">Desired Roles</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {roles.map((role, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
              {role}
              <button
                type="button"
                className="ml-1 hover:text-destructive focus:outline-none"
                onClick={() => handleRemoveItem(roles, setRoles, index)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add a role"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddItem(roles, setRoles);
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={() => handleAddItem(roles, setRoles)}
          >
            Add
          </Button>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Experience Level</label>
        <Select value={experienceLevel} onValueChange={setExperienceLevel}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select experience level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="entry">Entry Level</SelectItem>
            <SelectItem value="mid">Mid Level</SelectItem>
            <SelectItem value="senior">Senior Level</SelectItem>
            <SelectItem value="lead">Lead/Manager</SelectItem>
            <SelectItem value="executive">Executive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderIndustriesSection = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium">Industries</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {industries.map((industry, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
              {industry}
              <button
                type="button"
                className="ml-1 hover:text-destructive focus:outline-none"
                onClick={() => handleRemoveItem(industries, setIndustries, index)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add an industry"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddItem(industries, setIndustries);
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={() => handleAddItem(industries, setIndustries)}
          >
            Add
          </Button>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Company Size</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {companySize.map((size, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
              {size}
              <button
                type="button"
                className="ml-1 hover:text-destructive focus:outline-none"
                onClick={() => handleRemoveItem(companySize, setCompanySize, index)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add company size"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddItem(companySize, setCompanySize);
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={() => handleAddItem(companySize, setCompanySize)}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );

  const renderCompensationSection = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-4 block">Salary Range</label>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground">Currency</label>
            <Select value={salaryCurrency} onValueChange={setSalaryCurrency}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="CAD">CAD (C$)</SelectItem>
                <SelectItem value="INR">INR (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Period</label>
            <Select value={salaryPeriod} onValueChange={setSalaryPeriod}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yearly">Per Year</SelectItem>
                <SelectItem value="monthly">Per Month</SelectItem>
                <SelectItem value="hourly">Per Hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="px-1 mb-6">
          <Slider 
            defaultValue={[salaryMin, salaryMax]}
            min={0} 
            max={300000}
            step={5000}
            onValueChange={handleSalaryChange}
            className="mb-6"
          />
          <div className="flex justify-between mt-2">
            <span className="text-sm">{salaryCurrency} {salaryMin.toLocaleString()}</span>
            <span className="text-sm">{salaryCurrency} {salaryMax.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Benefits</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {benefits.map((benefit, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
              {benefit}
              <button
                type="button"
                className="ml-1 hover:text-destructive focus:outline-none"
                onClick={() => handleRemoveItem(benefits, setBenefits, index)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add a benefit"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddItem(benefits, setBenefits);
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={() => handleAddItem(benefits, setBenefits)}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );

  const renderLocationSection = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium">Preferred Locations</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {preferredLocations.map((location, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
              {location}
              <button
                type="button"
                className="ml-1 hover:text-destructive focus:outline-none"
                onClick={() => handleRemoveItem(preferredLocations, setPreferredLocations, index)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add a location"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddItem(preferredLocations, setPreferredLocations);
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={() => handleAddItem(preferredLocations, setPreferredLocations)}
          >
            Add
          </Button>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Remote Preference</label>
        <Select value={remotePreference} onValueChange={setRemotePreference}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select remote preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="onsite">On-site</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="flexible">Flexible</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderJobTypesSection = () => (
    <div>
      <label className="text-sm font-medium">Job Types</label>
      <div className="flex flex-wrap gap-2 mt-2">
        {jobTypes.map((type, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
            {type.charAt(0).toUpperCase() + type.slice(1)}
            <button
              type="button"
              className="ml-1 hover:text-destructive focus:outline-none"
              onClick={() => handleRemoveItem(jobTypes, setJobTypes, index)}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <Select 
          value={newItem}
          onValueChange={setNewItem}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select job type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
            <SelectItem value="temporary">Temporary</SelectItem>
            <SelectItem value="volunteer">Volunteer</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          size="sm"
          onClick={() => handleAddItem(jobTypes, setJobTypes)}
          disabled={!newItem}
        >
          Add
        </Button>
      </div>
    </div>
  );

  const renderSkillsSection = () => (
    <div>
      <label className="text-sm font-medium">Skills</label>
      <div className="flex flex-wrap gap-2 mt-2">
        {skills.map((skill, index) => (
          <Badge key={index} variant="secondary" className="bg-primary/10 text-primary flex items-center gap-1 px-3 py-1">
            {skill}
            <button
              type="button"
              className="ml-1 hover:text-destructive focus:outline-none"
              onClick={() => handleRemoveItem(skills, setSkills, index)}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add a skill"
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddItem(skills, setSkills);
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          onClick={() => handleAddItem(skills, setSkills)}
        >
          Add
        </Button>
      </div>
    </div>
  );

  const renderWorkAuthSection = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium">Authorized to work in</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {workAuth.countries.map((country, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
              {country}
              <button
                type="button"
                className="ml-1 hover:text-destructive focus:outline-none"
                onClick={() => handleRemoveCountry(index)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <Input
            value={newCountry}
            onChange={(e) => setNewCountry(e.target.value)}
            placeholder="Add a country"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCountry();
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddCountry}
          >
            Add
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Need sponsorship for work authorization</label>
        <Switch 
          checked={workAuth.needSponsorship} 
          onCheckedChange={(checked) => 
            setWorkAuth({...workAuth, needSponsorship: checked})
          }
        />
      </div>
    </div>
  );

  const getSectionContent = () => {
    switch (section) {
      case 'roles':
        return renderRolesAndExperienceSection();
      case 'industries':
        return renderIndustriesSection();
      case 'compensation':
        return renderCompensationSection();
      case 'location':
        return renderLocationSection();
      case 'jobTypes':
        return renderJobTypesSection();
      case 'skills':
        return renderSkillsSection();
      case 'workAuth':
        return renderWorkAuthSection();
      default:
        return null;
    }
  };

  const getSectionTitle = () => {
    switch (section) {
      case 'roles':
        return "Edit Roles & Experience";
      case 'industries':
        return "Edit Industries & Companies";
      case 'compensation':
        return "Edit Compensation";
      case 'location':
        return "Edit Location & Work Model";
      case 'jobTypes':
        return "Edit Job Types";
      case 'skills':
        return "Edit Skills & Qualifications";
      case 'workAuth':
        return "Edit Work Authorization";
      default:
        return "Edit Job Preferences";
    }
  };

  // Use onOpenChange if provided, otherwise use onClose
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && onClose) {
      onClose();
    }
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getSectionTitle()}</DialogTitle>
        </DialogHeader>
        <div className="py-4">{getSectionContent()}</div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditJobPreferences;

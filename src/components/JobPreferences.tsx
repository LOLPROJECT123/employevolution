
import { useState, useEffect } from 'react';
import { Check, ChevronRight, Edit, MapPin, Plus, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Types for job preferences
interface JobValue {
  id: string;
  name: string;
  selected: boolean;
}

interface JobLocation {
  id: string;
  name: string;
  selected: boolean;
}

interface JobRole {
  id: string;
  name: string;
  selected: boolean;
}

interface Industry {
  id: string;
  name: string;
  selected: boolean;
}

interface JobPreference {
  id: string;
  jobValues: JobValue[];
  locations: JobLocation[];
  roles: JobRole[];
  industries: Industry[];
  experienceYears: number;
  remotePreference: string;
  salaryExpectation: string;
  workSchedulePreference: string[];
  additionalNotes: string;
  willingToRelocate: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock data for job values
const jobValuesList: JobValue[] = [
  { id: '1', name: 'Work-life balance', selected: false },
  { id: '2', name: 'Professional growth', selected: false },
  { id: '3', name: 'Meaningful work', selected: false },
  { id: '4', name: 'Collaborative environment', selected: false },
  { id: '5', name: 'Creative freedom', selected: false },
  { id: '6', name: 'Diversity & inclusion', selected: false },
  { id: '7', name: 'Leadership opportunities', selected: false },
  { id: '8', name: 'Innovation', selected: false },
  { id: '9', name: 'Compensation', selected: false },
  { id: '10', name: 'Job security', selected: false },
  { id: '11', name: 'Recognition', selected: false },
  { id: '12', name: 'Ethical practices', selected: false },
];

// Mock data for locations
const locationsList: JobLocation[] = [
  { id: '1', name: 'San Francisco, CA', selected: false },
  { id: '2', name: 'New York, NY', selected: false },
  { id: '3', name: 'Austin, TX', selected: false },
  { id: '4', name: 'Seattle, WA', selected: false },
  { id: '5', name: 'Chicago, IL', selected: false },
  { id: '6', name: 'Los Angeles, CA', selected: false },
  { id: '7', name: 'Boston, MA', selected: false },
  { id: '8', name: 'Denver, CO', selected: false },
  { id: '9', name: 'Atlanta, GA', selected: false },
  { id: '10', name: 'Remote', selected: false },
];

// Mock data for roles
const rolesList: JobRole[] = [
  { id: '1', name: 'Software Engineer', selected: false },
  { id: '2', name: 'Frontend Developer', selected: false },
  { id: '3', name: 'Backend Developer', selected: false },
  { id: '4', name: 'Full Stack Developer', selected: false },
  { id: '5', name: 'DevOps Engineer', selected: false },
  { id: '6', name: 'Data Scientist', selected: false },
  { id: '7', name: 'Product Manager', selected: false },
  { id: '8', name: 'UX Designer', selected: false },
  { id: '9', name: 'QA Engineer', selected: false },
  { id: '10', name: 'Technical Writer', selected: false },
];

// Mock data for industries
const industriesList: Industry[] = [
  { id: '1', name: 'Technology', selected: false },
  { id: '2', name: 'Finance', selected: false },
  { id: '3', name: 'Healthcare', selected: false },
  { id: '4', name: 'Education', selected: false },
  { id: '5', name: 'E-commerce', selected: false },
  { id: '6', name: 'Entertainment', selected: false },
  { id: '7', name: 'Travel', selected: false },
  { id: '8', name: 'Retail', selected: false },
  { id: '9', name: 'Manufacturing', selected: false },
  { id: '10', name: 'Consulting', selected: false },
];

// Mock saved preference
const mockSavedPreference: JobPreference = {
  id: '1',
  jobValues: [
    { id: '1', name: 'Work-life balance', selected: true },
    { id: '3', name: 'Meaningful work', selected: true },
    { id: '9', name: 'Compensation', selected: true },
  ],
  locations: [
    { id: '1', name: 'San Francisco, CA', selected: true },
    { id: '10', name: 'Remote', selected: true },
  ],
  roles: [
    { id: '2', name: 'Frontend Developer', selected: true },
    { id: '4', name: 'Full Stack Developer', selected: true },
  ],
  industries: [
    { id: '1', name: 'Technology', selected: true },
    { id: '5', name: 'E-commerce', selected: true },
  ],
  experienceYears: 3,
  remotePreference: 'Hybrid',
  salaryExpectation: '$120,000 - $150,000',
  workSchedulePreference: ['Full-time'],
  additionalNotes: 'Looking for a company with a strong engineering culture and opportunities for growth.',
  willingToRelocate: true,
  createdAt: '2023-05-15T12:00:00Z',
  updatedAt: '2023-07-20T14:30:00Z',
};

export default function JobPreferences() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [showSavedPreference, setShowSavedPreference] = useState(true);
  
  // State for job preferences
  const [jobValues, setJobValues] = useState<JobValue[]>(jobValuesList);
  const [locations, setLocations] = useState<JobLocation[]>(locationsList);
  const [roles, setRoles] = useState<JobRole[]>(rolesList);
  const [industries, setIndustries] = useState<Industry[]>(industriesList);
  const [experienceYears, setExperienceYears] = useState(0);
  const [remotePreference, setRemotePreference] = useState('No preference');
  const [salaryExpectation, setSalaryExpectation] = useState('');
  const [workSchedulePreference, setWorkSchedulePreference] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [willingToRelocate, setWillingToRelocate] = useState(false);
  
  // For loading saved preferences
  const [savedPreference, setSavedPreference] = useState<JobPreference | null>(null);
  
  useEffect(() => {
    // Load saved preference (simulated)
    setSavedPreference(mockSavedPreference);
    
    // Update progress based on current step
    const totalSteps = 5;
    setProgress((currentStep / totalSteps) * 100);
  }, [currentStep]);
  
  // Filter locations based on search term
  const filteredLocations = locations.filter(location => 
    location.name.toLowerCase().includes(searchLocation.toLowerCase())
  );
  
  // Filter roles based on search term
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchRole.toLowerCase())
  );
  
  // Toggle selection of job values
  const toggleJobValue = (id: string) => {
    setJobValues(jobValues.map(value => 
      value.id === id ? { ...value, selected: !value.selected } : value
    ));
  };
  
  // Toggle selection of locations
  const toggleLocation = (id: string) => {
    setLocations(locations.map(location => 
      location.id === id ? { ...location, selected: !location.selected } : location
    ));
  };
  
  // Toggle selection of roles
  const toggleRole = (id: string) => {
    setRoles(roles.map(role => 
      role.id === id ? { ...role, selected: !role.selected } : role
    ));
  };
  
  // Toggle selection of industries
  const toggleIndustry = (id: string) => {
    setIndustries(industries.map(industry => 
      industry.id === id ? { ...industry, selected: !industry.selected } : industry
    ));
  };
  
  // Toggle work schedule preference
  const toggleWorkSchedule = (schedule: string) => {
    if (workSchedulePreference.includes(schedule)) {
      setWorkSchedulePreference(workSchedulePreference.filter(s => s !== schedule));
    } else {
      setWorkSchedulePreference([...workSchedulePreference, schedule]);
    }
  };
  
  // Reset form to saved preferences
  const resetForm = () => {
    if (savedPreference) {
      // Reset all form fields to saved preference values
      setJobValues(jobValuesList.map(value => ({
        ...value,
        selected: savedPreference.jobValues.some(v => v.id === value.id && v.selected),
      })));
      
      setLocations(locationsList.map(location => ({
        ...location,
        selected: savedPreference.locations.some(l => l.id === location.id && l.selected),
      })));
      
      setRoles(rolesList.map(role => ({
        ...role,
        selected: savedPreference.roles.some(r => r.id === role.id && r.selected),
      })));
      
      setIndustries(industriesList.map(industry => ({
        ...industry,
        selected: savedPreference.industries.some(i => i.id === industry.id && i.selected),
      })));
      
      setExperienceYears(savedPreference.experienceYears);
      setRemotePreference(savedPreference.remotePreference);
      setSalaryExpectation(savedPreference.salaryExpectation);
      setWorkSchedulePreference(savedPreference.workSchedulePreference);
      setAdditionalNotes(savedPreference.additionalNotes);
      setWillingToRelocate(savedPreference.willingToRelocate);
    }
  };
  
  // Save job preferences
  const savePreferences = () => {
    // Create a new preference object
    const newPreference: JobPreference = {
      id: savedPreference ? savedPreference.id : Date.now().toString(),
      jobValues: jobValues.filter(value => value.selected),
      locations: locations.filter(location => location.selected),
      roles: roles.filter(role => role.selected),
      industries: industries.filter(industry => industry.selected),
      experienceYears,
      remotePreference,
      salaryExpectation,
      workSchedulePreference,
      additionalNotes,
      willingToRelocate,
      createdAt: savedPreference ? savedPreference.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Update saved preference
    setSavedPreference(newPreference);
    setIsEditMode(false);
    setCurrentStep(1);
    setShowSavedPreference(true);
    
    toast.success("Job preferences saved", {
      description: "Your job preferences have been updated successfully."
    });
  };
  
  // Go to next step in wizard
  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      savePreferences();
    }
  };
  
  // Go to previous step in wizard
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setIsEditMode(false);
      setShowSavedPreference(true);
      resetForm();
    }
  };
  
  // Start editing preferences
  const startEditing = () => {
    resetForm();
    setIsEditMode(true);
    setShowSavedPreference(false);
  };
  
  // Render job values selection step
  const renderJobValuesStep = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">What matters most to you in a job?</h3>
        <p className="text-sm text-muted-foreground">
          Select up to 5 values that are important to you in your next role.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {jobValues.map((value) => (
            <button
              key={value.id}
              onClick={() => toggleJobValue(value.id)}
              className={`p-3 rounded-lg border text-left flex items-start space-x-2 ${
                value.selected 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className={`mt-0.5 rounded-full w-4 h-4 border flex items-center justify-center ${
                value.selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
              }`}>
                {value.selected && <Check className="h-3 w-3" />}
              </div>
              <span>{value.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  // Render location preferences step
  const renderLocationStep = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Where would you like to work?</h3>
        <p className="text-sm text-muted-foreground">
          Select locations where you'd be interested in working.
        </p>
        
        <div className="relative">
          <Input
            placeholder="Search locations..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="pl-9"
          />
          <div className="absolute left-3 top-2.5 text-muted-foreground">
            <MapPin className="h-4 w-4" />
          </div>
        </div>
        
        <ScrollArea className="h-[240px] mt-2 rounded-md border p-2">
          <div className="space-y-2">
            {filteredLocations.map((location) => (
              <button
                key={location.id}
                onClick={() => toggleLocation(location.id)}
                className={`w-full p-2 rounded-md text-left flex items-center space-x-2 ${
                  location.selected 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted'
                }`}
              >
                <div className={`rounded-full w-4 h-4 border flex items-center justify-center ${
                  location.selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}>
                  {location.selected && <Check className="h-3 w-3" />}
                </div>
                <span>{location.name}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex items-center space-x-2 mt-4">
          <Switch
            id="willing-to-relocate"
            checked={willingToRelocate}
            onCheckedChange={setWillingToRelocate}
          />
          <Label htmlFor="willing-to-relocate">I'm willing to relocate for the right opportunity</Label>
        </div>
      </div>
    );
  };
  
  // Render role preferences step
  const renderRoleStep = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">What roles are you looking for?</h3>
        <p className="text-sm text-muted-foreground">
          Select all roles that you would be interested in.
        </p>
        
        <div className="relative">
          <Input
            placeholder="Search roles..."
            value={searchRole}
            onChange={(e) => setSearchRole(e.target.value)}
            className="pl-9"
          />
          <div className="absolute left-3 top-2.5 text-muted-foreground">
            <MapPin className="h-4 w-4" />
          </div>
        </div>
        
        <ScrollArea className="h-[240px] mt-2 rounded-md border p-2">
          <div className="space-y-2">
            {filteredRoles.map((role) => (
              <button
                key={role.id}
                onClick={() => toggleRole(role.id)}
                className={`w-full p-2 rounded-md text-left flex items-center space-x-2 ${
                  role.selected 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted'
                }`}
              >
                <div className={`rounded-full w-4 h-4 border flex items-center justify-center ${
                  role.selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}>
                  {role.selected && <Check className="h-3 w-3" />}
                </div>
                <span>{role.name}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
        
        <div className="space-y-4 mt-4">
          <div>
            <Label>Years of Experience</Label>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0 years</span>
              <span>10+ years</span>
            </div>
            <Slider
              value={[experienceYears]}
              min={0}
              max={10}
              step={1}
              onValueChange={(value) => setExperienceYears(value[0])}
              className="mt-2"
            />
            <div className="text-center mt-2">
              <span className="text-sm font-medium">{experienceYears} {experienceYears === 1 ? 'year' : 'years'}</span>
            </div>
          </div>
          
          <div>
            <Label>Industries</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {industries.map((industry) => (
                <button
                  key={industry.id}
                  onClick={() => toggleIndustry(industry.id)}
                  className={`p-2 text-sm rounded-md text-left ${
                    industry.selected 
                      ? 'bg-primary/10 text-primary' 
                      : 'border hover:bg-muted'
                  }`}
                >
                  {industry.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render work preferences step
  const renderWorkPreferencesStep = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Work Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Tell us about your ideal working conditions.
        </p>
        
        <div className="space-y-4 mt-4">
          <div>
            <Label>Remote Work Preference</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {['Remote', 'Hybrid', 'On-site'].map((option) => (
                <button
                  key={option}
                  onClick={() => setRemotePreference(option)}
                  className={`p-2 rounded-md text-center ${
                    remotePreference === option 
                      ? 'bg-primary text-primary-foreground' 
                      : 'border hover:bg-muted'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <Label>Work Schedule</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {['Full-time', 'Part-time', 'Contract', 'Temporary'].map((option) => (
                <button
                  key={option}
                  onClick={() => toggleWorkSchedule(option)}
                  className={`p-2 rounded-md text-center ${
                    workSchedulePreference.includes(option) 
                      ? 'bg-primary/10 text-primary' 
                      : 'border hover:bg-muted'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="salary-expectation">Salary Expectation</Label>
            <Input
              id="salary-expectation"
              placeholder="e.g., $80,000 - $100,000"
              value={salaryExpectation}
              onChange={(e) => setSalaryExpectation(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    );
  };
  
  // Render additional notes step
  const renderAdditionalNotesStep = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Additional Notes</h3>
        <p className="text-sm text-muted-foreground">
          Add any other information that might help with your job search.
        </p>
        
        <div className="mt-4">
          <Label htmlFor="additional-notes">Notes</Label>
          <Textarea
            id="additional-notes"
            placeholder="e.g., Specific companies you're interested in, preferred benefits, deal-breakers, etc."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="mt-1 h-[200px]"
          />
        </div>
      </div>
    );
  };
  
  // Render saved preference card
  const renderSavedPreference = () => {
    if (!savedPreference) return null;
    
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Job Preferences</CardTitle>
            <Button variant="outline" size="sm" onClick={startEditing}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
          <CardDescription>
            Last updated on {new Date(savedPreference.updatedAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {savedPreference.jobValues.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Values</h4>
              <div className="flex flex-wrap gap-2">
                {savedPreference.jobValues.map(value => (
                  <Badge key={value.id} variant="secondary">{value.name}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {savedPreference.locations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Locations</h4>
              <div className="flex flex-wrap gap-2">
                {savedPreference.locations.map(location => (
                  <Badge key={location.id} variant="outline" className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {location.name}
                  </Badge>
                ))}
              </div>
              {savedPreference.willingToRelocate && (
                <p className="text-xs text-muted-foreground mt-1">Willing to relocate</p>
              )}
            </div>
          )}
          
          {savedPreference.roles.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Roles</h4>
              <div className="flex flex-wrap gap-2">
                {savedPreference.roles.map(role => (
                  <Badge key={role.id}>{role.name}</Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {savedPreference.experienceYears} {savedPreference.experienceYears === 1 ? 'year' : 'years'} of experience
              </p>
            </div>
          )}
          
          {savedPreference.industries.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Industries</h4>
              <div className="flex flex-wrap gap-2">
                {savedPreference.industries.map(industry => (
                  <Badge key={industry.id} variant="outline">{industry.name}</Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <h4 className="text-sm font-medium mb-1">Remote Preference</h4>
              <p className="text-sm">{savedPreference.remotePreference}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Work Schedule</h4>
              <p className="text-sm">{savedPreference.workSchedulePreference.join(', ')}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Salary Expectation</h4>
              <p className="text-sm">{savedPreference.salaryExpectation || 'Not specified'}</p>
            </div>
          </div>
          
          {savedPreference.additionalNotes && (
            <div>
              <h4 className="text-sm font-medium mb-1">Additional Notes</h4>
              <p className="text-sm text-muted-foreground">{savedPreference.additionalNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  // Render current step of the wizard
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderJobValuesStep();
      case 2:
        return renderLocationStep();
      case 3:
        return renderRoleStep();
      case 4:
        return renderWorkPreferencesStep();
      case 5:
        return renderAdditionalNotesStep();
      default:
        return null;
    }
  };
  
  // Wizard navigation
  const renderWizardNavigation = () => {
    return (
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={prevStep}>
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </Button>
        <Button onClick={nextStep}>
          {currentStep === 5 ? 'Save' : 'Next'}
          {currentStep !== 5 && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    );
  };
  
  // Render job preferences editor wizard
  const renderPreferencesEditor = () => {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Step {currentStep} of 5</h3>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {renderCurrentStep()}
        {renderWizardNavigation()}
      </div>
    );
  };
  
  return (
    <Dialog open={isEditMode} onOpenChange={(open) => {
      if (!open) {
        setIsEditMode(false);
        setShowSavedPreference(true);
        resetForm();
      }
    }}>
      <div>
        {showSavedPreference ? (
          <>
            {savedPreference ? (
              renderSavedPreference()
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Job Preferences</CardTitle>
                  <CardDescription>Set up your job preferences to help us find the right opportunities for you.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">You haven't set up your job preferences yet.</p>
                    <Button onClick={startEditing}>
                      <Plus className="h-4 w-4 mr-2" />
                      Set Job Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Job Preferences</DialogTitle>
            </DialogHeader>
            {renderPreferencesEditor()}
          </DialogContent>
        )}
      </div>
    </Dialog>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MapPin,
  Building,
  Briefcase,
  GraduationCap,
  DollarSign,
  User,
  Search as SearchIcon,
  ChevronDown,
  Plus,
  X,
  Check
} from "lucide-react";
import {
  Badge,
} from "@/components/ui/badge";

export function JobPreferences() {
  const [jobType, setJobType] = useState<string>("full-time");
  const [workModel, setWorkModel] = useState<string>("remote");
  const [location, setLocation] = useState<string>("");
  const [openToRelocation, setOpenToRelocation] = useState<boolean>(false);
  const [relocationPreference, setRelocationPreference] = useState<string>("");
  const [commuteDistance, setCommuteDistance] = useState<number>(50);
  const [experienceLevel, setExperienceLevel] = useState<string>("mid");
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(3);
  const [salaryRange, setSalaryRange] = useState<[number, number]>([80000, 150000]);
  const [interestedInEquity, setInterestedInEquity] = useState<boolean>(true);
  const [requireVisa, setRequireVisa] = useState<boolean>(false);
  const [skills, setSkills] = useState<string[]>(["JavaScript", "React", "Node.js"]);
  const [newSkill, setNewSkill] = useState<string>("");
  const [industry, setIndustry] = useState<string>("technology");
  const [companySize, setCompanySize] = useState<string>("medium");
  const [profileCompletionPercentage, setProfileCompletionPercentage] = useState<number>(75);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const savePreferences = () => {
    alert("Preferences Saved!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Job Preferences</h2>
          <p className="text-muted-foreground">
            Set your job preferences to get better recommendations.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center">
            <span className="mr-2 text-sm">Profile Completion:</span>
            <Progress value={profileCompletionPercentage} className="w-24 h-2" />
            <span className="ml-2 text-sm font-medium">{profileCompletionPercentage}%</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Type & Location</CardTitle>
          <CardDescription>
            What type of job are you looking for and where?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type</Label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger id="jobType">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workModel">Work Model</Label>
              <Select value={workModel} onValueChange={setWorkModel}>
                <SelectTrigger id="workModel">
                  <SelectValue placeholder="Select work model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onsite">On-site</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Preferred Location</Label>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  type="text"
                  placeholder="City, state, or country"
                  className="pl-9"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="relocation">Open to Relocation</Label>
                <Switch
                  id="relocation"
                  checked={openToRelocation}
                  onCheckedChange={setOpenToRelocation}
                />
              </div>
              {openToRelocation && (
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Add relocation preferences"
                    className="pl-9"
                    value={relocationPreference}
                    onChange={(e) => setRelocationPreference(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>Maximum Commute Distance</Label>
              <span className="text-sm text-muted-foreground">{commuteDistance} miles</span>
            </div>
            <Slider
              defaultValue={[commuteDistance]}
              max={100}
              step={5}
              onValueChange={(value) => setCommuteDistance(value[0])}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Experience & Compensation</CardTitle>
          <CardDescription>
            What experience level and compensation are you targeting?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger id="experienceLevel">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intern">Intern</SelectItem>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid-Level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Years of Experience</Label>
              <Input
                id="yearsOfExperience"
                type="number"
                min="0"
                max="50"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label>Target Salary Range (${salaryRange[0].toLocaleString()} - ${salaryRange[1].toLocaleString()})</Label>
            </div>
            <Slider
              defaultValue={salaryRange}
              min={0}
              max={500000}
              step={5000}
              onValueChange={(value) => setSalaryRange(value as [number, number])}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="equity">Interested in Equity</Label>
                <Switch
                  id="equity"
                  checked={interestedInEquity}
                  onCheckedChange={setInterestedInEquity}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="sponsorship">Require Visa Sponsorship</Label>
                <Switch
                  id="sponsorship"
                  checked={requireVisa}
                  onCheckedChange={setRequireVisa}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills & Industry</CardTitle>
          <CardDescription>
            What are your skills and preferred industries?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => removeSkill(skill)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newSkill.trim()) {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button variant="outline" onClick={addSkill} disabled={!newSkill.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Preferred Industries</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger id="industry">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companySize">Preferred Company Size</Label>
            <Select value={companySize} onValueChange={setCompanySize}>
              <SelectTrigger id="companySize">
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="startup">Startup (1-50)</SelectItem>
                <SelectItem value="small">Small (51-200)</SelectItem>
                <SelectItem value="medium">Medium (201-1000)</SelectItem>
                <SelectItem value="large">Large (1001-5000)</SelectItem>
                <SelectItem value="enterprise">Enterprise (5000+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={savePreferences}>
            Save Preferences
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

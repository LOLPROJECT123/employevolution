
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { X, Check, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// Define types for our job preferences
interface JobPreference {
  values: string[];
  roleTypes: string[];
  roleSpecializations: Record<string, string[]>;
  locations: {
    countries: Record<string, string[]>;
  };
  experienceLevels: string[];
  companySizes: string[];
  industries: string[];
  avoidIndustries: string[];
  skills: string[];
  avoidSkills: string[];
  minSalary: number;
  securityClearance: boolean;
  jobSearchStatus: string;
}

const defaultJobPreference: JobPreference = {
  values: [],
  roleTypes: [],
  roleSpecializations: {},
  locations: {
    countries: {}
  },
  experienceLevels: [],
  companySizes: [],
  industries: [],
  avoidIndustries: [],
  skills: [],
  avoidSkills: [],
  minSalary: 0,
  securityClearance: false,
  jobSearchStatus: "Actively looking"
};

const JobPreferencesDialog = ({ onSave }: { onSave: (prefs: JobPreference) => void }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(10);
  const [jobPreference, setJobPreference] = useState<JobPreference>(defaultJobPreference);

  // Available options for each preference section
  const availableValues = [
    "Diversity & inclusion",
    "Impactful work",
    "Independence & autonomy",
    "Innovative product & tech",
    "Mentorship & career development",
    "Progressive leadership",
    "Recognition & reward",
    "Role mobility",
    "Social responsibility & sustainability",
    "Transparency & communication",
    "Work-life balance"
  ];

  const roleCategories = [
    {
      name: "Technical & Engineering",
      roles: [
        "Aerospace Engineering",
        "AI & Machine Learning",
        "Architecture & Civil Engineering",
        "Data & Analytics",
        "Developer Relations",
        "DevOps & Infrastructure",
        "Electrical Engineering",
        "Engineering Management",
        "Hardware Engineering",
        "IT & Security",
        "Mechanical Engineering",
        "Process Engineering",
        "QA & Testing",
        "Quantitative Finance",
        "Quantum Computing",
        "Sales & Solution Engineering",
        "Software Engineering"
      ]
    },
    {
      name: "Finance & Operations & Strategy",
      roles: [
        "Accounting",
        "Business & Strategy",
        "Consulting",
        "Finance & Banking",
        "Growth & Marketing",
        "Operations & Logistics",
        "Product",
        "Real Estate",
        "Retail",
        "Sales & Account Management"
      ]
    },
    {
      name: "Creative & Design",
      roles: [
        "Art, Graphics & Animation",
        "Audio & Sound Design",
        "Content & Writing",
        "Creative Production",
        "Journalism",
        "Social Media",
        "UI/UX & Design"
      ]
    },
    {
      name: "Education & Training",
      roles: [
        "Education",
        "Training"
      ]
    },
    {
      name: "Legal & Support & Administration",
      roles: [
        "Administrative & Executive Assistance",
        "Clerical & Data Entry",
        "Customer Experience & Support",
        "Legal & Compliance",
        "People & HR",
        "Security & Protective Services"
      ]
    },
    {
      name: "Life Sciences",
      roles: [
        "Biology & Biotech",
        "Lab & Research",
        "Medical, Clinical & Veterinary"
      ]
    }
  ];

  const roleSpecializations: Record<string, string[]> = {
    "AI & Machine Learning": [
      "AI Research",
      "Applied Machine Learning",
      "Computer Vision",
      "Conversational AI & Chatbots",
      "Deep Learning",
      "Natural Language Processing (NLP)",
      "Robotics & Autonomous Systems",
      "Speech Recognition"
    ],
    "Data & Analytics": [
      "Data Analysis",
      "Data Engineering",
      "Data Management",
      "Data Science"
    ],
    "DevOps & Infrastructure": [
      "Cloud Analyst",
      "Cloud Engineering", 
      "Database Administration",
      "DevOps Engineering",
      "Financial Operations",
      "Network Engineering",
      "Platform Engineering",
      "Server Administration",
      "Site Reliability Engineering"
    ],
    "Software Engineering": [
      "Android Development",
      "Backend Engineering",
      "Embedded Engineering",
      "FinTech Engineering",
      "Frontend Engineering",
      "Full-Stack Engineering",
      "Game Engineering",
      "iOS Development",
      "IT & Support",
      "Mobile Engineering",
      "Security Engineering",
      "Software QA & Testing",
      "Web Development"
    ],
    "Quantitative Finance": [
      "Algorithm Development",
      "Quantitative Analysis",
      "Quantitative Research",
      "Quantitative Trading"
    ]
  };

  const countries = [
    {
      name: "United States",
      cities: [
        "Atlanta",
        "Austin",
        "Boston",
        "Charlotte",
        "Chicago",
        "Dallas",
        "Denver",
        "Las Vegas",
        "Los Angeles",
        "Miami",
        "New York City",
        "Philadelphia",
        "Pittsburgh",
        "Portland",
        "Remote in USA",
        "San Diego",
        "San Francisco Bay Area",
        "Seattle",
        "Washington D.C."
      ]
    },
    {
      name: "Canada",
      cities: [
        "Montreal",
        "Ottawa",
        "Quebec City",
        "Remote in Canada",
        "Toronto",
        "Vancouver",
        "Winnipeg"
      ]
    },
    {
      name: "United Kingdom",
      cities: [
        "Birmingham",
        "Liverpool",
        "London",
        "Manchester",
        "Remote in UK"
      ]
    }
  ];

  const experienceLevels = [
    "Internship",
    "Entry Level & New Grad",
    "Junior (1 to 2 years)",
    "Mid-level (3 to 4 years)",
    "Senior (5 to 8 years)",
    "Expert & Leadership (9+ years)"
  ];

  const companySizes = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "501-1,000 employees",
    "1,001-5,000 employees",
    "5,001-10,000 employees",
    "10,001+ employees"
  ];

  const industries = [
    "Aerospace",
    "AI & Machine Learning",
    "Automotive & Transportation",
    "Biotechnology",
    "Consulting",
    "Consumer Goods",
    "Consumer Software",
    "Crypto & Web3",
    "Cybersecurity",
    "Data & Analytics",
    "Defense",
    "Design",
    "Education",
    "Energy",
    "Enterprise Software",
    "Entertainment",
    "Financial Services",
    "Fintech",
    "Food & Agriculture",
    "Gaming",
    "Government & Public Sector",
    "Hardware",
    "Healthcare",
    "Industrial & Manufacturing",
    "Legal",
    "Quantitative Finance",
    "Real Estate",
    "Robotics & Automation",
    "Social Impact",
    "Venture Capital",
    "VR & AR"
  ];

  const skills = [
    "Adobe Illustrator",
    "Business Analytics",
    "Excel/Numbers/Sheets",
    "Git",
    "HTML/CSS",
    "Java",
    "MailChimp",
    "MATLAB",
    "Operations Research",
    "Python",
    "SEO",
    "Zendesk",
    "Blender",
    "Adobe Premiere Pro",
    "Adobe Photoshop",
    "Animation",
    "C/C++",
    "Firebase",
    "Agile",
    "Angular.js",
    "Arduino",
    "Assembly",
    "AutoCAD",
    "Bash",
    "CAD",
    "Adobe Lightroom",
    "Adobe After Effects",
    "Adobe Creative Suite",
    "Canva",
    "Communications",
    "Data Analysis",
    "Data Science",
    "Data Structures & Algorithms",
    "Discrete Math",
    "Flask",
    "JavaScript",
    "Jupyter",
    "Linux/Unix",
    "MySQL",
    "MongoDB",
    "Microeconomics",
    "React.js",
    "Wireshark",
    "Next.js",
    "Node.js",
    "NoSQL",
    "NumPy",
    "Oscilloscope",
    "Oracle",
    "Power BI",
    "PowerShell",
    "PowerPoint/Keynote/Slides",
    "Pandas",
    "Printed Circuit Board (PCB) Design",
    "Public Speaking",
    "Product Management",
    "PyTorch",
    "Word/Pages/Docs",
    "VHDL",
    "Verilog",
    "Vercel",
    "Web Development",
    "VLSI Design",
    "TCP/IP",
    "Video Editing",
    "Selenium",
    "SQL",
    "Software Testing"
  ];

  // Helper functions to update job preferences
  const toggleValue = (value: string) => {
    setJobPreference(prev => {
      const newValues = prev.values.includes(value)
        ? prev.values.filter(v => v !== value)
        : [...prev.values, value];
      return { ...prev, values: newValues };
    });
  };

  const toggleRoleType = (role: string) => {
    setJobPreference(prev => {
      const newRoleTypes = prev.roleTypes.includes(role)
        ? prev.roleTypes.filter(r => r !== role)
        : [...prev.roleTypes, role];
      return { ...prev, roleTypes: newRoleTypes };
    });
  };

  const toggleRoleSpecialization = (roleType: string, specialization: string) => {
    setJobPreference(prev => {
      const prevSpecializations = prev.roleSpecializations[roleType] || [];
      const newSpecializations = prevSpecializations.includes(specialization)
        ? prevSpecializations.filter(s => s !== specialization)
        : [...prevSpecializations, specialization];
      
      return { 
        ...prev, 
        roleSpecializations: { 
          ...prev.roleSpecializations, 
          [roleType]: newSpecializations 
        } 
      };
    });
  };

  const toggleLocation = (country: string, city: string) => {
    setJobPreference(prev => {
      const prevCities = prev.locations.countries[country] || [];
      const newCities = prevCities.includes(city)
        ? prevCities.filter(c => c !== city)
        : [...prevCities, city];
      
      return { 
        ...prev, 
        locations: { 
          ...prev.locations,
          countries: {
            ...prev.locations.countries,
            [country]: newCities
          } 
        } 
      };
    });
  };

  const toggleExperienceLevel = (level: string) => {
    setJobPreference(prev => {
      const newLevels = prev.experienceLevels.includes(level)
        ? prev.experienceLevels.filter(l => l !== level)
        : [...prev.experienceLevels, level];
      return { ...prev, experienceLevels: newLevels };
    });
  };

  const toggleCompanySize = (size: string) => {
    setJobPreference(prev => {
      const newSizes = prev.companySizes.includes(size)
        ? prev.companySizes.filter(s => s !== size)
        : [...prev.companySizes, size];
      return { ...prev, companySizes: newSizes };
    });
  };

  const toggleIndustry = (industry: string) => {
    setJobPreference(prev => {
      const newIndustries = prev.industries.includes(industry)
        ? prev.industries.filter(i => i !== industry)
        : [...prev.industries, industry];
      return { ...prev, industries: newIndustries };
    });
  };

  const toggleAvoidIndustry = (industry: string) => {
    setJobPreference(prev => {
      const newAvoidIndustries = prev.avoidIndustries.includes(industry)
        ? prev.avoidIndustries.filter(i => i !== industry)
        : [...prev.avoidIndustries, industry];
      return { ...prev, avoidIndustries: newAvoidIndustries };
    });
  };

  const toggleSkill = (skill: string) => {
    setJobPreference(prev => {
      const newSkills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills: newSkills };
    });
  };

  const toggleAvoidSkill = (skill: string) => {
    setJobPreference(prev => {
      const newAvoidSkills = prev.avoidSkills.includes(skill)
        ? prev.avoidSkills.filter(s => s !== skill)
        : [...prev.avoidSkills, skill];
      return { ...prev, avoidSkills: newAvoidSkills };
    });
  };

  const setMinSalary = (salary: number) => {
    setJobPreference(prev => ({ ...prev, minSalary: salary }));
  };

  const toggleSecurityClearance = (clearance: boolean) => {
    setJobPreference(prev => ({ ...prev, securityClearance: clearance }));
  };

  const setJobSearchStatus = (status: string) => {
    setJobPreference(prev => ({ ...prev, jobSearchStatus: status }));
  };

  // Navigation functions
  const goToNextStep = () => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setProgress(nextStep * 10);
  };

  const goToPreviousStep = () => {
    const prevStep = currentStep - 1;
    setCurrentStep(prevStep > 0 ? prevStep : 1);
    setProgress(prevStep > 0 ? prevStep * 10 : 10);
  };

  const handleSaveAndContinue = () => {
    onSave(jobPreference);
    toast.success("Job preferences saved successfully!");
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Let's get started!</h2>
              <p className="text-xl">What do you value in a new role?</p>
              <p className="text-sm text-muted-foreground">Select up to 3</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {availableValues.map((value) => (
                <button
                  key={value}
                  onClick={() => toggleValue(value)}
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    jobPreference.values.includes(value)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
                  }`}
                  disabled={jobPreference.values.length >= 3 && !jobPreference.values.includes(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">What kinds of roles are you interested in?</h2>
              <p className="text-sm text-muted-foreground">Select up to 5</p>
            </div>

            <div className="space-y-6">
              {roleCategories.map((category) => (
                <div key={category.name} className="space-y-3">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => toggleRoleType(role)}
                        className={`px-4 py-2 rounded-full border transition-colors ${
                          jobPreference.roleTypes.includes(role)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
                        }`}
                        disabled={jobPreference.roleTypes.length >= 5 && !jobPreference.roleTypes.includes(role)}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Choose specializations</h2>
              <p className="text-sm text-muted-foreground">
                Select the most relevant specializations for you
              </p>
            </div>

            <div className="space-y-6">
              {jobPreference.roleTypes.map(roleType => 
                roleSpecializations[roleType] ? (
                  <div key={roleType} className="space-y-3">
                    <h3 className="font-semibold">{roleType}</h3>
                    <div className="flex flex-wrap gap-2">
                      {roleSpecializations[roleType].map(specialization => (
                        <div 
                          key={specialization}
                          className={`flex items-center space-x-2 border rounded-lg p-2 cursor-pointer ${
                            jobPreference.roleSpecializations[roleType]?.includes(specialization)
                              ? "border-primary bg-primary/10"
                              : "border-input"
                          }`}
                          onClick={() => toggleRoleSpecialization(roleType, specialization)}
                        >
                          <Checkbox 
                            checked={jobPreference.roleSpecializations[roleType]?.includes(specialization) || false}
                            onCheckedChange={() => toggleRoleSpecialization(roleType, specialization)}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <Label className="cursor-pointer">{specialization}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null
              )}

              {!jobPreference.roleTypes.some(type => roleSpecializations[type]) && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p>No specializations available for your selected role types.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Where would you like to work?</h2>
            </div>

            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
              {countries.map((country) => (
                <div key={country.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{country.name}</h3>
                    <div className="flex items-center">
                      <Checkbox 
                        id={`select-all-${country.name}`} 
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setJobPreference(prev => ({
                              ...prev,
                              locations: {
                                ...prev.locations,
                                countries: {
                                  ...prev.locations.countries,
                                  [country.name]: [...country.cities]
                                }
                              }
                            }));
                          } else {
                            setJobPreference(prev => ({
                              ...prev,
                              locations: {
                                ...prev.locations,
                                countries: {
                                  ...prev.locations.countries,
                                  [country.name]: []
                                }
                              }
                            }));
                          }
                        }}
                        checked={(jobPreference.locations.countries[country.name]?.length || 0) === country.cities.length}
                      />
                      <Label htmlFor={`select-all-${country.name}`} className="ml-2">
                        Select all in {country.name}
                      </Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {country.cities.map((city) => (
                      <div 
                        key={city}
                        className={`flex items-center space-x-2 border rounded-lg p-2 cursor-pointer ${
                          jobPreference.locations.countries[country.name]?.includes(city)
                            ? "border-primary bg-primary/10"
                            : "border-input"
                        }`}
                        onClick={() => toggleLocation(country.name, city)}
                      >
                        <Checkbox 
                          checked={jobPreference.locations.countries[country.name]?.includes(city) || false}
                          onCheckedChange={() => toggleLocation(country.name, city)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label className="cursor-pointer">{city}</Label>
                        {city.includes("Remote") && (
                          <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700 border-blue-300">Remote</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">What level of roles are you looking for?</h2>
              <p className="text-sm text-muted-foreground">Select up to 2</p>
            </div>

            <div className="space-y-3">
              {experienceLevels.map((level) => (
                <div 
                  key={level}
                  className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${
                    jobPreference.experienceLevels.includes(level)
                      ? "border-primary bg-primary/10"
                      : "border-input"
                  }`}
                  onClick={() => toggleExperienceLevel(level)}
                >
                  <Checkbox 
                    checked={jobPreference.experienceLevels.includes(level)}
                    onCheckedChange={() => toggleExperienceLevel(level)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    disabled={jobPreference.experienceLevels.length >= 2 && !jobPreference.experienceLevels.includes(level)}
                  />
                  <Label className="cursor-pointer">{level}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">What is your ideal company size?</h2>
            </div>

            <div className="space-y-3">
              <div 
                className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${
                  jobPreference.companySizes.length === 0
                    ? "border-primary bg-primary/10"
                    : "border-input"
                }`}
                onClick={() => setJobPreference(prev => ({ ...prev, companySizes: [] }))}
              >
                <Checkbox 
                  checked={jobPreference.companySizes.length === 0}
                  onCheckedChange={() => setJobPreference(prev => ({ ...prev, companySizes: [] }))}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label className="cursor-pointer">Unselect all sizes</Label>
              </div>
              {companySizes.map((size) => (
                <div 
                  key={size}
                  className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${
                    jobPreference.companySizes.includes(size)
                      ? "border-primary bg-primary/10"
                      : "border-input"
                  }`}
                  onClick={() => toggleCompanySize(size)}
                >
                  <Checkbox 
                    checked={jobPreference.companySizes.includes(size)}
                    onCheckedChange={() => toggleCompanySize(size)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label className="cursor-pointer">{size}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">What industries are exciting to you?</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-lg">
                <Checkbox 
                  id="exciting-industries" 
                  checked={true}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  disabled
                />
                <Label htmlFor="exciting-industries">First, what industries are exciting to you?</Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {industries.map((industry) => (
                  <button
                    key={industry}
                    onClick={() => toggleIndustry(industry)}
                    className={`px-4 py-2 rounded-full border transition-colors ${
                      jobPreference.industries.includes(industry)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-3 rounded-lg mt-6">
                <X size={16} className="text-red-500" />
                <Label>Second, are there any industries you don't want to work in?</Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {industries.map((industry) => (
                  <button
                    key={`avoid-${industry}`}
                    onClick={() => toggleAvoidIndustry(industry)}
                    className={`px-4 py-2 rounded-full border transition-colors ${
                      jobPreference.avoidIndustries.includes(industry)
                        ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
                        : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">What skills do you have or enjoy working with?</h2>
              <p className="text-sm text-muted-foreground">Select all that applies</p>
            </div>

            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg flex items-start space-x-3">
                <Info size={20} className="text-blue-500 flex-shrink-0 mt-1" />
                <p className="text-sm">
                  Click on a skill once to indicate you enjoy working with it. Click on a skill twice to indicate that you'd prefer roles that utilize that skill.
                </p>
              </div>

              <div className="relative">
                <Input 
                  placeholder="Search all skills..." 
                  className="pl-9"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search size={16} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-2 rounded-full border transition-colors ${
                      jobPreference.skills.includes(skill)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-3 rounded-lg mt-6">
                <X size={16} className="text-red-500" />
                <Label>Are there any skills you don't want to work with?</Label>
              </div>

              <div className="relative">
                <Input 
                  placeholder="Skills to filter out" 
                  className="pl-9"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search size={16} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <button
                    key={`avoid-${skill}`}
                    onClick={() => toggleAvoidSkill(skill)}
                    className={`px-4 py-2 rounded-full border transition-colors ${
                      jobPreference.avoidSkills.includes(skill)
                        ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
                        : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">What is your minimum expected salary?</h2>
            </div>

            <div className="space-y-8">
              <div className="bg-muted/30 p-4 rounded-lg flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <img 
                    src="https://randomuser.me/api/portraits/men/32.jpg" 
                    alt="User avatar" 
                    className="w-8 h-8 rounded-full"
                  />
                </div>
                <p className="text-sm">
                  We'll only use this to match you with jobs and will not share this data.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-muted flex flex-col items-center justify-center">
                  <span className="text-sm text-muted-foreground">At least</span>
                  <span className="text-3xl font-bold">${jobPreference.minSalary}k</span>
                  <span className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded mt-1">USD</span>
                </div>
              </div>

              <div className="px-4">
                <Slider
                  defaultValue={[0]}
                  max={300}
                  step={5}
                  value={[jobPreference.minSalary]}
                  onValueChange={(value) => setMinSalary(value[0])}
                />
              </div>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Would you like to see roles that require top security clearance?</h2>
              <p className="text-sm text-muted-foreground">
                Certain government and defense-related positions may require security clearance.
              </p>
            </div>

            <div className="space-y-3">
              <div 
                className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${
                  jobPreference.securityClearance
                    ? "border-primary bg-primary/10"
                    : "border-input"
                }`}
                onClick={() => toggleSecurityClearance(true)}
              >
                <Checkbox 
                  checked={jobPreference.securityClearance}
                  onCheckedChange={() => toggleSecurityClearance(true)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label className="cursor-pointer">Yes</Label>
              </div>
              <div 
                className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${
                  !jobPreference.securityClearance
                    ? "border-primary bg-primary/10"
                    : "border-input"
                }`}
                onClick={() => toggleSecurityClearance(false)}
              >
                <Checkbox 
                  checked={!jobPreference.securityClearance}
                  onCheckedChange={() => toggleSecurityClearance(false)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label className="cursor-pointer">No</Label>
              </div>
            </div>
          </div>
        );

      case 11:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Lastly, what's the status of your job search?</h2>
            </div>

            <div className="space-y-3">
              <div 
                className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${
                  jobPreference.jobSearchStatus === "Actively looking"
                    ? "border-primary bg-primary/10"
                    : "border-input"
                }`}
                onClick={() => setJobSearchStatus("Actively looking")}
              >
                <Checkbox 
                  checked={jobPreference.jobSearchStatus === "Actively looking"}
                  onCheckedChange={() => setJobSearchStatus("Actively looking")}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label className="cursor-pointer">Actively looking</Label>
              </div>
              <div 
                className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${
                  jobPreference.jobSearchStatus === "Not looking but open to offers"
                    ? "border-primary bg-primary/10"
                    : "border-input"
                }`}
                onClick={() => setJobSearchStatus("Not looking but open to offers")}
              >
                <Checkbox 
                  checked={jobPreference.jobSearchStatus === "Not looking but open to offers"}
                  onCheckedChange={() => setJobSearchStatus("Not looking but open to offers")}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label className="cursor-pointer">Not looking but open to offers</Label>
              </div>
              <div 
                className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${
                  jobPreference.jobSearchStatus === "Not looking and closed to offers"
                    ? "border-primary bg-primary/10"
                    : "border-input"
                }`}
                onClick={() => setJobSearchStatus("Not looking and closed to offers")}
              >
                <Checkbox 
                  checked={jobPreference.jobSearchStatus === "Not looking and closed to offers"}
                  onCheckedChange={() => setJobSearchStatus("Not looking and closed to offers")}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label className="cursor-pointer">Not looking and closed to offers</Label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="pb-4 relative">
        <div className="absolute inset-x-0 top-0 px-6 pt-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousStep}
                disabled={currentStep === 1}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <ChevronLeft size={16} className="inline mr-1" />
                BACK
              </button>
            </div>
            <div>
              <span className="text-sm text-gray-500">{progress}%</span>
            </div>
          </div>
          <Progress value={progress} className="h-1.5 bg-blue-100" indicatorClassName="bg-blue-500" />
        </div>
        {/* Banner at the top */}
        <div className="bg-blue-500 text-white p-4 rounded-lg mt-10 mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info size={20} />
            <span>
              New Job Preferences! • We've added more in depth role types and added new industry, skill, and company filters. Update your preferences for better matches!
            </span>
          </div>
          <button className="text-white hover:bg-blue-600 rounded-full p-1">
            <X size={20} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {renderStepContent()}
      </CardContent>
      <CardFooter className="border-t p-4 flex justify-center">
        {currentStep === 11 ? (
          <Button 
            className="w-full max-w-xs gap-2"
            onClick={handleSaveAndContinue}
          >
            Save and Continue
            <ChevronRight size={16} />
          </Button>
        ) : (
          <Button 
            className="w-full max-w-xs gap-2"
            onClick={goToNextStep}
          >
            Save and Continue
            <ChevronRight size={16} />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export const JobPreferences = () => {
  const [showPreferences, setShowPreferences] = useState(false);
  const [savedPreferences, setSavedPreferences] = useState<JobPreference | null>(null);

  const handleSavePreferences = (prefs: JobPreference) => {
    setSavedPreferences(prefs);
    setShowPreferences(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Job Preferences</h2>
        <Button onClick={() => setShowPreferences(true)}>
          {savedPreferences ? 'Edit Preferences' : 'Add Preferences'}
        </Button>
      </div>

      {!savedPreferences && !showPreferences ? (
        <Card className="bg-muted/30">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Info size={24} className="text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Job Preferences Set</h3>
            <p className="text-muted-foreground mb-4">
              Set your job preferences to help us find the best job matches for you.
            </p>
            <Button onClick={() => setShowPreferences(true)}>
              Set Job Preferences
            </Button>
          </CardContent>
        </Card>
      ) : (
        !showPreferences && savedPreferences && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedPreferences.values.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Values</h3>
                    <div className="flex flex-wrap gap-2">
                      {savedPreferences.values.map(value => (
                        <Badge key={value} variant="secondary">{value}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {savedPreferences.roleTypes.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Role Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {savedPreferences.roleTypes.map(type => (
                        <Badge key={type} variant="secondary">{type}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(savedPreferences.locations.countries).length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Locations</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(savedPreferences.locations.countries).map(([country, cities]) => 
                        cities.map(city => (
                          <Badge key={`${country}-${city}`} variant="secondary">
                            {city}
                            {city.includes("Remote") && (
                              <span className="ml-1 text-xs bg-blue-200 text-blue-700 px-1 rounded">Remote</span>
                            )}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {savedPreferences.experienceLevels.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Experience Levels</h3>
                    <div className="flex flex-wrap gap-2">
                      {savedPreferences.experienceLevels.map(level => (
                        <Badge key={level} variant="secondary">{level}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {savedPreferences.industries.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Interested Industries</h3>
                    <div className="flex flex-wrap gap-2">
                      {savedPreferences.industries.map(industry => (
                        <Badge key={industry} variant="secondary">{industry}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {savedPreferences.skills.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {savedPreferences.skills.map(skill => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-medium mb-2">Minimum Salary</h3>
                  <Badge variant="outline" className="text-base font-medium">${savedPreferences.minSalary}k USD</Badge>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Job Search Status</h3>
                  <Badge 
                    variant={savedPreferences.jobSearchStatus === "Actively looking" ? "default" : "outline"}
                    className={savedPreferences.jobSearchStatus === "Actively looking" ? "bg-green-500" : ""}
                  >
                    {savedPreferences.jobSearchStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      )}

      {showPreferences && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg overflow-hidden w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Job Preferences</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowPreferences(false)}
              >
                <X size={20} />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <JobPreferencesDialog 
                onSave={handleSavePreferences} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

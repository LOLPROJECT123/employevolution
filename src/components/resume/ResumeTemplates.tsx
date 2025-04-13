
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, Search, Filter, Star, Eye, ThumbsUp, FileText, X, RefreshCcw } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ResumeTemplate, TemplateSource } from "./job-application/types";

// Template sources (simulating API services)
const templateSources: TemplateSource[] = [
  {
    id: "1",
    name: "ResumeGenius",
    url: "https://resumegenius.com",
    isActive: true,
    attribution: "Templates provided by ResumeGenius under fair use for demonstration"
  },
  {
    id: "2",
    name: "Zety",
    url: "https://zety.com",
    isActive: true,
    attribution: "Templates courtesy of Zety - Professional Resume Builder"
  },
  {
    id: "3",
    name: "Resume.io",
    url: "https://resume.io",
    isActive: true,
    attribution: "Resume templates by Resume.io - used for demonstration purposes"
  }
];

// Filter types
type FilterOptions = {
  companies: string[];
  roleTypes: string[];
  positions: string[];
  sources: string[];
};

const ResumeTemplates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<ResumeTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [activeFilters, setActiveFilters] = useState<{
    company: string | null;
    roleType: string | null;
    position: string | null;
    source: string | null;
  }>({
    company: null,
    roleType: null,
    position: null,
    source: null,
  });

  // Simulated API call to fetch templates
  const fetchTemplates = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would be an actual API call
      // For now, we'll simulate loading time and return our templates
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTemplates: ResumeTemplate[] = [
        {
          id: "1",
          title: "Google SWE Template",
          description: "Clean, ATS-optimized template used by a successful Google software engineer. Focuses on technical projects and quantifiable achievements.",
          imageUrl: "/placeholder.svg",
          previewUrl: "/placeholder.svg",
          downloadUrl: "/placeholder.svg",
          company: "Google",
          role: "Software Engineer",
          roleType: "Full-time",
          rating: 4.9,
          downloads: 12483,
          tags: ["Technical", "Software Engineering", "ATS-Optimized"],
          source: "ResumeGenius",
          attribution: "Template provided by ResumeGenius",
          licenseType: "free" // Changed from attribution-required to free
        },
        {
          id: "2",
          title: "Amazon PM Resume",
          description: "Template used by a Senior Product Manager at Amazon. Highlights leadership, product metrics and business impact.",
          imageUrl: "/placeholder.svg",
          previewUrl: "/placeholder.svg",
          downloadUrl: "/placeholder.svg",
          company: "Amazon",
          role: "Product Manager",
          roleType: "Full-time",
          rating: 4.7,
          downloads: 8976,
          tags: ["Product", "Leadership", "Business-Impact"],
          source: "Zety",
          attribution: "Template courtesy of Zety",
          licenseType: "free"
        },
        {
          id: "3",
          title: "Meta UI/UX Designer",
          description: "Visually appealing template for design roles that helped land a position at Meta. Includes portfolio links and project showcases.",
          imageUrl: "/placeholder.svg",
          previewUrl: "/placeholder.svg",
          downloadUrl: "/placeholder.svg",
          company: "Meta",
          role: "UI/UX Designer",
          roleType: "Full-time",
          rating: 4.8,
          downloads: 9254,
          tags: ["Design", "Portfolio", "Creative"],
          source: "Zety",
          attribution: "Template courtesy of Zety",
          licenseType: "free"
        },
        {
          id: "5",
          title: "Apple iOS Developer",
          description: "iOS developer template with a focus on App Store launches and technical achievements. ATS-friendly format that helped land a role at Apple.",
          imageUrl: "/placeholder.svg",
          previewUrl: "/placeholder.svg",
          downloadUrl: "/placeholder.svg",
          company: "Apple",
          role: "iOS Developer",
          roleType: "Contract",
          rating: 4.8,
          downloads: 10245,
          tags: ["Mobile", "iOS", "Developer"],
          source: "ResumeGenius",
          attribution: "Template provided by ResumeGenius",
          licenseType: "free" // Changed from attribution-required to free
        }
      ];
      
      setTemplates(mockTemplates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to load resume templates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Extract unique filter options
  const getFilterOptions = (): FilterOptions => {
    return {
      companies: [...new Set(templates.map(t => t.company))],
      roleTypes: [...new Set(templates.map(t => t.roleType || ""))].filter(Boolean),
      positions: [...new Set(templates.map(t => t.role))],
      sources: [...new Set(templates.map(t => t.source || ""))].filter(Boolean),
    };
  };
  
  const filterOptions = getFilterOptions();

  // Apply filters and search
  const getFilteredTemplates = () => {
    return templates.filter(template => {
      // Filter out premium templates entirely - don't even show them
      if (template.licenseType === 'premium') return false;
      
      // Search filter
      const matchesSearch = !searchTerm || 
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Dropdown filters
      const matchesCompany = !activeFilters.company || template.company === activeFilters.company;
      const matchesRoleType = !activeFilters.roleType || template.roleType === activeFilters.roleType;
      const matchesPosition = !activeFilters.position || template.role === activeFilters.position;
      const matchesSource = !activeFilters.source || template.source === activeFilters.source;
      
      return matchesSearch && matchesCompany && matchesRoleType && matchesPosition && matchesSource;
    });
  };

  const filteredTemplates = getFilteredTemplates();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
  };

  const handleFilterChange = (filterType: 'company' | 'roleType' | 'position' | 'source', value: string | null) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      company: null,
      roleType: null,
      position: null,
      source: null
    });
    setSearchTerm("");
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length + (searchTerm ? 1 : 0);

  const handleDownload = (template: ResumeTemplate) => {
    // In a real app, this would handle the actual download
    console.log(`Downloading template: ${template.title}`);
    
    toast({
      title: "Resume Template Downloaded",
      description: `${template.title} has been downloaded successfully. ${template.attribution}`,
    });
  };
  
  const handleUseTemplate = (template: ResumeTemplate) => {
    console.log(`Using template: ${template.title}`);
    toast({
      title: "Template Selected",
      description: `You are now using the ${template.title} template.`,
    });
  };

  const handleRefresh = () => {
    fetchTemplates();
    toast({
      title: "Refreshing Templates",
      description: "Fetching the latest templates from our sources...",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">Resume Templates</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh templates</span>
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-8 pr-4"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 rounded-full h-5 w-5 p-0 flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter Templates</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-medium">Company</DropdownMenuLabel>
                <Select 
                  value={activeFilters.company || "all"} 
                  onValueChange={(value) => handleFilterChange('company', value === "all" ? null : value)}
                >
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue placeholder="All Companies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {filterOptions.companies.map(company => (
                      <SelectItem key={company} value={company}>{company}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-medium">Role Type</DropdownMenuLabel>
                <Select 
                  value={activeFilters.roleType || "all"} 
                  onValueChange={(value) => handleFilterChange('roleType', value === "all" ? null : value)}
                >
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue placeholder="All Role Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Role Types</SelectItem>
                    {filterOptions.roleTypes.map(roleType => (
                      <SelectItem key={roleType} value={roleType}>{roleType}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-medium">Position</DropdownMenuLabel>
                <Select 
                  value={activeFilters.position || "all"} 
                  onValueChange={(value) => handleFilterChange('position', value === "all" ? null : value)}
                >
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue placeholder="All Positions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Positions</SelectItem>
                    {filterOptions.positions.map(position => (
                      <SelectItem key={position} value={position}>{position}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-medium">Source</DropdownMenuLabel>
                <Select 
                  value={activeFilters.source || "all"} 
                  onValueChange={(value) => handleFilterChange('source', value === "all" ? null : value)}
                >
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {filterOptions.sources.map(source => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <div className="p-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs h-8"
                  onClick={clearAllFilters}
                >
                  <X className="h-4 w-4 mr-2" /> Clear All Filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          <div className="flex flex-wrap gap-1">
            {activeFilters.company && (
              <Badge variant="outline" className="flex items-center gap-1">
                Company: {activeFilters.company}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('company', null)}
                />
              </Badge>
            )}
            {activeFilters.roleType && (
              <Badge variant="outline" className="flex items-center gap-1">
                Role Type: {activeFilters.roleType}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('roleType', null)}
                />
              </Badge>
            )}
            {activeFilters.position && (
              <Badge variant="outline" className="flex items-center gap-1">
                Position: {activeFilters.position}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('position', null)}
                />
              </Badge>
            )}
            {activeFilters.source && (
              <Badge variant="outline" className="flex items-center gap-1">
                Source: {activeFilters.source}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('source', null)}
                />
              </Badge>
            )}
            {searchTerm && (
              <Badge variant="outline" className="flex items-center gap-1">
                Search: {searchTerm}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setSearchTerm("")}
                />
              </Badge>
            )}
            {activeFilterCount > 1 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs"
                onClick={clearAllFilters}
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCcw className="h-10 w-10 animate-spin mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Fetching resume templates...</p>
          </div>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map(template => (
                <Card key={template.id} className="overflow-hidden flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <Badge variant="secondary" className="ml-2">
                        {template.company}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground mt-1">{template.role}</p>
                      {template.source && (
                        <p className="text-xs text-muted-foreground">Source: {template.source}</p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 flex-1">
                    <div className="relative mb-3">
                      <AspectRatio ratio={3/4} className="bg-muted overflow-hidden rounded-md border">
                        <img 
                          src={template.imageUrl} 
                          alt={template.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50 rounded-md">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => setPreviewTemplate(template)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{template.title}</DialogTitle>
                                <DialogDescription>
                                  {template.description}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-4">
                                <AspectRatio ratio={3/4} className="overflow-hidden rounded-md border">
                                  <img 
                                    src={template.previewUrl} 
                                    alt={template.title}
                                    className="w-full h-full object-contain bg-white"
                                  />
                                </AspectRatio>
                                <div className="mt-2 text-xs text-muted-foreground">
                                  {template.attribution}
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 mt-4">
                                <Button 
                                  variant="outline" 
                                  onClick={() => handleUseTemplate(template)}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Use This Template
                                </Button>
                                <Button onClick={() => handleDownload(template)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </AspectRatio>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {template.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-3 flex justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {template.rating}
                      <span className="mx-2">•</span>
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {template.downloads.toLocaleString()}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleUseTemplate(template)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Use
                      </Button>
                      <Button size="sm" onClick={() => handleDownload(template)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No templates found matching your criteria</p>
                <Button variant="link" onClick={clearAllFilters}>Clear filters</Button>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default ResumeTemplates;

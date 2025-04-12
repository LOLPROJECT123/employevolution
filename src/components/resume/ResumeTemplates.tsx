
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, Search, Filter, Star, Eye, ThumbsUp, FileText } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { ResumeTemplate } from "./job-application/types";

const ResumeTemplates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<ResumeTemplate | null>(null);

  const templates: ResumeTemplate[] = [
    {
      id: "1",
      title: "Google SWE Template",
      description: "Clean, ATS-optimized template used by a successful Google software engineer. Focuses on technical projects and quantifiable achievements.",
      imageUrl: "https://resumegenius.com/wp-content/uploads/software-engineer-resume-example-classic.png",
      previewUrl: "https://resumegenius.com/wp-content/uploads/software-engineer-resume-example-classic.png",
      downloadUrl: "#",
      company: "Google",
      role: "Software Engineer",
      rating: 4.9,
      downloads: 12483,
      tags: ["Technical", "Software Engineering", "ATS-Optimized"]
    },
    {
      id: "2",
      title: "Amazon PM Resume",
      description: "Template used by a Senior Product Manager at Amazon. Highlights leadership, product metrics and business impact.",
      imageUrl: "https://www.resumeviking.com/wp-content/uploads/2021/08/Sample-Resume-Product-Manager.png",
      previewUrl: "https://www.resumeviking.com/wp-content/uploads/2021/08/Sample-Resume-Product-Manager.png",
      downloadUrl: "#",
      company: "Amazon",
      role: "Product Manager",
      rating: 4.7,
      downloads: 8976,
      tags: ["Product", "Leadership", "Business-Impact"]
    },
    {
      id: "3",
      title: "Meta UI/UX Designer",
      description: "Visually appealing template for design roles that helped land a position at Meta. Includes portfolio links and project showcases.",
      imageUrl: "https://cdn-images.zety.com/pages/graphic_designer_resume_example_6.png",
      previewUrl: "https://cdn-images.zety.com/pages/graphic_designer_resume_example_6.png",
      downloadUrl: "#",
      company: "Meta",
      role: "UI/UX Designer",
      rating: 4.8,
      downloads: 9254,
      tags: ["Design", "Portfolio", "Creative"]
    },
    {
      id: "4",
      title: "Microsoft Data Scientist",
      description: "Template for data science roles with sections for ML projects, technical skills, and business outcomes. Helped secure a role at Microsoft.",
      imageUrl: "https://www.livecareer.com/wp-content/uploads/2021/12/data-scientist-resume-examples-2022.png",
      previewUrl: "https://www.livecareer.com/wp-content/uploads/2021/12/data-scientist-resume-examples-2022.png",
      downloadUrl: "#",
      company: "Microsoft",
      role: "Data Scientist",
      rating: 4.6,
      downloads: 7654,
      tags: ["Data Science", "Technical", "Analytics"]
    },
    {
      id: "5",
      title: "Apple iOS Developer",
      description: "iOS developer template with a focus on App Store launches and technical achievements. ATS-friendly format that helped land a role at Apple.",
      imageUrl: "https://www.beamjobs.com/hs-fs/hubfs/iOS%20Developer%20Resume.png",
      previewUrl: "https://www.beamjobs.com/hs-fs/hubfs/iOS%20Developer%20Resume.png",
      downloadUrl: "#",
      company: "Apple",
      role: "iOS Developer",
      rating: 4.8,
      downloads: 10245,
      tags: ["Mobile", "iOS", "Developer"]
    },
    {
      id: "6",
      title: "Netflix SRE Resume",
      description: "Site Reliability Engineer template with emphasis on system performance, monitoring and incident response. Successfully used for Netflix SRE role.",
      imageUrl: "https://www.beamjobs.com/hs-fs/hubfs/Copy%20of%20DevOps%20Resume%20Template.png",
      previewUrl: "https://www.beamjobs.com/hs-fs/hubfs/Copy%20of%20DevOps%20Resume%20Template.png",
      downloadUrl: "#",
      company: "Netflix",
      role: "Site Reliability Engineer",
      rating: 4.7,
      downloads: 6543,
      tags: ["SRE", "DevOps", "Technical"]
    }
  ];

  const [filteredTemplates, setFilteredTemplates] = useState(templates);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term) {
      setFilteredTemplates(templates);
      return;
    }

    const filtered = templates.filter(template => 
      template.title.toLowerCase().includes(term) ||
      template.description.toLowerCase().includes(term) ||
      template.company.toLowerCase().includes(term) ||
      template.role.toLowerCase().includes(term) ||
      template.tags.some(tag => tag.toLowerCase().includes(term))
    );
    
    setFilteredTemplates(filtered);
  };

  const handleDownload = (template: ResumeTemplate) => {
    // In a real app, this would download the template
    console.log(`Downloading template: ${template.title}`);
    toast({
      title: "Resume Downloaded",
      description: `${template.title} has been downloaded successfully.`,
    });
  };
  
  const handleUseTemplate = (template: ResumeTemplate) => {
    console.log(`Using template: ${template.title}`);
    toast({
      title: "Template Selected",
      description: `You are now using the ${template.title} template.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Resume Templates</h2>
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
          <Button variant="outline" size="sm" className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

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
                  <p className="text-sm text-muted-foreground mt-1">{template.role}</p>
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
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUseTemplate(template)}
                    >
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
              <p className="text-muted-foreground">No templates found matching "{searchTerm}"</p>
              <Button variant="link" onClick={() => setSearchTerm("")}>Clear search</Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ResumeTemplates;

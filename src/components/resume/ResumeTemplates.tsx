
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, Search, Filter, Star, Eye, ThumbsUp } from "lucide-react";

interface ResumeTemplate {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  downloadUrl: string;
  company: string;
  role: string;
  rating: number;
  downloads: number;
  tags: string[];
}

const ResumeTemplates = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const templates: ResumeTemplate[] = [
    {
      id: "1",
      title: "Google SWE Template",
      description: "Clean, ATS-optimized template used by a successful Google software engineer. Focuses on technical projects and quantifiable achievements.",
      imageUrl: "/lovable-uploads/fd29740f-40fa-4e9a-83b7-4a042d2d3140.png",
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
      imageUrl: "/lovable-uploads/fd29740f-40fa-4e9a-83b7-4a042d2d3140.png",
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
      imageUrl: "/lovable-uploads/fd29740f-40fa-4e9a-83b7-4a042d2d3140.png",
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
      imageUrl: "/lovable-uploads/fd29740f-40fa-4e9a-83b7-4a042d2d3140.png",
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
      imageUrl: "/lovable-uploads/fd29740f-40fa-4e9a-83b7-4a042d2d3140.png",
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
      imageUrl: "/lovable-uploads/fd29740f-40fa-4e9a-83b7-4a042d2d3140.png",
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
                  <div className="relative aspect-[3/4] mb-3">
                    <img 
                      src={template.imageUrl} 
                      alt={template.title}
                      className="w-full h-full object-cover border rounded-md"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50 rounded-md">
                      <Button variant="secondary" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </div>
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
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
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

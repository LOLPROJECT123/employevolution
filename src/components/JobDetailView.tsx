
import { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, Clock, BookmarkIcon, ExternalLinkIcon, BadgeCheck } from "lucide-react";
import { CandidateMatchPreferences } from "@/components/CandidateMatchPreferences";

interface JobDetailViewProps {
  job: Job | null;
  onApply: (job: Job) => void;
  onSave: (job: Job) => void;
}

export function JobDetailView({ job, onApply, onSave }: JobDetailViewProps) {
  if (!job) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No Job Selected</h3>
          <p className="text-muted-foreground mt-2">
            Select a job from the list to view details
          </p>
        </CardContent>
      </Card>
    );
  }

  const formattedSalary = `${job.salary.currency}${job.salary.min.toLocaleString()} - ${job.salary.currency}${job.salary.max.toLocaleString()}`;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              {job.title}
              {job.remote && (
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  Remote
                </Badge>
              )}
            </h2>
            <p className="text-muted-foreground">
              {job.company} • {job.location}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onSave(job)}
              className="button-hover"
            >
              <BookmarkIcon className="w-4 h-4" />
            </Button>
            {job.applyUrl && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(job.applyUrl, '_blank')}
                className="button-hover"
              >
                <ExternalLinkIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="max-h-[calc(100vh-300px)] overflow-y-auto pb-2">
        <Tabs defaultValue="summary" className="mb-6">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="full-posting">Full Job Posting</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-4 space-y-6">
            {job.matchCriteria && (
              <CandidateMatchPreferences preferences={job.matchCriteria} />
            )}
            
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="px-3 py-1 rounded-full bg-secondary text-sm">
                {job.type}
              </div>
              <div className="px-3 py-1 rounded-full bg-secondary text-sm">
                {job.level}
              </div>
              <div className="px-3 py-1 rounded-full bg-secondary text-sm">
                {formattedSalary}
              </div>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <Clock className="w-4 h-4 mr-2" />
              Posted on {new Date(job.postedAt).toLocaleDateString()}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Requirements</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {job.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <div key={index} className="px-3 py-1 rounded-full bg-secondary/70 text-sm">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="full-posting" className="mt-4 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Job Description</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {job.description}
              </p>
            </div>
            
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Responsibilities</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {job.responsibilities.map((responsibility, idx) => (
                    <li key={idx}>{responsibility}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-medium mb-3">Requirements</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {job.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
            
            {job.education && job.education.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Education</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {job.education.map((edu, idx) => (
                    <li key={idx}>{edu}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {job.benefits && job.benefits.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Benefits</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {job.benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {job.applyUrl && (
              <div className="p-4 rounded-lg bg-secondary/20 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BadgeCheck className="w-5 h-5 text-primary" />
                  <span className="font-medium">Application Details</span>
                </div>
                <p className="text-muted-foreground mb-2">
                  Click the "Apply Now" button to visit the application page.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            className="w-full button-hover"
            onClick={() => onApply(job)}
          >
            Apply Now
          </Button>
          <Button
            variant="outline"
            className="w-full button-hover"
            onClick={() => onSave(job)}
          >
            Save Job
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

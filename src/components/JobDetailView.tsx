
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users,
  Calendar,
  ExternalLink,
  Bookmark,
  Share
} from 'lucide-react';

interface JobDetailViewProps {
  job: any;
  onApply?: (job: any) => void;
  onSave?: (job: any) => void;
  onShare?: (job: any) => void;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({ 
  job, 
  onApply, 
  onSave, 
  onShare 
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Building className="h-4 w-4" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{job.posted}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => onSave?.(job)}>
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onShare?.(job)}>
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <div className="text-sm font-medium">{job.salary}</div>
            <div className="text-xs text-muted-foreground">Salary</div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
            <div className="text-sm font-medium">{job.type}</div>
            <div className="text-xs text-muted-foreground">Type</div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <Calendar className="h-5 w-5 mx-auto mb-1 text-purple-600" />
            <div className="text-sm font-medium">Immediate</div>
            <div className="text-xs text-muted-foreground">Start Date</div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <Clock className="h-5 w-5 mx-auto mb-1 text-orange-600" />
            <div className="text-sm font-medium">{job.posted}</div>
            <div className="text-xs text-muted-foreground">Posted</div>
          </div>
        </div>

        {/* Job Description */}
        <div>
          <h3 className="font-semibold mb-3">Job Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {job.description}
          </p>
        </div>

        <Separator />

        {/* Requirements */}
        <div>
          <h3 className="font-semibold mb-3">Requirements</h3>
          <div className="flex flex-wrap gap-2">
            {job.requirements?.map((req: string, index: number) => (
              <Badge key={index} variant="secondary">
                {req}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Benefits */}
        {job.benefits && (
          <>
            <div>
              <h3 className="font-semibold mb-3">Benefits</h3>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((benefit: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-green-700 border-green-200">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Company Info */}
        <div>
          <h3 className="font-semibold mb-3">About {job.company}</h3>
          <p className="text-sm text-muted-foreground">
            {job.companyDescription || `Join ${job.company} and be part of an innovative team that's shaping the future of technology. We offer competitive compensation, excellent benefits, and opportunities for professional growth.`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button onClick={() => onApply?.(job)} className="flex-1">
            Apply Now
          </Button>
          <Button variant="outline" onClick={() => onSave?.(job)}>
            <Bookmark className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="icon">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobDetailView;

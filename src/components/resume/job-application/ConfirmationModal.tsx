
import { useState } from "react";
import { ScrapedJob } from "./types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react";

interface ConfirmationModalProps {
  selectedJob: ScrapedJob;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal = ({
  selectedJob,
  isSubmitting,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  const [isOpen, setIsOpen] = useState(true);
  
  const handleCancel = () => {
    setIsOpen(false);
    onCancel();
  };
  
  const handleConfirm = () => {
    onConfirm();
  };

  const formatMatchBadge = (percentage: number | undefined) => {
    if (!percentage) return null;
    
    if (percentage >= 90) {
      return <Badge className="bg-green-500 hover:bg-green-600">{percentage}% Match</Badge>;
    } else if (percentage >= 80) {
      return <Badge className="bg-emerald-500 hover:bg-emerald-600">{percentage}% Match</Badge>;
    } else {
      return <Badge className="bg-blue-500 hover:bg-blue-600">{percentage}% Match</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply to This Job?</DialogTitle>
          <DialogDescription>
            You're about to apply for the following position:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium">{selectedJob.title}</h3>
            <div className="flex gap-2">
              {selectedJob.verified && (
                <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Verified</span>
                </Badge>
              )}
              {selectedJob.matchPercentage && formatMatchBadge(selectedJob.matchPercentage)}
            </div>
          </div>
          
          <p>
            <span className="font-medium">Company:</span> {selectedJob.company}
          </p>
          <p>
            <span className="font-medium">Location:</span> {selectedJob.location}
          </p>
          <p>
            <span className="font-medium">Source:</span> {selectedJob.source}
          </p>
          {selectedJob.datePosted && (
            <p>
              <span className="font-medium">Posted:</span> {selectedJob.datePosted}
            </p>
          )}
          
          <div className="flex gap-4 mt-4">
            <a
              href={selectedJob.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View Job Details <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href={selectedJob.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Manual Apply <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Apply Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;


import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Check } from "lucide-react";
import { ScrapedJob } from "./types";

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
  onCancel 
}: ConfirmationModalProps) => {
  return (
    <div className="p-4 border rounded-md bg-muted/30">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium">Confirm Application</h4>
          <p className="text-sm text-muted-foreground">
            You're about to apply for <strong>{selectedJob.title}</strong> at <strong>{selectedJob.company}</strong>. 
            Your profile and resume will be used to fill out the application form.
          </p>
          <div className="flex items-center space-x-3 mt-3">
            <Button 
              type="button" 
              onClick={onConfirm} 
              disabled={isSubmitting}
              size="sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-3 w-3" />
                  Confirm & Apply
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

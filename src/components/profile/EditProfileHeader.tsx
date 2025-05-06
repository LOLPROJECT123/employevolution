import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditProfileHeaderProps {
  open: boolean;
  onClose: () => void;
  onOpenChange?: (open: boolean) => void;
  initialData: {
    name: string;
    jobStatus: string;
  };
  onSave: (data: { name: string; jobStatus: string }) => void;
}

const jobStatusOptions = [
  "Actively looking",
  "Open to opportunities",
  "Not looking",
  "Employed but open",
  "Interviewing"
];

const EditProfileHeader: React.FC<EditProfileHeaderProps> = ({
  open,
  onClose,
  onOpenChange,
  initialData,
  onSave,
}) => {
  const [name, setName] = useState(initialData.name);
  const [jobStatus, setJobStatus] = useState(initialData.jobStatus);

  const handleSave = () => {
    onSave({ name, jobStatus });
    onClose();
  };
  
  // Use onOpenChange if provided, otherwise use onClose
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && onClose) {
      onClose();
    }
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="jobStatus" className="text-right text-sm font-medium">
              Job Status
            </label>
            <Select
              value={jobStatus}
              onValueChange={setJobStatus}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select job status" />
              </SelectTrigger>
              <SelectContent>
                {jobStatusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileHeader;

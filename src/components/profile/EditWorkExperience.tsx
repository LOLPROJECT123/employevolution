
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FullDatePicker } from "@/components/ui/full-date-picker";

interface WorkExperience {
  id: number;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface EditWorkExperienceProps {
  open: boolean;
  onClose: () => void;
  experience?: WorkExperience;
  onSave: (experience: WorkExperience) => void;
  onDelete?: (id: number) => void;
}

const EditWorkExperience: React.FC<EditWorkExperienceProps> = ({
  open,
  onClose,
  experience,
  onSave,
  onDelete,
}) => {
  const [role, setRole] = useState(experience?.role || "");
  const [company, setCompany] = useState(experience?.company || "");
  const [location, setLocation] = useState(experience?.location || "");
  const [startDate, setStartDate] = useState(experience?.startDate || "");
  const [endDate, setEndDate] = useState(experience?.endDate || "");
  const [isPresent, setIsPresent] = useState(experience?.endDate === "Present" || false);
  const [description, setDescription] = useState(experience?.description || "");

  const handlePresentChange = (checked: boolean) => {
    setIsPresent(checked);
    if (checked) {
      setEndDate("Present");
    } else {
      setEndDate("");
    }
  };

  const handleSave = () => {
    onSave({
      id: experience?.id || Date.now(),
      role,
      company,
      location,
      startDate,
      endDate: isPresent ? "Present" : endDate,
      description: description.trim(),
    });
    onClose();
  };

  const handleDelete = () => {
    if (experience && onDelete) {
      console.log('Deleting work experience with ID:', experience.id);
      onDelete(experience.id);
      onClose();
    }
  };

  const isNew = !experience;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add" : "Edit"} Work Experience</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="role">Role/Title</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Software Engineer"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company Name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State, Country"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <FullDatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Select start date"
              />
            </div>
            <div className="grid gap-2">
              <Label>End Date</Label>
              <FullDatePicker
                value={isPresent ? "" : endDate}
                onChange={setEndDate}
                placeholder="Select end date"
                disabled={isPresent}
              />
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="present"
                  checked={isPresent}
                  onCheckedChange={handlePresentChange}
                />
                <Label htmlFor="present" className="text-sm">I currently work here</Label>
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your responsibilities and achievements"
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-between sm:justify-between">
          <div>
            {!isNew && onDelete && (
              <Button variant="destructive" onClick={handleDelete} type="button">
                Delete
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSave}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditWorkExperience;

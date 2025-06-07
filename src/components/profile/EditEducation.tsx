
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";

interface Education {
  id: number;
  school: string;
  degree: string;
  major?: string;
  startDate: string;
  endDate: string;
}

interface EditEducationProps {
  open: boolean;
  onClose: () => void;
  education?: Education;
  onSave: (education: Education) => void;
  onDelete?: (id: number) => void;
}

const EditEducation: React.FC<EditEducationProps> = ({
  open,
  onClose,
  education,
  onSave,
  onDelete,
}) => {
  const [school, setSchool] = useState(education?.school || "");
  const [degree, setDegree] = useState(education?.degree || "");
  const [major, setMajor] = useState(education?.major || "");
  const [startDate, setStartDate] = useState(education?.startDate || "");
  const [endDate, setEndDate] = useState(education?.endDate || "");
  const [isPresent, setIsPresent] = useState(education?.endDate === "Present" || false);

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
      id: education?.id || Date.now(),
      school,
      degree,
      major,
      startDate,
      endDate: isPresent ? "Present" : endDate,
    });
    onClose();
  };

  const handleDelete = () => {
    if (education && onDelete) {
      onDelete(education.id);
      onClose();
    }
  };

  const isNew = !education;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add" : "Edit"} Education</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="school">School/University</Label>
            <Input
              id="school"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="School or University Name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="degree">Degree</Label>
            <Input
              id="degree"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              placeholder="Bachelor's, Master's, PhD, etc."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="major">Major</Label>
            <Input
              id="major"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="Computer Science, Business, etc."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Select start date"
              />
            </div>
            <div className="grid gap-2">
              <Label>End Date</Label>
              <DatePicker
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
                <Label htmlFor="present" className="text-sm">Currently enrolled</Label>
              </div>
            </div>
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

export default EditEducation;

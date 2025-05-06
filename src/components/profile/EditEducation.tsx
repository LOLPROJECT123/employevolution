
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

interface Education {
  id: number;
  school: string;
  degree: string;
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
  const [startDate, setStartDate] = useState(education?.startDate || "");
  const [endDate, setEndDate] = useState(education?.endDate || "");

  const handleSave = () => {
    onSave({
      id: education?.id || Date.now(),
      school,
      degree,
      startDate,
      endDate,
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
            <label htmlFor="school" className="text-sm font-medium">
              School/University
            </label>
            <Input
              id="school"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="School or University Name"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="degree" className="text-sm font-medium">
              Degree
            </label>
            <Input
              id="degree"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              placeholder="Bachelor's, Computer Science"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="startDate" className="text-sm font-medium">
                Start Date
              </label>
              <Input
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="MMM YYYY"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="endDate" className="text-sm font-medium">
                End Date
              </label>
              <Input
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="MMM YYYY or Present"
              />
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

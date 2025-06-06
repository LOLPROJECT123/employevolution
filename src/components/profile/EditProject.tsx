
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
import { DatePicker } from "@/components/ui/date-picker";

interface Project {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface EditProjectProps {
  open: boolean;
  onClose: () => void;
  project?: Project;
  onSave: (project: Project) => void;
  onDelete?: (id: number) => void;
}

const EditProject: React.FC<EditProjectProps> = ({
  open,
  onClose,
  project,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState(project?.name || "");
  const [startDate, setStartDate] = useState(project?.startDate || "");
  const [endDate, setEndDate] = useState(project?.endDate || "");
  const [isOngoing, setIsOngoing] = useState(project?.endDate === "Ongoing" || false);
  const [description, setDescription] = useState(project?.description || "");

  const handleOngoingChange = (checked: boolean) => {
    setIsOngoing(checked);
    if (checked) {
      setEndDate("Ongoing");
    } else {
      setEndDate("");
    }
  };

  const handleSave = () => {
    onSave({
      id: project?.id || Date.now(),
      name,
      startDate,
      endDate: isOngoing ? "Ongoing" : endDate,
      description: description.trim(),
    });
    onClose();
  };

  const handleDelete = () => {
    if (project && onDelete) {
      onDelete(project.id);
      onClose();
    }
  };

  const isNew = !project;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add" : "Edit"} Project</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project Name"
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
                value={isOngoing ? "" : endDate}
                onChange={setEndDate}
                placeholder="Select end date"
                disabled={isOngoing}
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ongoing"
                  checked={isOngoing}
                  onCheckedChange={handleOngoingChange}
                />
                <Label htmlFor="ongoing" className="text-sm">This is an ongoing project</Label>
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project"
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

export default EditProject;

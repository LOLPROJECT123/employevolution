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
import { X, Plus } from "lucide-react";

interface Project {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  description: string[];
}

interface EditProjectProps {
  open: boolean;
  onClose: () => void;
  onOpenChange?: (open: boolean) => void;
  project?: Project;
  onSave: (project: Project) => void;
  onDelete?: (id: number) => void;
}

const EditProject: React.FC<EditProjectProps> = ({
  open,
  onClose,
  onOpenChange,
  project,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState(project?.name || "");
  const [startDate, setStartDate] = useState(project?.startDate || "");
  const [endDate, setEndDate] = useState(project?.endDate || "");
  const [descriptions, setDescriptions] = useState<string[]>(
    project?.description || [""]
  );

  const handleAddDescription = () => {
    setDescriptions([...descriptions, ""]);
  };

  const handleRemoveDescription = (index: number) => {
    const newDescriptions = [...descriptions];
    newDescriptions.splice(index, 1);
    setDescriptions(newDescriptions);
  };

  const handleUpdateDescription = (index: number, value: string) => {
    const newDescriptions = [...descriptions];
    newDescriptions[index] = value;
    setDescriptions(newDescriptions);
  };

  const handleSave = () => {
    const filteredDescriptions = descriptions.filter(desc => desc.trim() !== "");
    
    onSave({
      id: project?.id || Date.now(),
      name,
      startDate,
      endDate,
      description: filteredDescriptions,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add" : "Edit"} Project</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Project Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project Name"
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
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Description</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDescription}
                className="h-8 px-2"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Point
              </Button>
            </div>
            {descriptions.map((desc, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  value={desc}
                  onChange={(e) => handleUpdateDescription(index, e.target.value)}
                  placeholder="Describe your project"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveDescription(index)}
                  disabled={descriptions.length === 1}
                  className="h-10 w-10 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
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

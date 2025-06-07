
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

interface Project {
  id: number;
  name: string;
  url?: string;
  startDate: string;
  endDate: string;
  technologies?: string[];
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
  const [url, setUrl] = useState(project?.url || "");
  const [startDate, setStartDate] = useState(project?.startDate || "");
  const [endDate, setEndDate] = useState(project?.endDate || "");
  const [isOngoing, setIsOngoing] = useState(project?.endDate === "Ongoing" || false);
  const [technologies, setTechnologies] = useState(project?.technologies?.join(", ") || "");
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
      url: url.trim() || undefined,
      startDate,
      endDate: isOngoing ? "Ongoing" : endDate,
      technologies: technologies.split(",").map(tech => tech.trim()).filter(Boolean),
      description: description.trim(),
    });
    onClose();
  };

  const handleDelete = () => {
    if (project && onDelete) {
      console.log('Deleting project with ID:', project.id);
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
              placeholder="My Awesome Project"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="url">Project URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/username/project"
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
                value={isOngoing ? "" : endDate}
                onChange={setEndDate}
                placeholder="Select end date"
                disabled={isOngoing}
              />
              <div className="flex items-center space-x-2 mt-2">
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
            <Label htmlFor="technologies">Technologies/Skills Used</Label>
            <Input
              id="technologies"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="React, Node.js, MongoDB, etc."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project, what it does, and your role..."
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

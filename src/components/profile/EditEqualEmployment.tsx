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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EqualEmploymentData {
  ethnicity: string;
  workAuthUS: boolean;
  workAuthCanada: boolean;
  workAuthUK: boolean;
  needsSponsorship: boolean;
  gender: string;
  lgbtq: string;
  disability: string;
  veteran: string;
}

interface EditEqualEmploymentProps {
  open: boolean;
  onClose: () => void;
  onOpenChange?: (open: boolean) => void;
  initialData: EqualEmploymentData;
  onSave: (data: EqualEmploymentData) => void;
}

const ethnicityOptions = [
  "White",
  "Black or African American",
  "Hispanic or Latino",
  "Asian",
  "Native American or Alaska Native",
  "Native Hawaiian or Pacific Islander",
  "Middle Eastern or North African",
  "Southeast Asian",
  "Two or More Races",
  "Other",
  "Prefer not to say"
];

const genderOptions = [
  "Male",
  "Female",
  "Non-binary",
  "Other",
  "Prefer not to say"
];

const specifiedOptions = [
  "Yes",
  "No",
  "Prefer not to say",
  "Not specified"
];

const EditEqualEmployment: React.FC<EditEqualEmploymentProps> = ({
  open,
  onClose,
  onOpenChange,
  initialData,
  onSave,
}) => {
  const [ethnicity, setEthnicity] = useState(initialData.ethnicity);
  const [workAuthUS, setWorkAuthUS] = useState(initialData.workAuthUS);
  const [workAuthCanada, setWorkAuthCanada] = useState(initialData.workAuthCanada);
  const [workAuthUK, setWorkAuthUK] = useState(initialData.workAuthUK);
  const [needsSponsorship, setNeedsSponsorship] = useState(initialData.needsSponsorship);
  const [gender, setGender] = useState(initialData.gender);
  const [lgbtq, setLgbtq] = useState(initialData.lgbtq);
  const [disability, setDisability] = useState(initialData.disability);
  const [veteran, setVeteran] = useState(initialData.veteran);

  // Use onOpenChange if provided, otherwise use onClose
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && onClose) {
      onClose();
    }
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  };

  const handleSave = () => {
    onSave({
      ethnicity,
      workAuthUS,
      workAuthCanada,
      workAuthUK,
      needsSponsorship,
      gender,
      lgbtq,
      disability,
      veteran,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Equal Employment Information</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Ethnicity</label>
            <Select value={ethnicity} onValueChange={setEthnicity}>
              <SelectTrigger>
                <SelectValue placeholder="Select your ethnicity" />
              </SelectTrigger>
              <SelectContent>
                {ethnicityOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Work Authorization</label>
            <div className="space-y-3 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Authorized to work in the US</span>
                <Switch 
                  checked={workAuthUS} 
                  onCheckedChange={setWorkAuthUS}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Authorized to work in Canada</span>
                <Switch 
                  checked={workAuthCanada} 
                  onCheckedChange={setWorkAuthCanada}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Authorized to work in the UK</span>
                <Switch 
                  checked={workAuthUK} 
                  onCheckedChange={setWorkAuthUK}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Need sponsorship for work authorization</span>
                <Switch 
                  checked={needsSponsorship} 
                  onCheckedChange={setNeedsSponsorship}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Gender</label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">LGBTQ+</label>
            <Select value={lgbtq} onValueChange={setLgbtq}>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                {specifiedOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Person with a disability</label>
            <Select value={disability} onValueChange={setDisability}>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                {specifiedOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Veteran status</label>
            <Select value={veteran} onValueChange={setVeteran}>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                {specifiedOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-md mt-2 mb-4">
          <p className="text-sm text-muted-foreground">
            Equal Employment Opportunity (EEO) information is collected for statistical purposes only. 
            This information will be kept separate from your application and will not be used in the hiring decision.
          </p>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditEqualEmployment;

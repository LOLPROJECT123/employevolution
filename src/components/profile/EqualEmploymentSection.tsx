
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit } from "lucide-react";
import EditEqualEmployment from "./EditEqualEmployment";

export interface EqualEmploymentData {
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

interface EqualEmploymentSectionProps {
  data: EqualEmploymentData;
  onUpdate: (data: EqualEmploymentData) => void;
}

const EqualEmploymentSection: React.FC<EqualEmploymentSectionProps> = ({
  data,
  onUpdate,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getYesNo = (value: boolean) => (value ? "Yes" : "No");

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Equal Employment</h2>
        <Button 
          variant="outline" 
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-1"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit Data
        </Button>
      </div>

      <Card className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Ethnicity</h3>
          <p>{data.ethnicity}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Work Authorization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="mb-1">Authorized to work in the US</p>
              <Badge variant={data.workAuthUS ? "success" : "secondary"}>
                {getYesNo(data.workAuthUS)}
              </Badge>
            </div>
            <div>
              <p className="mb-1">Authorized to work in Canada</p>
              <Badge variant={data.workAuthCanada ? "success" : "secondary"}>
                {getYesNo(data.workAuthCanada)}
              </Badge>
            </div>
            <div>
              <p className="mb-1">Authorized to work in the UK</p>
              <Badge variant={data.workAuthUK ? "success" : "secondary"}>
                {getYesNo(data.workAuthUK)}
              </Badge>
            </div>
            <div>
              <p className="mb-1">Need sponsorship for work authorization</p>
              <Badge variant={data.needsSponsorship ? "warning" : "secondary"}>
                {getYesNo(data.needsSponsorship)}
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Demographic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="mb-1">Gender</p>
              <Badge variant="secondary">{data.gender}</Badge>
            </div>
            <div>
              <p className="mb-1">LGBTQ+</p>
              <Badge variant="secondary">{data.lgbtq}</Badge>
            </div>
            <div>
              <p className="mb-1">Person with a disability</p>
              <Badge variant="secondary">{data.disability}</Badge>
            </div>
            <div>
              <p className="mb-1">Veteran status</p>
              <Badge variant="secondary">{data.veteran}</Badge>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-md">
          <p className="text-sm text-muted-foreground">
            Equal Employment Opportunity (EEO) information is collected for statistical purposes only. 
            This information will be kept separate from your application and will not be used in the hiring decision.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Providing this information is voluntary and declining to provide it will not subject you to any adverse treatment.
          </p>
        </div>
      </Card>

      <EditEqualEmployment
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={data}
        onSave={onUpdate}
      />
    </div>
  );
};

// Custom Badge component since we're using specific variants
interface BadgeProps {
  children: React.ReactNode;
  variant: "success" | "warning" | "secondary";
}

const Badge: React.FC<BadgeProps> = ({ children, variant }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVariantClasses()}`}
    >
      {children}
    </span>
  );
};

export default EqualEmploymentSection;

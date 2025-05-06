
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, Upload } from "lucide-react";
import EditProfileHeader from "./EditProfileHeader";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfileHeaderProps {
  name: string;
  jobStatus: string;
  profileStrength: number;
  onProfileUpdate: (data: { name: string; jobStatus: string }) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  jobStatus,
  profileStrength,
  onProfileUpdate,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{name}</h1>
          <p className="text-muted-foreground">{jobStatus}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-1"
        >
          <Edit className="h-4 w-4" />
          {!isMobile && "Edit"}
        </Button>
      </div>

      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Profile Strength</h2>
            <span className="font-medium">{profileStrength}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-500 h-2.5 rounded-full" 
              style={{ width: `${profileStrength}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground">
            Complete your profile to increase your chances of finding the perfect job
          </p>
        </div>
      </Card>

      <EditProfileHeader
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={{ name, jobStatus }}
        onSave={onProfileUpdate}
      />
    </div>
  );
};

export default ProfileHeader;

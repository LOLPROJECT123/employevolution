
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, Github, Globe, Link, Linkedin } from "lucide-react";
import EditSocialLinks from "./EditSocialLinks";

export interface SocialLinks {
  linkedin: string;
  github: string;
  portfolio: string;
  other: string;
}

interface SocialLinksSectionProps {
  socialLinks: SocialLinks;
  onUpdateSocialLinks: (links: SocialLinks) => void;
}

const SocialLinksSection: React.FC<SocialLinksSectionProps> = ({
  socialLinks,
  onUpdateSocialLinks,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const formatLink = (link: string): string => {
    return link || "Not provided";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Social Links</h2>
        <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Linkedin className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium">LinkedIn URL</p>
            <p className="text-sm text-muted-foreground truncate">
              {formatLink(socialLinks.linkedin)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
            <Github className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium">GitHub URL</p>
            <p className="text-sm text-muted-foreground truncate">
              {formatLink(socialLinks.github)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-pink-100 dark:bg-pink-900/20">
            <Globe className="h-5 w-5 text-pink-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Portfolio URL</p>
            <p className="text-sm text-muted-foreground truncate">
              {formatLink(socialLinks.portfolio)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Link className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Other URL</p>
            <p className="text-sm text-muted-foreground truncate">
              {formatLink(socialLinks.other)}
            </p>
          </div>
        </div>
      </Card>

      <EditSocialLinks
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={socialLinks}
        onSave={onUpdateSocialLinks}
      />
    </div>
  );
};

export default SocialLinksSection;

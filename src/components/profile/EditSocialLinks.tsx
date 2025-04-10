
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
import { Linkedin, Github, Globe, Link } from "lucide-react";

interface SocialLinks {
  linkedin: string;
  github: string;
  portfolio: string;
  other: string;
}

interface EditSocialLinksProps {
  open: boolean;
  onClose: () => void;
  initialData: SocialLinks;
  onSave: (data: SocialLinks) => void;
}

const EditSocialLinks: React.FC<EditSocialLinksProps> = ({
  open,
  onClose,
  initialData,
  onSave,
}) => {
  const [linkedin, setLinkedin] = useState(initialData.linkedin);
  const [github, setGithub] = useState(initialData.github);
  const [portfolio, setPortfolio] = useState(initialData.portfolio);
  const [other, setOther] = useState(initialData.other);

  const handleSave = () => {
    onSave({
      linkedin,
      github,
      portfolio,
      other,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Social Links</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="linkedin" className="text-sm font-medium flex items-center">
              <Linkedin className="h-4 w-4 mr-2 text-blue-500" />
              LinkedIn URL
            </label>
            <Input
              id="linkedin"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://www.linkedin.com/in/username"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="github" className="text-sm font-medium flex items-center">
              <Github className="h-4 w-4 mr-2" />
              GitHub URL
            </label>
            <Input
              id="github"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="https://github.com/username"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="portfolio" className="text-sm font-medium flex items-center">
              <Globe className="h-4 w-4 mr-2 text-pink-500" />
              Portfolio URL
            </label>
            <Input
              id="portfolio"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              placeholder="https://yourportfolio.com"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="other" className="text-sm font-medium flex items-center">
              <Link className="h-4 w-4 mr-2 text-blue-500" />
              Other URL
            </label>
            <Input
              id="other"
              value={other}
              onChange={(e) => setOther(e.target.value)}
              placeholder="https://other-site.com"
            />
          </div>
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

export default EditSocialLinks;

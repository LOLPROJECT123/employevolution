
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, X } from "lucide-react";

type Item = {
  id: string;
  name: string;
};

interface SkillsLanguagesManagerProps {
  title: string;
  items: Item[];
  onAddItem: (item: string) => void;
  onRemoveItem: (id: string) => void;
  colorScheme?: "default" | "skill" | "language";
}

export default function SkillsLanguagesManager({
  title,
  items,
  onAddItem,
  onRemoveItem,
  colorScheme = "default"
}: SkillsLanguagesManagerProps) {
  const [newItem, setNewItem] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getBadgeClasses = () => {
    switch (colorScheme) {
      case "skill":
        return "bg-sky-500 hover:bg-sky-600";
      case "language":
        return "bg-emerald-500 hover:bg-emerald-600";
      default:
        return "";
    }
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      onAddItem(newItem.trim());
      setNewItem("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              <span>Edit</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit {title}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-2 mb-4">
                <Input
                  placeholder={`Add a new ${title.toLowerCase().slice(0, -1)}`}
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddItem();
                    }
                  }}
                />
                <Button onClick={handleAddItem} variant="default" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {items.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <Badge
                      key={item.id}
                      className={`px-3 py-1 flex items-center gap-1 ${getBadgeClasses()}`}
                      variant="secondary"
                    >
                      {item.name}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="ml-1 rounded-full hover:bg-black/10 p-1"
                        aria-label={`Remove ${item.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No {title.toLowerCase()} added yet. Add your first one.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge
              key={item.id}
              className={getBadgeClasses()}
              variant="secondary"
            >
              {item.name}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No {title.toLowerCase()} added yet. Click Edit to add.
        </p>
      )}
    </div>
  );
}

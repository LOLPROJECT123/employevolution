
import { SavedSearch } from "@/types/job";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Bell } from "lucide-react";
import { format } from "date-fns";

interface SavedSearchesProps {
  searches: SavedSearch[];
  onApplySearch: (search: SavedSearch) => void;
  onDeleteSearch: (searchId: string) => void;
}

export function SavedSearches({ searches, onApplySearch, onDeleteSearch }: SavedSearchesProps) {
  if (!searches || searches.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Saved Searches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {searches.map((search) => (
            <div 
              key={search.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{search.name}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {search.filters.jobType.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {search.filters.jobType.join(', ')}
                      </Badge>
                    )}
                    {search.filters.location && (
                      <Badge variant="outline" className="text-xs">
                        {search.filters.location}
                      </Badge>
                    )}
                    {search.filters.remote && (
                      <Badge variant="outline" className="text-xs">
                        Remote
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created {format(new Date(search.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApplySearch(search)}
                >
                  Apply
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteSearch(search.id)}
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

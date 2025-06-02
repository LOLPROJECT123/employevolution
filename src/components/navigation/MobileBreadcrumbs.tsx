
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigationState } from '@/components/navigation/NavigationStateManager';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBreadcrumbsProps {
  className?: string;
  maxItems?: number;
}

export const MobileBreadcrumbs: React.FC<MobileBreadcrumbsProps> = ({
  className,
  maxItems = 3
}) => {
  const { state } = useNavigationState();

  if (state.breadcrumbs.length <= 1) {
    return null;
  }

  const displayBreadcrumbs = state.breadcrumbs.slice(-maxItems);
  const hasHiddenItems = state.breadcrumbs.length > maxItems;

  return (
    <div className={cn("flex items-center space-x-1 overflow-x-auto py-2", className)}>
      {hasHiddenItems && (
        <>
          <Button variant="ghost" size="sm" className="flex items-center space-x-1 px-2">
            <Home className="h-3 w-3" />
          </Button>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">...</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        </>
      )}
      
      {displayBreadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.path}>
          {index > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-sm px-2 py-1 h-auto",
              index === displayBreadcrumbs.length - 1
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            )}
          >
            {breadcrumb.label}
          </Button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default MobileBreadcrumbs;

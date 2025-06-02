
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useContextAwareNavigation } from '@/hooks/useContextAwareNavigation';
import { ArrowRight, Lightbulb } from 'lucide-react';

export const ContextAwareNavigationSuggestions: React.FC = () => {
  const { suggestions, navigateToSuggestion } = useContextAwareNavigation();

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Lightbulb className="h-4 w-4" />
          <span>Suggested Next Steps</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.slice(0, 3).map((suggestion, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-sm">{suggestion.label}</span>
                <Badge 
                  variant={
                    suggestion.priority === 'high' ? 'default' : 
                    suggestion.priority === 'medium' ? 'secondary' : 'outline'
                  }
                  className="text-xs"
                >
                  {suggestion.priority}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigateToSuggestion(suggestion)}
            >
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ContextAwareNavigationSuggestions;

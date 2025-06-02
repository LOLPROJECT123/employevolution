
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, DollarSign, Building2, Heart, BookmarkPlus, Eye } from 'lucide-react';
import { useAdvancedGestureHandler } from '@/hooks/useAdvancedGestureHandler';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  postedDate: string;
  type: string;
}

interface GestureEnabledJobCardProps {
  job: Job;
  onSave?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  onView?: (jobId: string) => void;
  onLike?: (jobId: string) => void;
}

export const GestureEnabledJobCard: React.FC<GestureEnabledJobCardProps> = ({
  job,
  onSave,
  onApply,
  onView,
  onLike
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSwipeLeft = () => {
    console.log('Swiped left - dismiss job');
    // Implement dismiss logic
  };

  const handleSwipeRight = () => {
    console.log('Swiped right - save job');
    if (onSave) {
      onSave(job.id);
      setIsSaved(true);
    }
  };

  const handleLongPress = () => {
    console.log('Long press - show quick actions');
    if (onView) {
      onView(job.id);
    }
  };

  const { elementRef, isPressed } = useAdvancedGestureHandler({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onLongPress: handleLongPress,
    swipeThreshold: 100,
    longPressDelay: 500
  });

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onLike) {
      onLike(job.id);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    if (onSave) {
      onSave(job.id);
    }
  };

  return (
    <Card 
      ref={elementRef}
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isPressed ? 'scale-95 shadow-xl' : ''
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground mb-1">
              {job.title}
            </CardTitle>
            <div className="flex items-center text-muted-foreground text-sm mb-2">
              <Building2 className="h-4 w-4 mr-1" />
              <span>{job.company}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`h-8 w-8 p-0 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{job.location}</span>
            </div>
            {job.salary && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>{job.salary}</span>
              </div>
            )}
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{job.postedDate}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{job.type}</Badge>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.description}
          </p>
          
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              className="flex-1"
            >
              <BookmarkPlus className={`h-4 w-4 mr-1 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView?.(job.id)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              onClick={() => onApply?.(job.id)}
              className="flex-1"
            >
              Apply
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GestureEnabledJobCard;

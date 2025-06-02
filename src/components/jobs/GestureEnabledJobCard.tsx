
import React, { ReactNode } from 'react';

export interface GestureEnabledJobCardProps {
  job: any;
  onSwipeAction: (action: 'archive' | 'follow_up' | 'update') => void;
  children: ReactNode;
}

export const GestureEnabledJobCard: React.FC<GestureEnabledJobCardProps> = ({ 
  job, 
  onSwipeAction, 
  children 
}) => {
  // For now, just render the children without gesture functionality
  // In a real implementation, this would include touch event handlers
  return (
    <div className="gesture-enabled-card">
      {children}
    </div>
  );
};

export default GestureEnabledJobCard;

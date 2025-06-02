
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

const MobileHeader = ({ title, showBack = false, onBack }: MobileHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-background border-b px-4 py-3 flex items-center justify-between md:hidden">
      <div className="flex items-center space-x-3">
        {showBack && (
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        {user && (
          <Button variant="ghost" size="sm">
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MobileHeader;


import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    if (!loading && user) {
      navigate(redirectPath);
    }
  }, [user, loading, navigate, redirectPath]);

  const handleClose = () => {
    setIsOpen(false);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <AuthModal 
        isOpen={isOpen} 
        onClose={handleClose} 
        defaultMode="email-check"
      />
    </div>
  );
};

export default Auth;

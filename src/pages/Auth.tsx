
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  
  const mode = searchParams.get('mode') as 'login' | 'signup' || 'login';
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    if (user) {
      navigate(redirectPath);
    }
  }, [user, navigate, redirectPath]);

  const handleClose = () => {
    setIsOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <AuthModal 
        isOpen={isOpen} 
        onClose={handleClose} 
        defaultMode={mode}
      />
    </div>
  );
};

export default Auth;

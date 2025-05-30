
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmailVerification } from './EmailVerification';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'email-check' | 'login' | 'signup';
}

export const AuthModal = ({ isOpen, onClose, defaultMode = 'email-check' }: AuthModalProps) => {
  const [mode, setMode] = useState<'email-check' | 'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');

  const handleEmailVerified = (verifiedEmail: string, exists: boolean) => {
    console.log('Email verified:', verifiedEmail, 'exists:', exists);
    setEmail(verifiedEmail);
    
    // Automatically route to the appropriate form based on whether account exists
    if (exists) {
      setMode('login');
    } else {
      setMode('signup');
    }
  };

  const resetToEmailCheck = () => {
    setMode('email-check');
    setEmail('');
  };

  const handleSuccess = () => {
    onClose();
  };

  const getTitle = () => {
    switch (mode) {
      case 'email-check':
        return 'Welcome to Streamline';
      case 'login':
        return 'Welcome back';
      case 'signup':
        return 'Create your account';
      default:
        return 'Authentication';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'email-check':
        return 'Enter your email to get started';
      case 'login':
        return 'Enter your password to sign in';
      case 'signup':
        return 'Create your account to start your job search';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        
        {mode === 'email-check' && (
          <EmailVerification onEmailVerified={handleEmailVerified} />
        )}
        
        {mode === 'login' && (
          <SignInForm 
            email={email} 
            onBack={resetToEmailCheck}
            onSuccess={handleSuccess}
          />
        )}
        
        {mode === 'signup' && (
          <SignUpForm 
            email={email} 
            onBack={resetToEmailCheck}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

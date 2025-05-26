
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { EmailVerification } from './EmailVerification';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'email-check' | 'login' | 'signup';
}

export const AuthModal = ({ isOpen, onClose, defaultMode = 'email-check' }: AuthModalProps) => {
  const [mode, setMode] = useState<'email-check' | 'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleEmailVerified = (verifiedEmail: string, exists: boolean) => {
    setEmail(verifiedEmail);
    setMode(exists ? 'login' : 'signup');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      } else if (mode === 'signup') {
        await register(email, password, name);
        toast({
          title: "Account created!",
          description: "Welcome to Streamline. Please check your email to verify your account.",
        });
      }
      onClose();
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetToEmailCheck = () => {
    setMode('email-check');
    setEmail('');
    setPassword('');
    setName('');
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
          <div className="flex items-center gap-2">
            {mode !== 'email-check' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={resetToEmailCheck}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <DialogTitle>{getTitle()}</DialogTitle>
              <DialogDescription>{getDescription()}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        {mode === 'email-check' ? (
          <EmailVerification onEmailVerified={handleEmailVerified} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
                className="bg-gray-50"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                minLength={6}
                disabled={loading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

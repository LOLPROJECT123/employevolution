
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface EmailVerificationProps {
  onEmailVerified: (email: string, exists: boolean) => void;
}

export const EmailVerification = ({ onEmailVerified }: EmailVerificationProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { checkEmailExists } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // For new users, we'll default to allowing signup
      // The checkEmailExists function might not work reliably in all cases
      const emailExists = await checkEmailExists(email);
      
      console.log('Email check result:', { email, emailExists });
      
      onEmailVerified(email, emailExists);
      
      if (emailExists) {
        toast({
          title: "Welcome back!",
          description: "Please sign in with your password",
        });
      } else {
        toast({
          title: "Let's get you started",
          description: "Please create your account",
        });
      }
    } catch (error) {
      console.error('Email verification error:', error);
      // If email check fails, default to signup flow
      onEmailVerified(email, false);
      toast({
        title: "Let's get you started",
        description: "Please create your account",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={loading}
          autoFocus
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Continue
      </Button>

      <div className="text-xs text-muted-foreground text-center">
        We'll check if you have an account and guide you to sign in or sign up
      </div>
    </form>
  );
};

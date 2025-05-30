
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from '@/hooks/use-toast';
import { Loader2, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EmailVerificationProps {
  onEmailVerified: (email: string, exists: boolean) => void;
}

export const EmailVerification = ({ onEmailVerified }: EmailVerificationProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      console.log('Checking if email exists:', email);
      
      // Use the resetPasswordForEmail function to check if email exists
      // This will return different error messages based on whether the email exists
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.log('Reset password error:', error.message);
        
        // If the error indicates the user doesn't exist, return false
        if (error.message.includes('User not found') || 
            error.message.includes('Unable to validate email address') ||
            error.message.includes('Email not confirmed')) {
          return false;
        }
        
        // For other errors, we assume the user exists but there's another issue
        // In most cases, no error means the email exists and reset was sent
        return true;
      }
      
      // No error means the reset email was sent successfully, so user exists
      console.log('Reset email sent successfully, user exists');
      return true;
    } catch (error) {
      console.error('Email check error:', error);
      // If there's an unexpected error, default to signup flow to be safe
      return false;
    }
  };

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
      console.log('Checking email existence for:', email);
      const emailExists = await checkEmailExists(email);
      
      console.log('Email exists result:', emailExists);
      
      if (emailExists) {
        toast({
          title: "Welcome back!",
          description: "Please enter your password to sign in",
        });
        onEmailVerified(email, true);
      } else {
        toast({
          title: "Create your account",
          description: "Let's create your new account!",
        });
        onEmailVerified(email, false);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      // If email check fails, default to signup flow to be safe
      toast({
        title: "Let's get started",
        description: "We'll help you create your account",
      });
      onEmailVerified(email, false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
        <h2 className="text-2xl font-bold">Welcome to Streamline</h2>
        <p className="text-muted-foreground">Enter your email to get started</p>
        <p className="text-xs text-muted-foreground mt-2">
          We'll automatically detect if you have an account and guide you to sign in or create a new account.
        </p>
      </div>
      
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
          className="mt-1"
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Continue
      </Button>

      <div className="text-xs text-muted-foreground text-center">
        We'll automatically check if you have an account and guide you to the right place
      </div>
    </form>
  );
};

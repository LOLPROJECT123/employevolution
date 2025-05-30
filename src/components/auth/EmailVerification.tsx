
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
      
      // Try to sign in with the email and a dummy password
      // This is the most reliable way to check if an account exists
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy-password-for-checking-existence-12345'
      });

      if (error) {
        console.log('Sign in attempt error:', error.message);
        
        // Check the specific error message to determine if user exists
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed')) {
          // These errors indicate the user exists but either:
          // 1. Wrong password (which is expected since we used a dummy)
          // 2. Email not confirmed (user exists but hasn't verified)
          console.log('User exists (wrong password or unconfirmed email)');
          return true;
        } else if (error.message.includes('User not found') ||
                   error.message.includes('Unable to validate email address')) {
          // These errors indicate the user doesn't exist
          console.log('User does not exist');
          return false;
        } else {
          // For any other error, default to signup flow to be safe
          console.log('Unknown error, defaulting to signup flow');
          return false;
        }
      }
      
      // If no error, it means the dummy password actually worked (very unlikely)
      // In this case, the user definitely exists
      console.log('No error with dummy password - user exists');
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

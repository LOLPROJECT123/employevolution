
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
      // Try to sign in with a dummy password to check if email exists
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy-password-check-12345'
      });

      if (error) {
        // If the error mentions invalid credentials or email not confirmed, email exists
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed')) {
          return true;
        }
        // For other errors, assume email doesn't exist
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Email check error:', error);
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
      
      onEmailVerified(email, emailExists);
      
      if (emailExists) {
        toast({
          title: "Welcome back!",
          description: "Please enter your password to sign in",
        });
      } else {
        toast({
          title: "Create your account",
          description: "This email is not registered yet. Let's create your account!",
        });
      }
    } catch (error) {
      console.error('Email verification error:', error);
      // If email check fails, default to signup flow
      onEmailVerified(email, false);
      toast({
        title: "Let's get started",
        description: "We'll help you create your account",
      });
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
          Note: For testing, email confirmation is disabled. You can sign in immediately after creating an account.
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
        We'll check if you have an account and guide you to sign in or sign up
      </div>
    </form>
  );
};

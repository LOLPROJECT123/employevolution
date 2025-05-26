
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, ArrowLeft, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SignInFormProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const SignInForm = ({ email, onBack, onSuccess }: SignInFormProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      toast({
        title: "Password required",
        description: "Please enter your password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        
        if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email not confirmed",
            description: "Please check your email and click the confirmation link, or resend the confirmation email.",
            variant: "destructive",
          });
        } else if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid credentials",
            description: "Please check your email and password and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign in failed",
            description: error.message || "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      if (data.user) {
        console.log('Sign in successful for user:', data.user.id);
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        onSuccess();
      }
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setResendingConfirmation(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        toast({
          title: "Failed to resend",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Confirmation email sent",
          description: "Please check your email for the confirmation link.",
        });
      }
    } catch (error) {
      console.error('Resend confirmation error:', error);
      toast({
        title: "Failed to resend",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setResendingConfirmation(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2 mb-6">
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="p-1"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Welcome back</h2>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>
      </div>

      <div>
        <Label htmlFor="email-display">Email</Label>
        <div className="flex items-center mt-1 p-2 border rounded-md bg-muted">
          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">{email}</span>
        </div>
      </div>
      
      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative mt-1">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={loading}
            autoFocus
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign In
      </Button>

      <div className="text-center space-y-2">
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={handleResendConfirmation}
          disabled={resendingConfirmation}
          className="text-sm"
        >
          {resendingConfirmation && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
          Resend confirmation email
        </Button>
        
        <div className="text-xs text-muted-foreground">
          Having trouble? Check your email for a confirmation link or contact support.
        </div>
      </div>
    </form>
  );
};


import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SignUpFormProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const SignUpForm = ({ email, onBack, onSuccess }: SignUpFormProps) => {
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast({
        title: "Full name required",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({
        title: "Password requirements not met",
        description: passwordError,
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting sign up for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        
        if (error.message.includes('User already registered')) {
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign up failed",
            description: error.message || "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      if (data.user) {
        console.log('Sign up successful for user:', data.user.id);
        
        if (data.user.email_confirmed_at) {
          // Email is already confirmed, user can proceed
          toast({
            title: "Account created successfully!",
            description: "Welcome to Streamline! You can now start using the platform.",
          });
          onSuccess();
        } else {
          // Email confirmation required
          toast({
            title: "Account created!",
            description: "Please check your email and click the confirmation link to complete your registration.",
          });
          // Still call onSuccess to show the confirmation message
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          <h2 className="text-xl font-semibold">Create your account</h2>
          <p className="text-sm text-muted-foreground">Join Streamline to get started</p>
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
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
          required
          disabled={loading}
          autoFocus
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative mt-1">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
            disabled={loading}
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

      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative mt-1">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            disabled={loading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
        <p className="font-medium mb-1">Password requirements:</p>
        <ul className="space-y-1">
          <li className="flex items-center space-x-2">
            <CheckCircle className={`h-3 w-3 ${password.length >= 8 ? 'text-green-500' : 'text-gray-400'}`} />
            <span>At least 8 characters</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className={`h-3 w-3 ${/(?=.*[a-z])/.test(password) ? 'text-green-500' : 'text-gray-400'}`} />
            <span>One lowercase letter</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className={`h-3 w-3 ${/(?=.*[A-Z])/.test(password) ? 'text-green-500' : 'text-gray-400'}`} />
            <span>One uppercase letter</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className={`h-3 w-3 ${/(?=.*\d)/.test(password) ? 'text-green-500' : 'text-gray-400'}`} />
            <span>One number</span>
          </li>
        </ul>
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>

      <div className="text-xs text-muted-foreground text-center">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </div>
    </form>
  );
};

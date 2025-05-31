
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const noSpaces = !/\s/.test(password);

    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && noSpaces,
      requirements: {
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar,
        noSpaces
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast({
        title: "Invalid password",
        description: "Please ensure your password meets all requirements",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting to sign up user with email:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
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
            description: "This email is already registered. Please sign in instead.",
            variant: "destructive",
          });
        } else if (error.message.includes('Invalid email')) {
          toast({
            title: "Invalid email",
            description: "Please enter a valid email address",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      if (data.user) {
        console.log('Sign up successful for user:', data.user.id);
        
        if (data.user.email_confirmed_at) {
          // User is immediately confirmed (no email verification required)
          toast({
            title: "Account created successfully!",
            description: "Welcome to Streamline! Let's get your profile set up.",
          });
          onSuccess();
        } else {
          // Email verification required
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account before signing in.",
          });
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(password);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-4 p-0 h-auto"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div>
        <Label htmlFor="fullName">Full Name *</Label>
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
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          disabled
          className="mt-1 bg-muted"
        />
      </div>

      <div>
        <Label htmlFor="password">Password *</Label>
        <div className="relative mt-1">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            required
            disabled={loading}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {password && (
          <div className="mt-2 text-sm space-y-1">
            <p className="font-medium text-muted-foreground">Password requirements:</p>
            <ul className="space-y-1">
              <li className={`flex items-center ${passwordValidation.requirements.minLength ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{passwordValidation.requirements.minLength ? '✓' : '✗'}</span>
                At least 8 characters
              </li>
              <li className={`flex items-center ${passwordValidation.requirements.hasUpperCase ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{passwordValidation.requirements.hasUpperCase ? '✓' : '✗'}</span>
                One uppercase letter (A-Z)
              </li>
              <li className={`flex items-center ${passwordValidation.requirements.hasLowerCase ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{passwordValidation.requirements.hasLowerCase ? '✓' : '✗'}</span>
                One lowercase letter (a-z)
              </li>
              <li className={`flex items-center ${passwordValidation.requirements.hasNumbers ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{passwordValidation.requirements.hasNumbers ? '✓' : '✗'}</span>
                One number (0-9)
              </li>
              <li className={`flex items-center ${passwordValidation.requirements.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{passwordValidation.requirements.hasSpecialChar ? '✓' : '✗'}</span>
                One special character (!@#$%^&*)
              </li>
              <li className={`flex items-center ${passwordValidation.requirements.noSpaces ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{passwordValidation.requirements.noSpaces ? '✓' : '✗'}</span>
                No spaces
              </li>
            </ul>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm Password *</Label>
        <div className="relative mt-1">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            disabled={loading}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {confirmPassword && password !== confirmPassword && (
          <p className="text-red-600 text-sm mt-1">Passwords do not match</p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading || !passwordValidation.isValid || password !== confirmPassword || !fullName.trim()}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>

      <div className="text-xs text-muted-foreground text-center">
        By creating an account, you agree to our Terms of Service and Privacy Policy
      </div>
    </form>
  );
};

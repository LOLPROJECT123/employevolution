
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SignInFormProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const SignInForm = ({ email, onBack, onSuccess }: SignInFormProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // Load saved preference on component mount
  useEffect(() => {
    const savedPreference = localStorage.getItem('rememberMe');
    if (savedPreference !== null) {
      setRememberMe(savedPreference === 'true');
    }
  }, []);

  // Save preference and configure storage
  const updateRememberMe = (checked: boolean) => {
    setRememberMe(checked);
    localStorage.setItem('rememberMe', checked.toString());
    
    // Reconfigure Supabase storage
    const storage = checked ? localStorage : sessionStorage;
    supabase.auth.updateSession = supabase.auth.updateSession.bind({
      ...supabase.auth,
      storage
    });
  };

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid credentials",
            description: "The email or password you entered is incorrect",
            variant: "destructive",
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email not confirmed",
            description: "Please check your email and click the confirmation link",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in",
        });
        onSuccess();
      }
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
        <Label htmlFor="password">Password</Label>
        <div className="relative mt-1">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={loading}
            autoFocus
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
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rememberMe"
          checked={rememberMe}
          onCheckedChange={updateRememberMe}
          disabled={loading}
        />
        <Label 
          htmlFor="rememberMe" 
          className="text-sm font-normal cursor-pointer"
        >
          Stay signed in
        </Label>
      </div>
      <p className="text-xs text-muted-foreground">
        Keep me signed in on this device. Uncheck if using a shared computer.
      </p>

      <Button type="submit" className="w-full" disabled={loading || !password}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign In
      </Button>

      <div className="text-center">
        <Button variant="link" size="sm" className="text-muted-foreground">
          Forgot your password?
        </Button>
      </div>
    </form>
  );
};


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

    setLoading(true);

    try {
      const emailExists = await checkEmailExists(email);
      onEmailVerified(email, emailExists);
      
      if (emailExists) {
        toast({
          title: "Email found",
          description: "Please sign in with your password",
        });
      } else {
        toast({
          title: "New user",
          description: "Please create your account",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify email. Please try again.",
        variant: "destructive",
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
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Continue
      </Button>
    </form>
  );
};

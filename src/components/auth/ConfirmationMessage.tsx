
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from '@/hooks/use-toast';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ConfirmationMessageProps {
  email: string;
  onBack: () => void;
}

export const ConfirmationMessage = ({ email, onBack }: ConfirmationMessageProps) => {
  const [resending, setResending] = useState(false);

  const handleResendConfirmation = async () => {
    setResending(true);
    
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
      setResending(false);
    }
  };

  return (
    <div className="text-center space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Check your email</h2>
          <p className="text-muted-foreground mt-2">
            We've sent a confirmation link to
          </p>
          <p className="font-medium">{email}</p>
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <Mail className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Click the link in your email to verify your account and complete the registration process.
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleResendConfirmation}
          disabled={resending}
          variant="outline"
          className="w-full"
        >
          {resending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Resend confirmation email
        </Button>
        
        <Button
          onClick={onBack}
          variant="ghost"
          className="w-full"
        >
          Back to sign in
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        <p>Didn't receive the email? Check your spam folder or contact support.</p>
      </div>
    </div>
  );
};

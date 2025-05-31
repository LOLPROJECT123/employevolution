
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const useDatabase = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Check if user profile exists and create if needed
  const ensureUserProfile = async () => {
    if (!user) return null;
    
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (!profile) {
        // Create new profile
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            name: user.email?.split('@')[0] || '',
            job_status: 'Actively looking'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          return null;
        }
        return newProfile;
      }

      return profile;
    } catch (error) {
      console.error('Profile creation error:', error);
      return null;
    }
  };

  // Specific database operations for common tables
  const saveUserProfile = async (data: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save data.",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ ...data, user_id: user.id });

      if (error) throw error;
      
      toast({
        title: "Profile saved",
        description: "Your profile has been saved successfully.",
      });
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Save failed",
        description: "There was an error saving your profile.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveJobApplication = async (data: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save data.",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('job_applications')
        .upsert({ ...data, user_id: user.id });

      if (error) throw error;
      
      toast({
        title: "Application saved",
        description: "Your job application has been saved successfully.",
      });
      return true;
    } catch (error) {
      console.error('Error saving application:', error);
      toast({
        title: "Save failed",
        description: "There was an error saving your application.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const fetchJobApplications = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  };

  return {
    loading,
    ensureUserProfile,
    saveUserProfile,
    saveJobApplication,
    fetchUserProfile,
    fetchJobApplications
  };
};

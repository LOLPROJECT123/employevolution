
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

  // Generic database operations
  const saveData = async (table: string, data: any) => {
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
        .from(table)
        .upsert({ ...data, user_id: user.id });

      if (error) throw error;
      
      toast({
        title: "Data saved",
        description: "Your information has been saved successfully.",
      });
      return true;
    } catch (error) {
      console.error(`Error saving to ${table}:`, error);
      toast({
        title: "Save failed",
        description: "There was an error saving your data.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (table: string, filters?: Record<string, any>) => {
    if (!user) return [];

    try {
      let query = supabase.from(table).select('*').eq('user_id', user.id);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching from ${table}:`, error);
      return [];
    }
  };

  const deleteData = async (table: string, id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast({
        title: "Deleted",
        description: "Item has been deleted successfully.",
      });
      return true;
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the item.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    loading,
    saveData,
    fetchData,
    deleteData,
    ensureUserProfile
  };
};

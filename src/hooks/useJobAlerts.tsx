
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface JobAlert {
  id: string;
  name: string;
  criteria: {
    keywords?: string;
    location?: string;
    jobType?: string;
    salary?: { min?: number; max?: number };
    experience?: string;
    company?: string;
  };
  frequency: 'daily' | 'weekly' | 'instant';
  is_active: boolean;
  last_triggered?: string;
  created_at: string;
}

export const useJobAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('job_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching job alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (alertData: Omit<JobAlert, 'id' | 'created_at' | 'last_triggered'>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('job_alerts')
        .insert({
          user_id: user.id,
          name: alertData.name,
          criteria: alertData.criteria,
          frequency: alertData.frequency,
          is_active: alertData.is_active
        })
        .select()
        .single();

      if (error) throw error;

      setAlerts(prev => [data, ...prev]);
      toast({
        title: "Job Alert Created",
        description: `"${alertData.name}" alert has been set up successfully.`,
      });
      return true;
    } catch (error) {
      console.error('Error creating job alert:', error);
      toast({
        title: "Failed to create alert",
        description: "There was an error setting up your job alert.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateAlert = async (id: string, updates: Partial<JobAlert>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('job_alerts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setAlerts(prev => prev.map(alert => 
        alert.id === id ? { ...alert, ...data } : alert
      ));
      
      toast({
        title: "Alert Updated",
        description: "Your job alert has been updated successfully.",
      });
      return true;
    } catch (error) {
      console.error('Error updating job alert:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating your job alert.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteAlert = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('job_alerts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setAlerts(prev => prev.filter(alert => alert.id !== id));
      toast({
        title: "Alert Deleted",
        description: "Your job alert has been removed.",
      });
      return true;
    } catch (error) {
      console.error('Error deleting job alert:', error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting your job alert.",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleAlert = async (id: string, isActive: boolean) => {
    return updateAlert(id, { is_active: isActive });
  };

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user]);

  return {
    alerts,
    loading,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlert,
    refetch: fetchAlerts
  };
};

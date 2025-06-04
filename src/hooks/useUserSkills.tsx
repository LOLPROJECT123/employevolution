
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export const useUserSkills = () => {
  const { user } = useSupabaseAuth();
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserSkills = async () => {
      if (!user) {
        setSkills([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_skills')
          .select('skill')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user skills:', error);
          setError(error.message);
        } else {
          const userSkills = data?.map(item => item.skill) || [];
          setSkills(userSkills);
        }
      } catch (err) {
        console.error('Error fetching user skills:', err);
        setError('Failed to fetch skills');
      } finally {
        setLoading(false);
      }
    };

    fetchUserSkills();
  }, [user]);

  return { skills, loading, error };
};

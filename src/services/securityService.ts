
import { supabase } from '@/integrations/supabase/client';

class SecurityService {
  async checkRateLimit(identifier: string, endpoint: string, limit: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('rate_limits')
        .select('requests_count')
        .eq('identifier', identifier)
        .eq('endpoint', endpoint)
        .gte('window_start', new Date(Date.now() - 3600000).toISOString())
        .maybeSingle();

      if (error) {
        console.error('Rate limit check error:', error);
        return true; // Allow on error
      }

      if (!data) {
        // Create new rate limit entry
        await supabase
          .from('rate_limits')
          .insert({
            identifier,
            endpoint,
            requests_count: 1,
            window_start: new Date().toISOString()
          });
        return true;
      }

      if (data.requests_count >= limit) {
        return false;
      }

      // Increment counter
      await supabase
        .from('rate_limits')
        .update({ requests_count: data.requests_count + 1 })
        .eq('identifier', identifier)
        .eq('endpoint', endpoint);

      return true;
    } catch (error) {
      console.error('Rate limit error:', error);
      return true; // Allow on error
    }
  }
}

export const securityService = new SecurityService();

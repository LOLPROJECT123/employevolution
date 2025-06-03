
import { supabase } from '@/integrations/supabase/client';

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  scope?: string;
}

export interface OAuthIntegration {
  id: string;
  provider: string;
  isActive: boolean;
  lastSync: string;
  profileData: any;
  tokenExpiresAt?: string;
}

export class AdvancedOAuthService {
  private static readonly TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry

  static async refreshTokenIfNeeded(integrationId: string): Promise<boolean> {
    try {
      const { data: integration } = await supabase
        .from('oauth_integrations')
        .select('*')
        .eq('id', integrationId)
        .single();

      if (!integration) return false;

      const expiresAt = new Date(integration.token_expires_at || 0);
      const now = new Date();
      const shouldRefresh = expiresAt.getTime() - now.getTime() < this.TOKEN_REFRESH_BUFFER;

      if (shouldRefresh && integration.refresh_token_encrypted) {
        return this.refreshAccessToken(integrationId, integration.provider);
      }

      return true;
    } catch (error) {
      console.error('Error checking token refresh:', error);
      return false;
    }
  }

  private static async refreshAccessToken(integrationId: string, provider: string): Promise<boolean> {
    try {
      // Call edge function to handle token refresh
      const { data, error } = await supabase.functions.invoke('oauth-token-refresh', {
        body: { integrationId, provider }
      });

      if (error) throw error;

      await supabase
        .from('oauth_integrations')
        .update({
          access_token_encrypted: data.encryptedAccessToken,
          token_expires_at: data.expiresAt,
          updated_at: new Date().toISOString()
        })
        .eq('id', integrationId);

      return true;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return false;
    }
  }

  static async initiateOAuthFlow(provider: string, scopes: string[] = []): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('oauth-initiate', {
        body: { provider, scopes }
      });

      if (error) throw error;
      return data.authUrl;
    } catch (error) {
      console.error('Error initiating OAuth flow:', error);
      throw error;
    }
  }

  static async handleOAuthCallback(code: string, state: string, provider: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('oauth-callback', {
        body: { code, state, provider }
      });

      if (error) throw error;

      // Store the integration
      await this.storeOAuthIntegration(provider, data.tokens, data.profile);
      return true;
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      return false;
    }
  }

  private static async storeOAuthIntegration(
    provider: string, 
    tokens: OAuthTokens, 
    profile: any
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    await supabase.from('oauth_integrations').upsert({
      user_id: user.id,
      provider,
      provider_user_id: profile.id,
      access_token_encrypted: tokens.accessToken, // Should be encrypted in edge function
      refresh_token_encrypted: tokens.refreshToken,
      token_expires_at: tokens.expiresAt,
      scope: tokens.scope,
      profile_data: profile,
      is_active: true,
      connected_at: new Date().toISOString()
    });
  }

  static async syncProviderData(provider: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: integration } = await supabase
        .from('oauth_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', provider)
        .eq('is_active', true)
        .single();

      if (!integration) return false;

      // Refresh token if needed
      await this.refreshTokenIfNeeded(integration.id);

      // Sync data based on provider
      switch (provider) {
        case 'linkedin':
          return this.syncLinkedInData(integration.id);
        case 'github':
          return this.syncGitHubData(integration.id);
        default:
          return false;
      }
    } catch (error) {
      console.error('Error syncing provider data:', error);
      return false;
    }
  }

  private static async syncLinkedInData(integrationId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-sync', {
        body: { integrationId }
      });

      if (error) throw error;

      // Update last sync time
      await supabase
        .from('oauth_integrations')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', integrationId);

      return true;
    } catch (error) {
      console.error('Error syncing LinkedIn data:', error);
      return false;
    }
  }

  private static async syncGitHubData(integrationId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('github-sync', {
        body: { integrationId }
      });

      if (error) throw error;

      await supabase
        .from('oauth_integrations')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', integrationId);

      return true;
    } catch (error) {
      console.error('Error syncing GitHub data:', error);
      return false;
    }
  }

  static async getUserIntegrations(userId: string): Promise<OAuthIntegration[]> {
    try {
      const { data, error } = await supabase
        .from('oauth_integrations')
        .select('id, provider, is_active, last_sync_at, profile_data, token_expires_at')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;

      return (data || []).map(integration => ({
        id: integration.id,
        provider: integration.provider,
        isActive: integration.is_active,
        lastSync: integration.last_sync_at || '',
        profileData: integration.profile_data || {},
        tokenExpiresAt: integration.token_expires_at
      }));
    } catch (error) {
      console.error('Error getting user integrations:', error);
      return [];
    }
  }

  static async disconnectProvider(integrationId: string): Promise<boolean> {
    try {
      await supabase
        .from('oauth_integrations')
        .update({ is_active: false })
        .eq('id', integrationId);

      return true;
    } catch (error) {
      console.error('Error disconnecting provider:', error);
      return false;
    }
  }

  static async getProviderData(provider: string, userId: string): Promise<any> {
    try {
      const { data } = await supabase
        .from('oauth_integrations')
        .select('profile_data')
        .eq('user_id', userId)
        .eq('provider', provider)
        .eq('is_active', true)
        .single();

      return data?.profile_data || null;
    } catch (error) {
      console.error('Error getting provider data:', error);
      return null;
    }
  }
}

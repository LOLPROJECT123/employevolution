
import { supabase } from '@/integrations/supabase/client';

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  profilePicture?: string;
  industry: string;
  location: string;
}

export interface LinkedInContact {
  id: string;
  name: string;
  headline: string;
  company: string;
  position: string;
  contactInfo: {
    email?: string;
    phone?: string;
    linkedinUrl: string;
  };
}

export class LinkedInOAuthService {
  private static readonly CLIENT_ID = 'your_linkedin_client_id';
  private static readonly REDIRECT_URI = `${window.location.origin}/auth/linkedin/callback`;
  private static readonly SCOPES = 'r_liteprofile r_emailaddress w_member_social';

  static initiateOAuth(): void {
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${this.CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(this.SCOPES)}`;

    window.location.href = authUrl;
  }

  static async handleCallback(code: string): Promise<LinkedInProfile | null> {
    try {
      // This should be handled by an edge function for security
      const response = await fetch('/api/linkedin/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      
      if (data.access_token) {
        const profile = await this.fetchProfile(data.access_token);
        await this.saveProfile(profile);
        return profile;
      }
      
      return null;
    } catch (error) {
      console.error('LinkedIn OAuth error:', error);
      return null;
    }
  }

  private static async fetchProfile(accessToken: string): Promise<LinkedInProfile> {
    const response = await fetch('https://api.linkedin.com/v2/people/~', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    
    return {
      id: data.id,
      firstName: data.firstName?.localized?.en_US || '',
      lastName: data.lastName?.localized?.en_US || '',
      headline: data.headline?.localized?.en_US || '',
      profilePicture: data.profilePicture?.displayImage || '',
      industry: data.industry || '',
      location: data.location?.name || ''
    };
  }

  static async findContacts(query: string): Promise<LinkedInContact[]> {
    // This would use LinkedIn's People Search API
    // For demo purposes, returning mock data
    return [
      {
        id: '1',
        name: 'John Doe',
        headline: 'Software Engineer at Tech Corp',
        company: 'Tech Corp',
        position: 'Software Engineer',
        contactInfo: {
          linkedinUrl: 'https://linkedin.com/in/johndoe',
          email: 'john@techcorp.com'
        }
      }
    ];
  }

  static async saveContact(userId: string, contact: LinkedInContact): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .insert({
        user_id: userId,
        first_name: contact.name.split(' ')[0],
        last_name: contact.name.split(' ').slice(1).join(' '),
        email: contact.contactInfo.email || '',
        company_name: contact.company,
        job_title: contact.position,
        linkedin_url: contact.contactInfo.linkedinUrl,
        contact_type: 'linkedin',
        source: 'linkedin_oauth'
      });

    if (error) {
      throw new Error(`Failed to save contact: ${error.message}`);
    }
  }

  private static async saveProfile(profile: LinkedInProfile): Promise<void> {
    // Save to user profile or create LinkedIn-specific table
    console.log('Saving LinkedIn profile:', profile);
  }
}

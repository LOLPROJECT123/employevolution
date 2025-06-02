
import { supabase } from '@/integrations/supabase/client';

export interface AnonymizationResult {
  success: boolean;
  anonymizedFields: string[];
  retainedFields: string[];
  error?: string;
}

export interface DataExportResult {
  success: boolean;
  data?: any;
  format: 'json' | 'csv' | 'xml';
  fileName: string;
  error?: string;
}

export class DataAnonymizationService {
  private static readonly ANONYMIZATION_PATTERNS = {
    email: (email: string) => {
      const [username, domain] = email.split('@');
      return `${username.slice(0, 2)}***@${domain}`;
    },
    phone: (phone: string) => {
      return phone.replace(/\d(?=\d{4})/g, '*');
    },
    name: (name: string) => {
      const parts = name.split(' ');
      return parts.map((part, index) => 
        index === 0 ? part.charAt(0) + '*'.repeat(part.length - 1) : part.charAt(0) + '***'
      ).join(' ');
    },
    address: (address: string) => {
      return address.replace(/\d+/g, '***').replace(/[A-Za-z]{3,}/g, '***');
    }
  };

  // Anonymize user data while preserving analytics value
  static async anonymizeUserData(userId: string, fields: string[] = []): Promise<AnonymizationResult> {
    try {
      console.log('Starting data anonymization for user:', userId);

      const anonymizedFields: string[] = [];
      const retainedFields: string[] = [];

      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profile) {
        const anonymizedProfile: any = { ...profile };

        // Anonymize specified fields or default sensitive fields
        const fieldsToAnonymize = fields.length > 0 ? fields : [
          'full_name', 'email'
        ];

        fieldsToAnonymize.forEach(field => {
          if (profile[field]) {
            switch (field) {
              case 'email':
                anonymizedProfile[field] = this.ANONYMIZATION_PATTERNS.email(profile[field]);
                break;
              case 'full_name':
                anonymizedProfile[field] = this.ANONYMIZATION_PATTERNS.name(profile[field]);
                break;
              default:
                anonymizedProfile[field] = '***ANONYMIZED***';
            }
            anonymizedFields.push(field);
          }
        });

        // Update profile with anonymized data
        const { error: updateError } = await supabase
          .from('profiles')
          .update(anonymizedProfile)
          .eq('id', userId);

        if (updateError) {
          throw updateError;
        }

        // Also anonymize user_profiles table
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (userProfile) {
          const anonymizedUserProfile = { ...userProfile };
          if (userProfile.name) {
            anonymizedUserProfile.name = this.ANONYMIZATION_PATTERNS.name(userProfile.name);
            anonymizedFields.push('user_profiles.name');
          }
          if (userProfile.phone) {
            anonymizedUserProfile.phone = this.ANONYMIZATION_PATTERNS.phone(userProfile.phone);
            anonymizedFields.push('user_profiles.phone');
          }

          await supabase
            .from('user_profiles')
            .update(anonymizedUserProfile)
            .eq('user_id', userId);
        }
      }

      // Log anonymization action for audit (using existing audit_logs table)
      await this.logDataAction(userId, 'anonymization', {
        anonymizedFields,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        anonymizedFields,
        retainedFields
      };
    } catch (error) {
      console.error('Data anonymization failed:', error);
      return {
        success: false,
        anonymizedFields: [],
        retainedFields: [],
        error: error instanceof Error ? error.message : 'Anonymization failed'
      };
    }
  }

  // Export user data for GDPR compliance
  static async exportUserData(userId: string, format: 'json' | 'csv' | 'xml' = 'json'): Promise<DataExportResult> {
    try {
      console.log('Exporting user data for:', userId);

      // Collect all user data from various tables
      const userData: any = {};

      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        userData.profile = profile;
      }

      // Get user profile data
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId);

      userData.userProfiles = userProfile || [];

      // Get job applications
      const { data: applications } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', userId);

      userData.jobApplications = applications || [];

      // Get communications
      const { data: communications } = await supabase
        .from('communications')
        .select('*')
        .eq('user_id', userId);

      userData.communications = communications || [];

      // Get job preferences
      const { data: preferences } = await supabase
        .from('job_preferences')
        .select('*')
        .eq('user_id', userId);

      userData.jobPreferences = preferences || [];

      // Convert to requested format
      let exportData: string | any;
      let fileName: string;

      switch (format) {
        case 'json':
          exportData = userData;
          fileName = `user_data_${userId}_${Date.now()}.json`;
          break;
        case 'csv':
          exportData = this.convertToCSV(userData);
          fileName = `user_data_${userId}_${Date.now()}.csv`;
          break;
        case 'xml':
          exportData = this.convertToXML(userData);
          fileName = `user_data_${userId}_${Date.now()}.xml`;
          break;
        default:
          exportData = userData;
          fileName = `user_data_${userId}_${Date.now()}.json`;
      }

      // Log export action for audit
      await this.logDataAction(userId, 'export', {
        format,
        timestamp: new Date().toISOString(),
        fileName
      });

      return {
        success: true,
        data: exportData,
        format,
        fileName
      };
    } catch (error) {
      console.error('Data export failed:', error);
      return {
        success: false,
        format,
        fileName: '',
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }

  // Delete user data (GDPR right to be forgotten)
  static async deleteUserData(userId: string, confirmed: boolean = false): Promise<{ success: boolean; error?: string }> {
    if (!confirmed) {
      return {
        success: false,
        error: 'Deletion must be explicitly confirmed'
      };
    }

    try {
      console.log('Starting data deletion for user:', userId);

      // Log deletion action before deleting (for audit trail)
      await this.logDataAction(userId, 'deletion', {
        timestamp: new Date().toISOString(),
        confirmed
      });

      // Delete from all related tables using existing table names
      const tables = [
        'job_applications',
        'communications',
        'job_preferences',
        'user_profiles'
      ];

      for (const table of tables) {
        // Use type assertion to handle the dynamic table names
        await (supabase as any)
          .from(table)
          .delete()
          .eq('user_id', userId);
      }

      // Finally delete the main profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      return { success: true };
    } catch (error) {
      console.error('Data deletion failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deletion failed'
      };
    }
  }

  private static async logDataAction(userId: string, action: string, metadata: any): Promise<void> {
    try {
      // Use existing audit_logs table
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action,
          metadata,
          ip_address: 'unknown', // Would be captured from request in real implementation
          user_agent: navigator.userAgent,
          table_name: 'data_operations'
        });
    } catch (error) {
      console.error('Failed to log data action:', error);
    }
  }

  private static convertToCSV(data: any): string {
    const flattenObject = (obj: any, prefix = ''): any => {
      let flattened: any = {};
      
      for (const key in obj) {
        if (obj[key] === null || obj[key] === undefined) {
          flattened[prefix + key] = '';
        } else if (Array.isArray(obj[key])) {
          flattened[prefix + key] = JSON.stringify(obj[key]);
        } else if (typeof obj[key] === 'object') {
          Object.assign(flattened, flattenObject(obj[key], prefix + key + '.'));
        } else {
          flattened[prefix + key] = obj[key];
        }
      }
      
      return flattened;
    };

    const flattened = flattenObject(data);
    const headers = Object.keys(flattened);
    const values = Object.values(flattened);

    let csv = headers.join(',') + '\n';
    csv += values.map(value => 
      typeof value === 'string' && value.includes(',') 
        ? `"${value.replace(/"/g, '""')}"` 
        : value
    ).join(',');

    return csv;
  }

  private static convertToXML(data: any): string {
    const xmlEscape = (str: string) => {
      return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const objectToXML = (obj: any, rootName = 'root'): string => {
      let xml = `<${rootName}>`;
      
      for (const key in obj) {
        if (obj[key] === null || obj[key] === undefined) {
          xml += `<${key}></${key}>`;
        } else if (Array.isArray(obj[key])) {
          xml += `<${key}>`;
          obj[key].forEach((item: any, index: number) => {
            if (typeof item === 'object') {
              xml += objectToXML(item, `item_${index}`);
            } else {
              xml += `<item_${index}>${xmlEscape(item.toString())}</item_${index}>`;
            }
          });
          xml += `</${key}>`;
        } else if (typeof obj[key] === 'object') {
          xml += objectToXML(obj[key], key);
        } else {
          xml += `<${key}>${xmlEscape(obj[key].toString())}</${key}>`;
        }
      }
      
      xml += `</${rootName}>`;
      return xml;
    };

    return '<?xml version="1.0" encoding="UTF-8"?>\n' + objectToXML(data, 'userData');
  }
}

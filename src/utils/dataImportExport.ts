import { supabase } from '@/integrations/supabase/client';
import { ProfileDataSync } from './profileDataSync';
import { ErrorHandler } from './errorHandling';

export interface ImportResult {
  success: boolean;
  errors?: string[];
  warnings?: string[];
  data?: any;
}

export interface ExportResult {
  success: boolean;
  data?: any;
  errors?: string[];
}

export interface BackupData {
  version: string;
  timestamp: string;
  userId: string;
  profileData: any;
  metadata: {
    exportSource: string;
    dataVersion: number;
  };
}

export class DataImportExportService {
  private static readonly CURRENT_VERSION = '1.0.0';
  private static readonly SUPPORTED_VERSIONS = ['1.0.0'];

  static async exportProfileData(userId: string): Promise<ExportResult> {
    try {
      const [profile, workExp, education, skills, languages, projects, activities] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('work_experiences').select('*').eq('user_id', userId),
        supabase.from('education').select('*').eq('user_id', userId),
        supabase.from('user_skills').select('*').eq('user_id', userId),
        supabase.from('user_languages').select('*').eq('user_id', userId),
        supabase.from('projects').select('*').eq('user_id', userId),
        supabase.from('activities_leadership').select('*').eq('user_id', userId)
      ]);

      const exportData: BackupData = {
        version: this.CURRENT_VERSION,
        timestamp: new Date().toISOString(),
        userId,
        profileData: {
          profile: profile.data,
          workExperiences: workExp.data || [],
          education: education.data || [],
          skills: skills.data || [],
          languages: languages.data || [],
          projects: projects.data || [],
          activities: activities.data || []
        },
        metadata: {
          exportSource: 'web_app',
          dataVersion: 1
        }
      };

      return {
        success: true,
        data: exportData
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Export failed']
      };
    }
  }

  static async importProfileData(userId: string, importData: BackupData): Promise<ImportResult> {
    try {
      const validation = this.validateImportedData(importData);
      if (!validation.success) {
        return validation;
      }

      const { profileData } = importData;

      // Import profile data
      if (profileData.profile) {
        const syncResult = ProfileDataSync.prepareProfileForDatabase(profileData.profile);
        if (syncResult.success && syncResult.data) {
          const { error } = await supabase
            .from('user_profiles')
            .upsert({ ...syncResult.data, user_id: userId });
          
          if (error) throw error;
        }
      }

      // Import work experiences
      if (profileData.workExperiences?.length > 0) {
        const workExpData = profileData.workExperiences.map((exp: any) => ({
          ...exp,
          user_id: userId,
          id: undefined // Let database generate new IDs
        }));

        const { error } = await supabase
          .from('work_experiences')
          .upsert(workExpData);
        
        if (error) throw error;
      }

      // Import education
      if (profileData.education?.length > 0) {
        const educationData = profileData.education.map((edu: any) => ({
          ...edu,
          user_id: userId,
          id: undefined
        }));

        const { error } = await supabase
          .from('education')
          .upsert(educationData);
        
        if (error) throw error;
      }

      // Import skills
      if (profileData.skills?.length > 0) {
        const skillsData = profileData.skills.map((skill: any) => ({
          ...skill,
          user_id: userId,
          id: undefined
        }));

        const { error } = await supabase
          .from('user_skills')
          .upsert(skillsData);
        
        if (error) throw error;
      }

      return {
        success: true,
        data: profileData
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Import failed']
      };
    }
  }

  private static validateImportedData(data: BackupData): ImportResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Version validation
    if (!data.version || !this.SUPPORTED_VERSIONS.includes(data.version)) {
      errors.push(`Unsupported data version: ${data.version}`);
    }

    // Structure validation
    if (!data.profileData) {
      errors.push('Missing profile data');
    }

    if (!data.userId) {
      errors.push('Missing user ID');
    }

    // Data quality checks
    if (data.profileData?.workExperiences?.length === 0) {
      warnings.push('No work experiences found in import data');
    }

    if (data.profileData?.skills?.length === 0) {
      warnings.push('No skills found in import data');
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  static async createBackup(userId: string): Promise<string | null> {
    try {
      const exportResult = await this.exportProfileData(userId);
      
      if (!exportResult.success || !exportResult.data) {
        throw new Error('Failed to export profile data');
      }

      const backupData = JSON.stringify(exportResult.data, null, 2);
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      return url;
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'Create Backup', userId }
      );
      return null;
    }
  }

  static async restoreFromBackup(userId: string, file: File): Promise<ImportResult> {
    try {
      const fileContent = await file.text();
      const backupData: BackupData = JSON.parse(fileContent);
      
      return await this.importProfileData(userId, backupData);
    } catch (error) {
      return {
        success: false,
        errors: ['Invalid backup file format']
      };
    }
  }

  static downloadBackup(backupUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.href = backupUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(backupUrl);
  }
}

// Export both the class and a shorter alias for backward compatibility
export const DataImportExport = DataImportExportService;


interface BackupData {
  profile: any;
  workExperiences: any[];
  education: any[];
  projects: any[];
  skills: string[];
  languages: string[];
  activities: any[];
  metadata: {
    exportDate: string;
    version: string;
  };
}

interface ImportResult {
  success: boolean;
  data?: any;
  errors?: string[];
}

interface ExportResult {
  success: boolean;
  data?: string;
  error?: string;
}

export class DataImportExportService {
  static async exportProfileData(userId: string): Promise<ExportResult> {
    try {
      // In a real implementation, this would fetch from database
      const backupData: BackupData = {
        profile: {}, // Would fetch from profileService
        workExperiences: [],
        education: [],
        projects: [],
        skills: [],
        languages: [],
        activities: [],
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0'
        }
      };

      const exportString = JSON.stringify(backupData, null, 2);
      
      return {
        success: true,
        data: exportString
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }

  static async importProfileData(userId: string, backupData: BackupData): Promise<ImportResult> {
    try {
      // Validate backup data structure
      if (!backupData.metadata || !backupData.profile) {
        throw new Error('Invalid backup data format');
      }

      // Convert backup format to current profile format
      const profileData = {
        personalInfo: backupData.profile,
        workExperiences: backupData.workExperiences || [],
        education: backupData.education || [],
        projects: backupData.projects || [],
        activities: backupData.activities || [],
        skills: backupData.skills || [],
        languages: backupData.languages || []
      };

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

  static async createBackup(userId: string): Promise<boolean> {
    try {
      const exportResult = await this.exportProfileData(userId);
      
      if (exportResult.success && exportResult.data) {
        // In a real implementation, this would save to a backup storage
        console.log('Backup created for user:', userId);
        localStorage.setItem(`backup_${userId}`, exportResult.data);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Backup creation failed:', error);
      return false;
    }
  }

  static generateExportFilename(format: 'json' | 'csv' = 'json'): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `streamline_profile_export_${timestamp}.${format}`;
  }

  static downloadExportData(data: string, filename: string): void {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}


import { ParsedResume } from '@/types/resume';
import { ErrorHandler } from './errorHandling';

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  includePersonalInfo?: boolean;
  includeWorkExperience?: boolean;
  includeEducation?: boolean;
  includeSkills?: boolean;
  includeProjects?: boolean;
}

export interface ImportResult {
  success: boolean;
  data?: Partial<ParsedResume>;
  errors?: string[];
  warnings?: string[];
}

export class DataImportExport {
  // Export profile data
  static async exportProfileData(
    profileData: ParsedResume,
    options: ExportOptions
  ): Promise<{ success: boolean; data?: string; filename?: string; error?: string }> {
    try {
      const filteredData = this.filterDataForExport(profileData, options);
      
      switch (options.format) {
        case 'json':
          return {
            success: true,
            data: JSON.stringify(filteredData, null, 2),
            filename: `profile_export_${new Date().toISOString().split('T')[0]}.json`
          };
          
        case 'csv':
          const csvData = this.convertToCSV(filteredData);
          return {
            success: true,
            data: csvData,
            filename: `profile_export_${new Date().toISOString().split('T')[0]}.csv`
          };
          
        default:
          return {
            success: false,
            error: `Export format ${options.format} is not yet supported`
          };
      }
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'Export Profile Data' }
      );
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }

  // Import profile data
  static async importProfileData(
    fileContent: string,
    format: 'json' | 'csv'
  ): Promise<ImportResult> {
    try {
      let importedData: any;
      
      switch (format) {
        case 'json':
          importedData = JSON.parse(fileContent);
          break;
          
        case 'csv':
          importedData = this.parseCSV(fileContent);
          break;
          
        default:
          return {
            success: false,
            errors: [`Import format ${format} is not supported`]
          };
      }
      
      const validationResult = this.validateImportedData(importedData);
      
      if (!validationResult.success) {
        return validationResult;
      }
      
      const normalizedData = this.normalizeImportedData(importedData);
      
      return {
        success: true,
        data: normalizedData,
        warnings: validationResult.warnings
      };
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'Import Profile Data' }
      );
      
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Import failed']
      };
    }
  }

  // Create backup of current profile
  static async createBackup(profileData: ParsedResume): Promise<{ success: boolean; backupKey?: string; error?: string }> {
    try {
      const timestamp = new Date().toISOString();
      const backupKey = `profile_backup_${timestamp}`;
      
      const backupData = {
        version: '1.0',
        timestamp,
        data: profileData
      };
      
      localStorage.setItem(backupKey, JSON.stringify(backupData));
      
      // Keep only last 5 backups
      this.cleanupOldBackups();
      
      return { success: true, backupKey };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Backup failed'
      };
    }
  }

  // Restore from backup
  static async restoreFromBackup(backupKey: string): Promise<{ success: boolean; data?: ParsedResume; error?: string }> {
    try {
      const backupData = localStorage.getItem(backupKey);
      
      if (!backupData) {
        return { success: false, error: 'Backup not found' };
      }
      
      const parsed = JSON.parse(backupData);
      
      return { success: true, data: parsed.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Restore failed'
      };
    }
  }

  // Get available backups
  static getAvailableBackups(): Array<{ key: string; timestamp: string; size: string }> {
    const backups: Array<{ key: string; timestamp: string; size: string }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key?.startsWith('profile_backup_')) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            backups.push({
              key,
              timestamp: parsed.timestamp,
              size: `${Math.round(data.length / 1024)} KB`
            });
          }
        } catch (error) {
          console.warn(`Invalid backup data for key ${key}`);
        }
      }
    }
    
    return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Migrate data between versions
  static migrateResumeVersion(oldData: any, targetVersion: string): ParsedResume {
    // Handle different resume data versions
    const migrated = { ...oldData };
    
    // Add migration logic here based on version differences
    if (!migrated.personalInfo) {
      migrated.personalInfo = {};
    }
    
    // Ensure all required fields exist
    migrated.workExperiences = migrated.workExperiences || [];
    migrated.education = migrated.education || [];
    migrated.projects = migrated.projects || [];
    migrated.skills = migrated.skills || [];
    migrated.languages = migrated.languages || [];
    migrated.socialLinks = migrated.socialLinks || {};
    
    return migrated as ParsedResume;
  }

  // Helper methods
  private static filterDataForExport(data: ParsedResume, options: ExportOptions): Partial<ParsedResume> {
    const filtered: Partial<ParsedResume> = {};
    
    if (options.includePersonalInfo) filtered.personalInfo = data.personalInfo;
    if (options.includeWorkExperience) filtered.workExperiences = data.workExperiences;
    if (options.includeEducation) filtered.education = data.education;
    if (options.includeSkills) filtered.skills = data.skills;
    if (options.includeProjects) filtered.projects = data.projects;
    
    return filtered;
  }

  private static convertToCSV(data: any): string {
    // Simple CSV conversion - expand based on needs
    const rows: string[] = [];
    
    // Add headers
    rows.push('Section,Field,Value');
    
    // Convert object to flat CSV structure
    const flattenObject = (obj: any, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'object') {
              flattenObject(item, `${prefix}${key}[${index}].`);
            } else {
              rows.push(`${prefix}${key},${index},${item}`);
            }
          });
        } else if (typeof value === 'object' && value !== null) {
          flattenObject(value, `${prefix}${key}.`);
        } else {
          rows.push(`${prefix},${key},${value}`);
        }
      });
    };
    
    flattenObject(data);
    return rows.join('\n');
  }

  private static parseCSV(csvContent: string): any {
    // Basic CSV parsing - expand based on needs
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    const result: any = {};
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const section = values[0];
      const field = values[1];
      const value = values[2];
      
      if (!result[section]) result[section] = {};
      result[section][field] = value;
    }
    
    return result;
  }

  private static validateImportedData(data: any): ImportResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic validation
    if (!data || typeof data !== 'object') {
      errors.push('Invalid data format');
      return { success: false, errors };
    }
    
    // Check for required sections
    if (data.personalInfo && !data.personalInfo.name) {
      warnings.push('Personal info missing name field');
    }
    
    return { 
      success: errors.length === 0, 
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  private static normalizeImportedData(data: any): Partial<ParsedResume> {
    // Convert imported data to ParsedResume format
    return {
      personalInfo: data.personalInfo || {},
      workExperiences: Array.isArray(data.workExperiences) ? data.workExperiences : [],
      education: Array.isArray(data.education) ? data.education : [],
      projects: Array.isArray(data.projects) ? data.projects : [],
      skills: Array.isArray(data.skills) ? data.skills : [],
      languages: Array.isArray(data.languages) ? data.languages : [],
      socialLinks: data.socialLinks || {},
      activities: Array.isArray(data.activities) ? data.activities : []
    };
  }

  private static cleanupOldBackups() {
    const backups = this.getAvailableBackups();
    
    // Keep only the 5 most recent backups
    if (backups.length > 5) {
      const toDelete = backups.slice(5);
      toDelete.forEach(backup => {
        localStorage.removeItem(backup.key);
      });
    }
  }
}

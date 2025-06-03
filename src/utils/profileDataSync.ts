
interface SyncResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

export class ProfileDataSync {
  static prepareProfileForDatabase(profileData: any): SyncResult<any> {
    try {
      // Convert UI format to database format (flat ParsedResume structure)
      const dbProfile = {
        personalInfo: {
          name: profileData.personalInfo?.name || '',
          email: profileData.personalInfo?.email || '',
          phone: profileData.personalInfo?.phone || '',
          location: this.combineAddressFields(profileData.personalInfo),
        },
        socialLinks: {
          linkedin: profileData.socialLinks?.linkedin || '',
          github: profileData.socialLinks?.github || '',
          portfolio: profileData.socialLinks?.portfolio || '',
          other: profileData.socialLinks?.other || ''
        },
        workExperiences: profileData.workExperiences || [],
        education: profileData.education || [],
        projects: profileData.projects || [],
        activities: profileData.activities || [],
        skills: profileData.skills || [],
        languages: profileData.languages || []
      };

      console.log('📋 Prepared profile data for database:', dbProfile);
      return { success: true, data: dbProfile };
    } catch (error) {
      console.error('❌ Profile data sync error:', error);
      return {
        success: false,
        errors: [`Data sync error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  static prepareProfileForUI(dbData: any): SyncResult<any> {
    try {
      const uiProfile = {
        personalInfo: {
          name: dbData.personalInfo?.name || '',
          email: dbData.personalInfo?.email || '',
          phone: dbData.personalInfo?.phone || '',
          ...this.parseLocationToAddress(dbData.personalInfo?.location || '')
        },
        socialLinks: {
          linkedin: dbData.personalInfo?.linkedin_url || dbData.socialLinks?.linkedin || '',
          github: dbData.personalInfo?.github_url || dbData.socialLinks?.github || '',
          portfolio: dbData.personalInfo?.portfolio_url || dbData.socialLinks?.portfolio || '',
          other: dbData.personalInfo?.other_url || dbData.socialLinks?.other || ''
        },
        workExperiences: dbData.workExperiences || [],
        education: dbData.education || [],
        projects: dbData.projects || [],
        activities: dbData.activities || [],
        skills: dbData.skills || [],
        languages: dbData.languages || []
      };

      return { success: true, data: uiProfile };
    } catch (error) {
      return {
        success: false,
        errors: [`UI sync error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  private static combineAddressFields(personalInfo: any): string {
    const addressParts = [
      personalInfo?.streetAddress,
      personalInfo?.city,
      personalInfo?.state,
      personalInfo?.county,
      personalInfo?.zipCode
    ].filter(Boolean);

    return addressParts.join(', ');
  }

  private static parseLocationToAddress(location: string): any {
    const parts = location.split(', ').map(part => part.trim());
    
    return {
      streetAddress: parts[0] || '',
      city: parts[1] || '',
      state: parts[2] || '',
      county: parts[3] || '',
      zipCode: parts[4] || ''
    };
  }
}

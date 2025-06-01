
import { AddressValidator } from './addressValidation';
import { ErrorHandler } from './errorHandling';

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  similarItems: any[];
  confidence: number;
}

export interface AddressValidationResult {
  isValid: boolean;
  standardizedAddress?: any;
  suggestions?: any[];
  confidence: number;
}

export class AdvancedValidationService {
  // Server-side address validation (mock implementation)
  static async validateAddressWithAPI(address: any): Promise<AddressValidationResult> {
    try {
      // Basic validation first
      const basicValidation = AddressValidator.validateCompleteAddress(address);
      
      if (!basicValidation.isValid) {
        return {
          isValid: false,
          confidence: 0,
          suggestions: []
        };
      }

      // Mock API call - in real implementation, use USPS, Google, or similar API
      const mockAPIResponse = {
        isValid: true,
        standardizedAddress: basicValidation.standardizedAddress,
        confidence: 0.95
      };

      return mockAPIResponse;
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'Address API Validation' }
      );
      
      return {
        isValid: false,
        confidence: 0,
        suggestions: []
      };
    }
  }

  // Detect duplicate work experiences
  static detectDuplicateWorkExperience(experiences: any[], newExperience: any): DuplicateDetectionResult {
    const similarities = experiences.map(exp => {
      let score = 0;
      
      // Company name similarity
      if (exp.company.toLowerCase() === newExperience.company.toLowerCase()) {
        score += 40;
      } else if (exp.company.toLowerCase().includes(newExperience.company.toLowerCase()) ||
                 newExperience.company.toLowerCase().includes(exp.company.toLowerCase())) {
        score += 20;
      }
      
      // Role similarity
      if (exp.role.toLowerCase() === newExperience.role.toLowerCase()) {
        score += 30;
      } else if (exp.role.toLowerCase().includes(newExperience.role.toLowerCase()) ||
                 newExperience.role.toLowerCase().includes(exp.role.toLowerCase())) {
        score += 15;
      }
      
      // Date overlap
      if (exp.start_date === newExperience.start_date || exp.end_date === newExperience.end_date) {
        score += 20;
      }
      
      // Location similarity
      if (exp.location && newExperience.location) {
        if (exp.location.toLowerCase() === newExperience.location.toLowerCase()) {
          score += 10;
        }
      }
      
      return { item: exp, score };
    });

    const highestScore = Math.max(...similarities.map(s => s.score));
    const duplicates = similarities.filter(s => s.score >= 70);

    return {
      isDuplicate: highestScore >= 70,
      similarItems: duplicates.map(d => d.item),
      confidence: highestScore / 100
    };
  }

  // Detect duplicate education entries
  static detectDuplicateEducation(educations: any[], newEducation: any): DuplicateDetectionResult {
    const similarities = educations.map(edu => {
      let score = 0;
      
      // School name similarity
      if (edu.school.toLowerCase() === newEducation.school.toLowerCase()) {
        score += 50;
      } else if (edu.school.toLowerCase().includes(newEducation.school.toLowerCase()) ||
                 newEducation.school.toLowerCase().includes(edu.school.toLowerCase())) {
        score += 25;
      }
      
      // Degree similarity
      if (edu.degree && newEducation.degree) {
        if (edu.degree.toLowerCase() === newEducation.degree.toLowerCase()) {
          score += 30;
        }
      }
      
      // Field of study similarity
      if (edu.field_of_study && newEducation.field_of_study) {
        if (edu.field_of_study.toLowerCase() === newEducation.field_of_study.toLowerCase()) {
          score += 20;
        }
      }
      
      return { item: edu, score };
    });

    const highestScore = Math.max(...similarities.map(s => s.score));
    const duplicates = similarities.filter(s => s.score >= 70);

    return {
      isDuplicate: highestScore >= 70,
      similarItems: duplicates.map(d => d.item),
      confidence: highestScore / 100
    };
  }

  // Detect duplicate projects
  static detectDuplicateProjects(projects: any[], newProject: any): DuplicateDetectionResult {
    const similarities = projects.map(proj => {
      let score = 0;
      
      // Project name similarity
      if (proj.name.toLowerCase() === newProject.name.toLowerCase()) {
        score += 60;
      } else if (proj.name.toLowerCase().includes(newProject.name.toLowerCase()) ||
                 newProject.name.toLowerCase().includes(proj.name.toLowerCase())) {
        score += 30;
      }
      
      // URL similarity
      if (proj.url && newProject.url && proj.url === newProject.url) {
        score += 40;
      }
      
      return { item: proj, score };
    });

    const highestScore = Math.max(...similarities.map(s => s.score));
    const duplicates = similarities.filter(s => s.score >= 70);

    return {
      isDuplicate: highestScore >= 70,
      similarItems: duplicates.map(d => d.item),
      confidence: highestScore / 100
    };
  }

  // Data consistency checks
  static validateDataConsistency(profileData: any): { isConsistent: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check date consistency in work experience
    if (profileData.workExperiences) {
      profileData.workExperiences.forEach((exp: any, index: number) => {
        if (exp.start_date && exp.end_date) {
          const startDate = new Date(exp.start_date);
          const endDate = new Date(exp.end_date);
          
          if (startDate > endDate) {
            issues.push(`Work experience ${index + 1}: Start date is after end date`);
          }
        }
      });
    }

    // Check date consistency in education
    if (profileData.education) {
      profileData.education.forEach((edu: any, index: number) => {
        if (edu.start_date && edu.end_date) {
          const startDate = new Date(edu.start_date);
          const endDate = new Date(edu.end_date);
          
          if (startDate > endDate) {
            issues.push(`Education ${index + 1}: Start date is after end date`);
          }
        }
      });
    }

    // Check skill duplicates
    if (profileData.skills) {
      const skillNames = profileData.skills.map((s: any) => s.skill?.toLowerCase() || s.toLowerCase());
      const duplicateSkills = skillNames.filter((skill: string, index: number) => 
        skillNames.indexOf(skill) !== index
      );
      
      if (duplicateSkills.length > 0) {
        issues.push(`Duplicate skills found: ${duplicateSkills.join(', ')}`);
      }
    }

    return {
      isConsistent: issues.length === 0,
      issues
    };
  }
}

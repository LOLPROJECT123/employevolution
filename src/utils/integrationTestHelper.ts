
import { supabase } from '@/integrations/supabase/client';
import { profileService } from '@/services/profileService';
import { EnhancedProfileService } from '@/services/enhancedProfileService';

export interface TestScenario {
  name: string;
  description: string;
  setup: () => Promise<void>;
  test: () => Promise<boolean>;
  cleanup: () => Promise<void>;
}

export class IntegrationTestHelper {
  private static testUserId = 'test-user-' + Date.now();

  static async runTestSuite(): Promise<{ passed: number; failed: number; results: any[] }> {
    const scenarios = this.getTestScenarios();
    const results = [];
    let passed = 0;
    let failed = 0;

    console.log('🧪 Starting Integration Test Suite...');

    for (const scenario of scenarios) {
      try {
        console.log(`\n🔄 Running: ${scenario.name}`);
        
        await scenario.setup();
        const result = await scenario.test();
        await scenario.cleanup();

        if (result) {
          console.log(`✅ ${scenario.name} - PASSED`);
          passed++;
        } else {
          console.log(`❌ ${scenario.name} - FAILED`);
          failed++;
        }

        results.push({
          name: scenario.name,
          passed: result,
          description: scenario.description
        });
      } catch (error) {
        console.error(`💥 ${scenario.name} - ERROR:`, error);
        failed++;
        results.push({
          name: scenario.name,
          passed: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
    return { passed, failed, results };
  }

  private static getTestScenarios(): TestScenario[] {
    return [
      {
        name: 'Profile Save and Load Integration',
        description: 'Tests complete profile save and load workflow with validation',
        setup: async () => {
          // Create test profile data
        },
        test: async () => {
          const testProfile = {
            personalInfo: {
              name: 'Test User',
              email: 'test@example.com',
              phone: '123-456-7890',
              streetAddress: '123 Test St',
              city: 'Test City',
              state: 'TS',
              county: 'Test County',
              zipCode: '12345'
            },
            skills: ['JavaScript', 'React', 'TypeScript'],
            workExperiences: [{
              company: 'Test Company',
              role: 'Test Role',
              startDate: '2020-01',
              endDate: '2023-01',
              description: ['Test description']
            }],
            education: [{
              school: 'Test University',
              degree: 'Test Degree',
              fieldOfStudy: 'Computer Science',
              startDate: '2016',
              endDate: '2020'
            }]
          };

          // Test enhanced save
          const saveResult = await EnhancedProfileService.saveProfileWithValidation(
            this.testUserId, 
            testProfile
          );

          if (!saveResult) return false;

          // Test enhanced load
          const loadResult = await EnhancedProfileService.loadProfileForUI(this.testUserId);
          
          return loadResult !== null && loadResult.personalInfo.name === 'Test User';
        },
        cleanup: async () => {
          // Clean up test data
          try {
            await supabase.from('user_profiles').delete().eq('user_id', this.testUserId);
            await supabase.from('work_experiences').delete().eq('user_id', this.testUserId);
            await supabase.from('education').delete().eq('user_id', this.testUserId);
            await supabase.from('user_skills').delete().eq('user_id', this.testUserId);
          } catch (error) {
            console.warn('Cleanup failed:', error);
          }
        }
      },

      {
        name: 'Validation Error Handling',
        description: 'Tests validation error handling and recovery',
        setup: async () => {},
        test: async () => {
          const invalidProfile = {
            personalInfo: {
              name: '', // Invalid - empty name
              email: 'invalid-email', // Invalid email format
              phone: '',
              streetAddress: '',
              city: '',
              state: '',
              county: '',
              zipCode: ''
            }
          };

          try {
            const result = await EnhancedProfileService.saveProfileWithValidation(
              this.testUserId,
              invalidProfile
            );
            
            // Should return false for invalid data
            return result === false;
          } catch (error) {
            // Expected to catch validation errors
            return true;
          }
        },
        cleanup: async () => {}
      },

      {
        name: 'Profile Completion Tracking',
        description: 'Tests profile completion calculation and tracking',
        setup: async () => {},
        test: async () => {
          const partialProfile = {
            personalInfo: {
              name: 'Test User',
              email: 'test@example.com',
              phone: '123-456-7890',
              streetAddress: '123 Test St',
              city: 'Test City',
              state: 'TS',
              county: 'Test County',
              zipCode: '12345'
            },
            skills: ['JavaScript'],
            // Missing work experience and education
          };

          const validation = await EnhancedProfileService.validateProfileCompletionDetailed(
            this.testUserId,
            partialProfile
          );

          // Should have completion data and identify missing sections
          return validation.completionItems.length > 0 && 
                 validation.qualityMetrics.completionScore < 100;
        },
        cleanup: async () => {}
      },

      {
        name: 'Data Export and Import',
        description: 'Tests profile data export and import functionality',
        setup: async () => {
          const testProfile = {
            personalInfo: {
              name: 'Export Test User',
              email: 'export@example.com',
              phone: '123-456-7890',
              streetAddress: '123 Export St',
              city: 'Export City',
              state: 'EX',
              county: 'Export County',
              zipCode: '12345'
            },
            skills: ['Export Skill']
          };

          await EnhancedProfileService.saveProfileWithValidation(this.testUserId, testProfile);
        },
        test: async () => {
          // Test export
          const exportResult = await EnhancedProfileService.exportProfile(this.testUserId);
          
          if (!exportResult.success) return false;

          // Test import
          const importData = JSON.stringify(exportResult);
          const importResult = await EnhancedProfileService.importAndMergeProfile(
            this.testUserId + '_import',
            importData,
            'json'
          );

          return importResult;
        },
        cleanup: async () => {
          await supabase.from('user_profiles').delete().eq('user_id', this.testUserId);
          await supabase.from('user_profiles').delete().eq('user_id', this.testUserId + '_import');
        }
      }
    ];
  }

  static async createTestData() {
    return {
      userId: this.testUserId,
      profileData: {
        personalInfo: {
          name: 'Integration Test User',
          email: 'integration@test.com',
          phone: '555-0123',
          streetAddress: '123 Integration Ave',
          city: 'Test City',
          state: 'TC',
          county: 'Test County',
          zipCode: '12345'
        },
        skills: ['Integration Testing', 'Quality Assurance'],
        workExperiences: [],
        education: [],
        projects: [],
        activities: [],
        languages: []
      }
    };
  }
}

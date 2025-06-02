
import { supabase } from '@/integrations/supabase/client';

export interface ABTest {
  id: string;
  name: string;
  description?: string;
  variants: ABTestVariant[];
  status: 'draft' | 'active' | 'paused' | 'completed';
  traffic_allocation: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ABTestVariant {
  id: string;
  name: string;
  allocation_percentage: number;
  config: Record<string, any>;
  participants?: number;
  conversions?: number;
  conversionRate?: number;
}

export interface ABTestAssignment {
  userId: string;
  testId: string;
  variantId: string;
  assignedAt: Date;
}

export interface ABTestResult {
  testId: string;
  testName: string;
  variants: Array<{
    variantId: string;
    name: string;
    participants: number;
    conversions: number;
    conversionRate: number;
  }>;
  variantA: {
    conversionRate: number;
    conversions: number;
    users: number;
  };
  variantB: {
    conversionRate: number;
    conversions: number;
    users: number;
  };
  winner?: string;
  confidence: number;
  statistical_significance: boolean;
}

export class ABTestingService {
  private static assignments = new Map<string, ABTestAssignment>();

  static async getActiveTests(): Promise<ABTest[]> {
    try {
      // Mock data since ab_tests table doesn't exist
      console.log('AB Testing: Using mock data as ab_tests table does not exist');
      return [
        {
          id: 'test-1',
          name: 'Job Card Layout Test',
          description: 'Testing different job card layouts',
          variants: [
            { id: 'variant-a', name: 'Original', allocation_percentage: 50, config: { layout: 'original' } },
            { id: 'variant-b', name: 'Enhanced', allocation_percentage: 50, config: { layout: 'enhanced' } }
          ],
          status: 'active',
          traffic_allocation: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Failed to fetch A/B tests:', error);
      return [];
    }
  }

  static async createTest(testData: Partial<ABTest>): Promise<ABTest | null> {
    try {
      // Mock implementation since table doesn't exist
      const newTest: ABTest = {
        id: `test-${Date.now()}`,
        name: testData.name || '',
        description: testData.description,
        variants: testData.variants || [],
        status: testData.status || 'draft',
        traffic_allocation: testData.traffic_allocation || 0,
        start_date: testData.start_date,
        end_date: testData.end_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('AB Testing: Created mock test', newTest);
      return newTest;
    } catch (error) {
      console.error('Failed to create A/B test:', error);
      return null;
    }
  }

  static async getUserVariant(userId: string, testId: string): Promise<ABTestVariant | null> {
    try {
      const assignmentKey = `${userId}-${testId}`;
      
      // Check existing assignment
      if (this.assignments.has(assignmentKey)) {
        const assignment = this.assignments.get(assignmentKey)!;
        const tests = await this.getActiveTests();
        const test = tests.find(t => t.id === testId);
        return test?.variants.find(v => v.id === assignment.variantId) || null;
      }

      // Create new assignment
      const tests = await this.getActiveTests();
      const test = tests.find(t => t.id === testId && t.status === 'active');
      
      if (!test || test.variants.length === 0) {
        return null;
      }

      // Simple random assignment based on allocation percentages
      const random = Math.random() * 100;
      let cumulativePercentage = 0;
      
      for (const variant of test.variants) {
        cumulativePercentage += variant.allocation_percentage;
        if (random <= cumulativePercentage) {
          const assignment: ABTestAssignment = {
            userId,
            testId,
            variantId: variant.id,
            assignedAt: new Date()
          };
          
          this.assignments.set(assignmentKey, assignment);
          console.log(`AB Testing: Assigned user ${userId} to variant ${variant.id} for test ${testId}`);
          return variant;
        }
      }

      return test.variants[0]; // Fallback to first variant
    } catch (error) {
      console.error('Failed to get user variant:', error);
      return null;
    }
  }

  static async trackConversion(userId: string, testId: string, conversionType: string, value?: number): Promise<void> {
    try {
      const assignmentKey = `${userId}-${testId}`;
      const assignment = this.assignments.get(assignmentKey);
      
      if (!assignment) {
        console.warn(`No assignment found for user ${userId} in test ${testId}`);
        return;
      }

      console.log('AB Testing: Conversion tracked', {
        userId,
        testId,
        variantId: assignment.variantId,
        conversionType,
        value,
        convertedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  }

  static async getTestResults(testId: string): Promise<ABTestResult | null> {
    try {
      // Mock results since we don't have real data
      const tests = await this.getActiveTests();
      const test = tests.find(t => t.id === testId);
      
      if (!test) {
        return null;
      }

      return {
        testId,
        testName: test.name,
        variants: [
          {
            variantId: 'variant-a',
            name: 'Original',
            participants: 150,
            conversions: 15,
            conversionRate: 10.0
          },
          {
            variantId: 'variant-b', 
            name: 'Enhanced',
            participants: 145,
            conversions: 20,
            conversionRate: 13.8
          }
        ],
        variantA: {
          conversionRate: 10.0,
          conversions: 15,
          users: 150
        },
        variantB: {
          conversionRate: 13.8,
          conversions: 20,
          users: 145
        },
        winner: 'variant-b',
        confidence: 95.2,
        statistical_significance: true
      };
    } catch (error) {
      console.error('Failed to get test results:', error);
      return null;
    }
  }

  static async pauseTest(testId: string): Promise<boolean> {
    try {
      console.log(`AB Testing: Paused test ${testId}`);
      return true;
    } catch (error) {
      console.error('Failed to pause test:', error);
      return false;
    }
  }

  static async completeTest(testId: string): Promise<boolean> {
    try {
      console.log(`AB Testing: Completed test ${testId}`);
      return true;
    } catch (error) {
      console.error('Failed to complete test:', error);
      return false;
    }
  }
}

export const abTestingService = ABTestingService;

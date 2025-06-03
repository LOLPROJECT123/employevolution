
import { supabase } from '@/integrations/supabase/client';

export interface ABTest {
  id: string;
  testName: string;
  variantA: Record<string, any>;
  variantB: Record<string, any>;
  isActive: boolean;
  trafficSplit: number;
  createdAt: Date;
}

export interface ABTestAssignment {
  userId: string;
  testId: string;
  variant: 'a' | 'b';
  assignedAt: Date;
}

export interface ABTestResult {
  testId: string;
  testName: string;
  variantA: {
    users: number;
    conversions: number;
    conversionRate: number;
  };
  variantB: {
    users: number;
    conversions: number;
    conversionRate: number;
  };
  winner?: 'a' | 'b' | 'tie';
  confidence: number;
}

export class ABTestingService {
  private static cache = new Map<string, ABTestAssignment>();

  static async createTest(
    testName: string,
    variantA: Record<string, any>,
    variantB: Record<string, any>,
    trafficSplit: number = 50
  ): Promise<string> {
    const { data, error } = await supabase
      .from('ab_tests')
      .insert({
        test_name: testName,
        variant_a: variantA,
        variant_b: variantB,
        traffic_split: trafficSplit,
        is_active: true
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create A/B test: ${error.message}`);
    }

    return data.id;
  }

  static async getVariant(userId: string, testName: string): Promise<'a' | 'b' | null> {
    // Check cache first
    const cacheKey = `${userId}-${testName}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached.variant;
    }

    // Get test
    const { data: test } = await supabase
      .from('ab_tests')
      .select('*')
      .eq('test_name', testName)
      .eq('is_active', true)
      .single();

    if (!test) {
      return null;
    }

    // Check existing assignment
    const { data: existing } = await supabase
      .from('user_ab_assignments')
      .select('*')
      .eq('user_id', userId)
      .eq('test_id', test.id)
      .single();

    if (existing) {
      const assignment: ABTestAssignment = {
        userId,
        testId: test.id,
        variant: existing.variant as 'a' | 'b',
        assignedAt: new Date(existing.assigned_at)
      };
      this.cache.set(cacheKey, assignment);
      return assignment.variant;
    }

    // Create new assignment
    const variant = this.determineVariant(test.traffic_split);
    
    const { error } = await supabase
      .from('user_ab_assignments')
      .insert({
        user_id: userId,
        test_id: test.id,
        variant
      });

    if (error) {
      console.error('Failed to create A/B test assignment:', error);
      return 'a'; // Default to variant A
    }

    const assignment: ABTestAssignment = {
      userId,
      testId: test.id,
      variant,
      assignedAt: new Date()
    };
    this.cache.set(cacheKey, assignment);

    return variant;
  }

  private static determineVariant(trafficSplit: number): 'a' | 'b' {
    return Math.random() * 100 < trafficSplit ? 'a' : 'b';
  }

  static async getTestConfig(userId: string, testName: string): Promise<Record<string, any> | null> {
    const variant = await this.getVariant(userId, testName);
    if (!variant) return null;

    const { data: test } = await supabase
      .from('ab_tests')
      .select('*')
      .eq('test_name', testName)
      .eq('is_active', true)
      .single();

    if (!test) return null;

    return variant === 'a' ? test.variant_a : test.variant_b;
  }

  static async trackConversion(userId: string, testName: string, conversionType: string = 'default'): Promise<void> {
    const variant = await this.getVariant(userId, testName);
    if (!variant) return;

    // Track the conversion in analytics
    const { AnalyticsService } = await import('./analyticsService');
    AnalyticsService.track('ab_test_conversion', {
      testName,
      variant,
      conversionType
    }, userId);
  }

  static async getTestResults(testId: string): Promise<ABTestResult | null> {
    // Get test details
    const { data: test } = await supabase
      .from('ab_tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (!test) return null;

    // Get assignments
    const { data: assignments } = await supabase
      .from('user_ab_assignments')
      .select('*')
      .eq('test_id', testId);

    if (!assignments) return null;

    const variantAUsers = assignments.filter(a => a.variant === 'a');
    const variantBUsers = assignments.filter(a => a.variant === 'b');

    // Get conversions from analytics
    const { data: conversions } = await supabase
      .from('user_analytics')
      .select('*')
      .eq('event_type', 'ab_test_conversion')
      .contains('event_data', { testName: test.test_name });

    const variantAConversions = conversions?.filter(c => 
      variantAUsers.some(u => u.user_id === c.user_id) && 
      c.event_data.variant === 'a'
    ) || [];

    const variantBConversions = conversions?.filter(c => 
      variantBUsers.some(u => u.user_id === c.user_id) && 
      c.event_data.variant === 'b'
    ) || [];

    const variantARate = variantAUsers.length > 0 ? (variantAConversions.length / variantAUsers.length) * 100 : 0;
    const variantBRate = variantBUsers.length > 0 ? (variantBConversions.length / variantBUsers.length) * 100 : 0;

    // Calculate statistical significance
    const { winner, confidence } = this.calculateStatisticalSignificance(
      variantAUsers.length,
      variantAConversions.length,
      variantBUsers.length,
      variantBConversions.length
    );

    return {
      testId,
      testName: test.test_name,
      variantA: {
        users: variantAUsers.length,
        conversions: variantAConversions.length,
        conversionRate: variantARate
      },
      variantB: {
        users: variantBUsers.length,
        conversions: variantBConversions.length,
        conversionRate: variantBRate
      },
      winner,
      confidence
    };
  }

  private static calculateStatisticalSignificance(
    usersA: number,
    conversionsA: number,
    usersB: number,
    conversionsB: number
  ): { winner: 'a' | 'b' | 'tie'; confidence: number } {
    if (usersA === 0 || usersB === 0) {
      return { winner: 'tie', confidence: 0 };
    }

    const rateA = conversionsA / usersA;
    const rateB = conversionsB / usersB;

    // Simplified chi-square test
    const pooledRate = (conversionsA + conversionsB) / (usersA + usersB);
    const expectedA = usersA * pooledRate;
    const expectedB = usersB * pooledRate;

    if (expectedA < 5 || expectedB < 5) {
      return { winner: 'tie', confidence: 0 };
    }

    const chiSquare = 
      Math.pow(conversionsA - expectedA, 2) / expectedA +
      Math.pow(conversionsB - expectedB, 2) / expectedB;

    // Convert chi-square to confidence (simplified)
    const confidence = Math.min(95, Math.max(0, (chiSquare - 3.84) * 25));

    let winner: 'a' | 'b' | 'tie' = 'tie';
    if (confidence > 80) {
      winner = rateA > rateB ? 'a' : 'b';
    }

    return { winner, confidence };
  }

  static async stopTest(testId: string): Promise<void> {
    const { error } = await supabase
      .from('ab_tests')
      .update({ is_active: false })
      .eq('id', testId);

    if (error) {
      throw new Error(`Failed to stop A/B test: ${error.message}`);
    }
  }

  static async getActiveTests(): Promise<ABTest[]> {
    const { data, error } = await supabase
      .from('ab_tests')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch active tests: ${error.message}`);
    }

    return data?.map(test => ({
      id: test.id,
      testName: test.test_name,
      variantA: test.variant_a,
      variantB: test.variant_b,
      isActive: test.is_active,
      trafficSplit: test.traffic_split,
      createdAt: new Date(test.created_at)
    })) || [];
  }

  // Predefined tests for common UI elements
  static async initializeCommonTests(): Promise<void> {
    const commonTests = [
      {
        name: 'job_card_layout',
        variantA: { layout: 'vertical', showSalary: true },
        variantB: { layout: 'horizontal', showSalary: false }
      },
      {
        name: 'cta_button_color',
        variantA: { color: 'blue', text: 'Apply Now' },
        variantB: { color: 'green', text: 'Get Started' }
      },
      {
        name: 'search_suggestions',
        variantA: { showSuggestions: true, maxSuggestions: 5 },
        variantB: { showSuggestions: false, maxSuggestions: 0 }
      }
    ];

    for (const test of commonTests) {
      try {
        await this.createTest(test.name, test.variantA, test.variantB);
      } catch (error) {
        // Test might already exist
        console.log(`Test ${test.name} already exists or failed to create`);
      }
    }
  }
}


import { supabase } from '@/integrations/supabase/client';

export interface CompanyInsight {
  id: string;
  company_name: string;
  glassdoor_rating?: number;
  glassdoor_reviews: any[];
  salary_data: {
    averageSalary?: number;
    salaryRange?: { min: number; max: number };
    salaryByRole?: Record<string, { min: number; max: number }>;
  };
  culture_insights: {
    workLifeBalance?: number;
    cultureValues?: number;
    careerOpportunities?: number;
    compensation?: number;
    management?: number;
  };
  interview_experiences: Array<{
    difficulty: 'easy' | 'medium' | 'hard';
    experience: 'positive' | 'neutral' | 'negative';
    process: string;
    questions: string[];
    tips: string[];
  }>;
  last_updated: string;
  created_at: string;
}

interface GlassdoorData {
  rating: number;
  reviews: any[];
  salary: any;
  interviews: any[];
}

class CompanyInsightsService {
  async getCompanyInsights(companyName: string): Promise<CompanyInsight | null> {
    try {
      const { data, error } = await supabase
        .from('company_insights')
        .select('*')
        .eq('company_name', companyName)
        .maybeSingle();

      if (error) {
        console.error('Error fetching company insights:', error);
        return null;
      }

      if (!data) return null;

      // Convert the Supabase Json types to proper TypeScript types
      return {
        ...data,
        glassdoor_reviews: Array.isArray(data.glassdoor_reviews) ? data.glassdoor_reviews : [],
        salary_data: typeof data.salary_data === 'object' && data.salary_data !== null ? data.salary_data : {},
        culture_insights: typeof data.culture_insights === 'object' && data.culture_insights !== null ? data.culture_insights : {},
        interview_experiences: Array.isArray(data.interview_experiences) ? data.interview_experiences : []
      } as CompanyInsight;
    } catch (error) {
      console.error('Error in getCompanyInsights:', error);
      return null;
    }
  }

  async fetchAndStoreCompanyData(companyName: string): Promise<CompanyInsight | null> {
    try {
      // Check if we already have recent data (within 7 days)
      const existing = await this.getCompanyInsights(companyName);
      if (existing) {
        const lastUpdated = new Date(existing.last_updated);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        if (lastUpdated > weekAgo) {
          return existing;
        }
      }

      // For now, we'll create mock data since we don't have actual API integration
      const mockData = this.generateMockCompanyData(companyName);
      
      const { data, error } = await supabase
        .from('company_insights')
        .upsert({
          company_name: companyName,
          glassdoor_rating: mockData.glassdoor_rating,
          glassdoor_reviews: mockData.glassdoor_reviews,
          salary_data: mockData.salary_data,
          culture_insights: mockData.culture_insights,
          interview_experiences: mockData.interview_experiences,
          last_updated: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error storing company insights:', error);
        return null;
      }

      // Convert the returned data to proper types
      return {
        ...data,
        glassdoor_reviews: Array.isArray(data.glassdoor_reviews) ? data.glassdoor_reviews : [],
        salary_data: typeof data.salary_data === 'object' && data.salary_data !== null ? data.salary_data : {},
        culture_insights: typeof data.culture_insights === 'object' && data.culture_insights !== null ? data.culture_insights : {},
        interview_experiences: Array.isArray(data.interview_experiences) ? data.interview_experiences : []
      } as CompanyInsight;
    } catch (error) {
      console.error('Error in fetchAndStoreCompanyData:', error);
      return null;
    }
  }

  private generateMockCompanyData(companyName: string): Omit<CompanyInsight, 'id' | 'created_at' | 'last_updated'> {
    // Generate realistic mock data based on company name
    const rating = 3.5 + Math.random() * 1.5; // 3.5 to 5.0
    
    return {
      company_name: companyName,
      glassdoor_rating: Number(rating.toFixed(1)),
      glassdoor_reviews: [
        {
          rating: 4,
          title: "Great place to work",
          pros: "Good work-life balance, competitive salary, great benefits",
          cons: "Limited growth opportunities in some departments",
          jobTitle: "Software Engineer",
          date: "2024-01-15"
        },
        {
          rating: 5,
          title: "Amazing company culture",
          pros: "Innovative projects, supportive management, flexible schedule",
          cons: "Fast-paced environment might not suit everyone",
          jobTitle: "Product Manager",
          date: "2024-01-10"
        },
        {
          rating: 3,
          title: "Good for entry level",
          pros: "Learning opportunities, mentorship programs",
          cons: "Below market compensation, limited remote work",
          jobTitle: "Junior Developer",
          date: "2024-01-05"
        }
      ],
      salary_data: {
        averageSalary: 85000 + Math.random() * 40000,
        salaryRange: { min: 60000, max: 150000 },
        salaryByRole: {
          "Software Engineer": { min: 70000, max: 120000 },
          "Senior Software Engineer": { min: 90000, max: 150000 },
          "Product Manager": { min: 80000, max: 140000 },
          "Data Scientist": { min: 75000, max: 130000 }
        }
      },
      culture_insights: {
        workLifeBalance: 3.5 + Math.random() * 1.5,
        cultureValues: 3.8 + Math.random() * 1.2,
        careerOpportunities: 3.2 + Math.random() * 1.8,
        compensation: 3.6 + Math.random() * 1.4,
        management: 3.4 + Math.random() * 1.6
      },
      interview_experiences: [
        {
          difficulty: 'medium' as const,
          experience: 'positive' as const,
          process: "1. Phone screening 2. Technical interview 3. System design 4. Cultural fit",
          questions: [
            "Tell me about a challenging project you worked on",
            "How would you design a URL shortener?",
            "Why do you want to work at this company?"
          ],
          tips: [
            "Be prepared for coding questions in your preferred language",
            "Research the company's products and values",
            "Ask thoughtful questions about the team and role"
          ]
        },
        {
          difficulty: 'hard' as const,
          experience: 'neutral' as const,
          process: "Multiple rounds including peer interviews",
          questions: [
            "Design a distributed cache system",
            "Explain your approach to handling technical debt"
          ],
          tips: [
            "Practice system design problems",
            "Be ready to discuss trade-offs in your solutions"
          ]
        }
      ]
    };
  }

  async searchCompaniesByIndustry(industry: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('company_insights')
        .select('company_name')
        .limit(20);

      if (error) {
        console.error('Error searching companies:', error);
        return [];
      }

      return data.map(item => item.company_name);
    } catch (error) {
      console.error('Error in searchCompaniesByIndustry:', error);
      return [];
    }
  }

  async getTopRatedCompanies(limit: number = 10): Promise<CompanyInsight[]> {
    try {
      const { data, error } = await supabase
        .from('company_insights')
        .select('*')
        .order('glassdoor_rating', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching top rated companies:', error);
        return [];
      }

      // Convert all items to proper types
      return (data || []).map(item => ({
        ...item,
        glassdoor_reviews: Array.isArray(item.glassdoor_reviews) ? item.glassdoor_reviews : [],
        salary_data: typeof item.salary_data === 'object' && item.salary_data !== null ? item.salary_data : {},
        culture_insights: typeof item.culture_insights === 'object' && item.culture_insights !== null ? item.culture_insights : {},
        interview_experiences: Array.isArray(item.interview_experiences) ? item.interview_experiences : []
      })) as CompanyInsight[];
    } catch (error) {
      console.error('Error in getTopRatedCompanies:', error);
      return [];
    }
  }
}

export const companyInsightsService = new CompanyInsightsService();

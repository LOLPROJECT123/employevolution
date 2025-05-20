
import { toast } from "sonner";

interface ContactPerson {
  name: string;
  title: string;
  company: string;
  profileUrl: string;
  connectionDegree: number;
  isAlumni?: boolean;
  isRecruiter?: boolean;
  school?: string;
  commonConnections?: number;
}

export class LinkedInCrawlerService {
  private static instance: LinkedInCrawlerService;
  
  private constructor() {}
  
  static getInstance(): LinkedInCrawlerService {
    if (!LinkedInCrawlerService.instance) {
      LinkedInCrawlerService.instance = new LinkedInCrawlerService();
    }
    return LinkedInCrawlerService.instance;
  }
  
  /**
   * Find recruiters for a specific company
   */
  async findRecruiters(companyName: string): Promise<ContactPerson[]> {
    try {
      toast.loading(`Finding recruiters at ${companyName}...`);
      
      // Simulate API call to find recruiters
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock recruiter data
      const recruiters = this.generateMockRecruiters(companyName, 3);
      
      toast.success(`Found ${recruiters.length} recruiters at ${companyName}`);
      return recruiters;
    } catch (error) {
      console.error("Error finding recruiters:", error);
      toast.error("Failed to find recruiters. Please try again later.");
      return [];
    }
  }
  
  /**
   * Find alumni who work at a specific company
   */
  async findAlumni(companyName: string, userSchool: string): Promise<ContactPerson[]> {
    try {
      toast.loading(`Finding ${userSchool} alumni at ${companyName}...`);
      
      // Simulate API call to find alumni
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      // Generate mock alumni data
      const alumni = this.generateMockAlumni(companyName, userSchool, 4);
      
      toast.success(`Found ${alumni.length} alumni at ${companyName}`);
      return alumni;
    } catch (error) {
      console.error("Error finding alumni:", error);
      toast.error("Failed to find alumni. Please try again later.");
      return [];
    }
  }
  
  /**
   * Generate a template message for reaching out to a contact
   */
  generateOutreachMessage(contact: ContactPerson, jobTitle: string, isAlumniOutreach: boolean): string {
    if (isAlumniOutreach) {
      return `Hi ${contact.name},

I noticed that we both attended ${contact.school}. I'm interested in the ${jobTitle} role at ${contact.company} and saw that you work there. I'd love to learn more about your experience at the company and would appreciate any insights or advice you might have about the application process.

Would you be open to a quick chat about your experience?

Thank you for your time!`;
    } else {
      return `Hi ${contact.name},

I'm reaching out because I recently applied for the ${jobTitle} position at ${contact.company}. I'm very interested in this opportunity and believe that my background in [Your Relevant Skills/Experience] makes me a strong candidate.

I'd love to learn more about the role and the team. Would you be available for a brief conversation?

Thank you for your consideration!`;
    }
  }
  
  /**
   * Generate mock recruiters for demonstration
   */
  private generateMockRecruiters(companyName: string, count: number): ContactPerson[] {
    const titles = [
      "Technical Recruiter",
      "Talent Acquisition Specialist",
      "Senior Recruiter",
      "HR Manager",
      "Talent Acquisition Manager"
    ];
    
    return Array.from({ length: count }).map((_, i) => ({
      name: this.getRandomName(),
      title: titles[Math.floor(Math.random() * titles.length)],
      company: companyName,
      profileUrl: `https://linkedin.com/in/${this.generateRandomUsername()}`,
      connectionDegree: Math.floor(Math.random() * 2) + 2, // 2nd or 3rd degree connection
      isRecruiter: true,
      commonConnections: Math.floor(Math.random() * 10)
    }));
  }
  
  /**
   * Generate mock alumni for demonstration
   */
  private generateMockAlumni(companyName: string, school: string, count: number): ContactPerson[] {
    const titles = [
      "Software Engineer",
      "Data Scientist",
      "Product Manager",
      "Engineering Manager",
      "Technical Lead",
      "Frontend Engineer",
      "Backend Engineer"
    ];
    
    return Array.from({ length: count }).map((_, i) => ({
      name: this.getRandomName(),
      title: titles[Math.floor(Math.random() * titles.length)],
      company: companyName,
      profileUrl: `https://linkedin.com/in/${this.generateRandomUsername()}`,
      connectionDegree: Math.floor(Math.random() * 2) + 2, // 2nd or 3rd degree connection
      isAlumni: true,
      school,
      commonConnections: Math.floor(Math.random() * 8)
    }));
  }
  
  /**
   * Get a random name
   */
  private getRandomName(): string {
    const firstNames = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn", "Blake", "Dakota"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
    
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }
  
  /**
   * Generate a random username
   */
  private generateRandomUsername(): string {
    const adjectives = ["happy", "clever", "bright", "swift", "agile", "tech", "code", "data"];
    const nouns = ["dev", "engineer", "coder", "hacker", "wizard", "guru", "ninja", "pro"];
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000);
    
    return `${adjective}${noun}${number}`;
  }
}

// Export a singleton instance
export const linkedInCrawler = LinkedInCrawlerService.getInstance();


import { Job } from '@/types/job';
import { User } from '@/types/auth';

export class RecommendationGenerators {
  generateAdvancedReasoning(job: Job, userProfile: User, scores: any): string[] {
    const insights: string[] = [];
    
    if (scores.skillsMatch >= 80) {
      insights.push("🎯 Excellent skills alignment - you have most required technical capabilities");
    } else if (scores.skillsMatch >= 60) {
      insights.push("📚 Good skills foundation with learning opportunities for missing skills");
    } else {
      insights.push("🌱 Significant skill development required - consider if you're ready for this challenge");
    }
    
    if (scores.experienceMatch >= 90) {
      insights.push("💼 Perfect experience level match - you're ideally positioned for this role");
    } else if (scores.experienceMatch >= 70) {
      insights.push("📈 Good experience alignment with room for growth");
    }
    
    if (scores.careerGrowth >= 80) {
      insights.push("🚀 High career growth potential at this company");
    }
    
    if (scores.workLifeBalance >= 80) {
      insights.push("⚖️ Excellent work-life balance indicators");
    } else if (scores.workLifeBalance < 60) {
      insights.push("⚠️ Consider work-life balance implications");
    }
    
    if (job.remote && userProfile.profile?.preferences?.remote) {
      insights.push("🏠 Remote work preference perfectly aligned");
    }
    
    return insights;
  }

  generatePersonalizedRecommendations(job: Job, userProfile: User, overallScore: number): string[] {
    const recommendations: string[] = [];
    
    if (overallScore >= 85) {
      recommendations.push("🎯 Highly recommended - apply immediately");
      recommendations.push("💡 Tailor your application to highlight matching skills");
      recommendations.push("📞 Consider reaching out to employees on LinkedIn");
    } else if (overallScore >= 70) {
      recommendations.push("✅ Good opportunity - worth a customized application");
      recommendations.push("📝 Focus cover letter on transferable skills");
      recommendations.push("🔍 Research the company culture thoroughly");
    } else if (overallScore >= 50) {
      recommendations.push("🤔 Consider for skill development - may require preparation");
      recommendations.push("📚 Identify 2-3 key skills to develop before applying");
      recommendations.push("💬 Network with current employees to learn more");
    } else {
      recommendations.push("⏸️ Not the best fit currently - consider similar roles that better match your profile");
      recommendations.push("🎯 Use this as a reference for skill development goals");
    }
    
    return recommendations;
  }

  generateResumeOptimizations(job: Job, userProfile: User): string[] {
    const optimizations: string[] = [];
    
    const userSkills = userProfile.profile?.skills || [];
    const matchingSkills = job.skills.filter(skill => 
      userSkills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
    );
    
    if (matchingSkills.length > 0) {
      optimizations.push(`🔧 Emphasize these matching skills: ${matchingSkills.slice(0, 3).join(', ')}`);
    }
    
    const missingSkills = job.skills.filter(skill => 
      !userSkills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
    ).slice(0, 3);
    
    if (missingSkills.length > 0) {
      optimizations.push(`📈 Consider highlighting related experience for: ${missingSkills.join(', ')}`);
    }
    
    optimizations.push("🎯 Include quantifiable achievements relevant to this role");
    optimizations.push("📊 Add metrics that demonstrate impact in similar positions");
    
    if (job.level === 'senior' || job.level === 'lead') {
      optimizations.push("👥 Highlight leadership and mentoring experience");
    }
    
    return optimizations;
  }

  generateInterviewTips(job: Job, userProfile: User): string[] {
    const tips: string[] = [];
    
    tips.push(`🏢 Research ${job.company}'s recent news, products, and company culture`);
    tips.push("💡 Prepare STAR method examples for behavioral questions");
    
    if (job.level.includes('senior') || job.level.includes('lead')) {
      tips.push("👥 Prepare examples of leadership and team collaboration");
      tips.push("🎯 Be ready to discuss system design and architecture decisions");
    }
    
    if (job.skills.includes('Python') || job.skills.includes('JavaScript')) {
      tips.push("💻 Review coding fundamentals and be ready for technical questions");
      tips.push("🔍 Practice problem-solving with real-world scenarios");
    }
    
    tips.push("❓ Prepare thoughtful questions about team structure and growth opportunities");
    tips.push("🎨 Be ready to discuss how you'd approach challenges specific to this role");
    
    return tips;
  }

  generateWhyRecommended(job: Job, matchScore: any): string {
    if (matchScore.overallScore >= 85) {
      return `Excellent match! Your skills align perfectly with their requirements, and the role offers great growth potential at ${job.company}.`;
    } else if (matchScore.overallScore >= 70) {
      return `Strong opportunity! You have most required skills and this could be a great next step in your career.`;
    } else {
      return `Growth opportunity! While some skills need development, this role could help you advance your career.`;
    }
  }

  generateActionItems(job: Job, matchScore: any): string[] {
    const actions: string[] = [];
    
    if (matchScore.overallScore >= 80) {
      actions.push("Apply within 48 hours - you're a strong candidate");
      actions.push("Customize your resume for this specific role");
    } else {
      actions.push("Spend 2-3 days researching the company and role");
      actions.push("Identify and practice discussing transferable skills");
    }
    
    if (matchScore.skillsMatch < 70) {
      actions.push("Review job requirements and prepare to address skill gaps");
    }
    
    actions.push("Connect with current employees on LinkedIn");
    actions.push("Prepare for potential technical interview questions");
    
    return actions;
  }

  calculateApplicationDeadline(job: Job): string | undefined {
    const postedDate = new Date(job.postedAt);
    const now = new Date();
    const daysSincePosted = Math.floor((now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSincePosted > 30) {
      return "Apply soon - posting is over 30 days old";
    } else if (daysSincePosted > 14) {
      return "Apply within 1 week - posting is getting older";
    } else {
      return "Apply within 2 weeks - recent posting";
    }
  }
}

export const recommendationGenerators = new RecommendationGenerators();

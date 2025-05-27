
export class SkillsMatchingService {
  private skillRelations: Record<string, string[]> = {
    'react': ['javascript', 'typescript', 'jsx', 'frontend', 'web development'],
    'node.js': ['javascript', 'typescript', 'backend', 'express', 'api development'],
    'python': ['django', 'flask', 'data science', 'machine learning', 'automation'],
    'java': ['spring', 'backend', 'enterprise', 'microservices'],
    'aws': ['cloud', 'devops', 'docker', 'kubernetes', 'infrastructure'],
    'docker': ['containerization', 'devops', 'kubernetes', 'microservices'],
    'sql': ['database', 'postgresql', 'mysql', 'data analysis', 'rdbms'],
    'machine learning': ['python', 'tensorflow', 'pytorch', 'data science', 'ai'],
    'typescript': ['javascript', 'frontend', 'backend', 'web development'],
    'kubernetes': ['docker', 'devops', 'cloud', 'orchestration', 'containers']
  };

  private transferableSkills = [
    'problem solving', 'communication', 'teamwork', 'leadership',
    'project management', 'agile', 'scrum', 'git', 'testing'
  ];

  async calculateSkillsMatchAdvanced(jobSkills: string[], userSkills: string[]): Promise<number> {
    const normalizedJobSkills = jobSkills.map(s => s.toLowerCase());
    const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
    
    // Direct matches
    const directMatches = normalizedJobSkills.filter(skill => 
      normalizedUserSkills.includes(skill)
    );
    
    // Related skills using AI-like mapping
    const relatedMatches = this.findRelatedSkills(normalizedJobSkills, normalizedUserSkills);
    
    // Transferable skills
    const transferableMatches = this.findTransferableSkills(normalizedJobSkills, normalizedUserSkills);
    
    const totalRequired = normalizedJobSkills.length;
    const matchScore = totalRequired > 0 ? 
      ((directMatches.length * 1.0) + (relatedMatches * 0.7) + (transferableMatches * 0.4)) / totalRequired * 100 : 100;
    
    return Math.min(100, Math.round(matchScore));
  }

  private findRelatedSkills(jobSkills: string[], userSkills: string[]): number {
    let relatedCount = 0;
    for (const jobSkill of jobSkills) {
      const related = this.skillRelations[jobSkill] || [];
      if (related.some(rel => userSkills.includes(rel))) {
        relatedCount++;
      }
    }
    
    return relatedCount;
  }

  private findTransferableSkills(jobSkills: string[], userSkills: string[]): number {
    let transferableCount = 0;
    for (const jobSkill of jobSkills) {
      if (this.transferableSkills.includes(jobSkill) && userSkills.includes(jobSkill)) {
        transferableCount++;
      }
    }
    
    return transferableCount;
  }
}

export const skillsMatchingService = new SkillsMatchingService();

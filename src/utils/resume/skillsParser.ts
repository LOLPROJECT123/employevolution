
export const parseSkills = (text: string) => {
  const skillsSection = text.match(/SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES/i);
  
  if (skillsSection) {
    const sectionStart = text.indexOf(skillsSection[0]);
    const nextSection = text.slice(sectionStart + skillsSection[0].length).match(/EXPERIENCE|WORK EXPERIENCE|EDUCATION|PROJECTS|LANGUAGES|CERTIFICATIONS/i);
    const sectionEnd = nextSection ? text.indexOf(nextSection[0], sectionStart) : text.length;
    const skillsText = text.slice(sectionStart, sectionEnd).toLowerCase();

    const commonTechSkills = [
      "javascript", "python", "java", "c++", "react", "angular", "vue", "node.js", 
      "express", "django", "flask", "spring", "aws", "azure", "gcp", "docker", "kubernetes",
      "mongodb", "postgresql", "mysql", "redis", "typescript", "html", "css", "git", "cicd",
      "machine learning", "data science", "ai", "react native", "swift", "kotlin", "flutter"
    ];
    
    return commonTechSkills
      .filter(skill => skillsText.includes(skill.toLowerCase()))
      .map(skill => skill.charAt(0).toUpperCase() + skill.slice(1))
      .slice(0, 12);
  }
  
  return ["JavaScript", "React", "TypeScript", "Node.js"];
};

export const parseLanguages = (text: string) => {
  const languagesSection = text.match(/LANGUAGES|LANGUAGE PROFICIENCY/i);
  
  if (languagesSection) {
    const sectionStart = text.indexOf(languagesSection[0]);
    const nextSection = text.slice(sectionStart + languagesSection[0].length).match(/EXPERIENCE|WORK EXPERIENCE|EDUCATION|PROJECTS|SKILLS|CERTIFICATIONS/i);
    const sectionEnd = nextSection ? text.indexOf(nextSection[0], sectionStart) : text.length;
    const languagesText = text.slice(sectionStart, sectionEnd).toLowerCase();

    const commonLanguages = [
      "english", "spanish", "french", "german", "chinese", "mandarin", "cantonese", 
      "japanese", "korean", "russian", "arabic", "hindi", "portuguese", "italian"
    ];
    
    return commonLanguages
      .filter(language => languagesText.includes(language.toLowerCase()))
      .map(language => language.charAt(0).toUpperCase() + language.slice(1))
      .slice(0, 5);
  }
  
  return ["English"];
};

// Enhanced function to extract skills from job descriptions
export const extractSkillKeywords = (text: string) => {
  const techKeywords = [
    "javascript", "python", "java", "c++", "c#", "react", "angular", "vue", 
    "node.js", "express", "django", "flask", "spring", "asp.net", 
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins",
    "mongodb", "postgresql", "mysql", "sql", "oracle", "redis", "elasticsearch",
    "typescript", "html", "css", "sass", "less", "tailwind", "bootstrap",
    "git", "github", "gitlab", "bitbucket", "svn", "cicd", "ci/cd", 
    "machine learning", "ml", "data science", "ai", "artificial intelligence", 
    "react native", "flutter", "swift", "kotlin", "objective-c",
    "rest", "graphql", "soap", "microservices", "serverless", "lambda",
    "agile", "scrum", "kanban", "jira", "confluence", "tdd", "bdd",
    "webpack", "babel", "eslint", "jest", "cypress", "selenium", "mocha", "chai",
    "responsiveness", "mobile-friendly", "cross-browser", "accessibility", 
    "security", "oauth", "jwt", "authentication", "authorization",
    "linux", "unix", "bash", "powershell", "networking", "tcp/ip", "http", "https",
    "analytics", "marketing", "seo", "google analytics", "a/b testing"
  ];
  
  const extractedSkills = new Set<string>();
  const textLower = text.toLowerCase();
  
  techKeywords.forEach(keyword => {
    if (textLower.includes(keyword)) {
      // Format the keyword with proper capitalization
      let formattedKeyword = keyword;
      
      if (keyword === "aws") formattedKeyword = "AWS";
      else if (keyword === "azure") formattedKeyword = "Azure";
      else if (keyword === "gcp") formattedKeyword = "GCP";
      else if (keyword === "ci/cd" || keyword === "cicd") formattedKeyword = "CI/CD";
      else if (keyword === "html") formattedKeyword = "HTML";
      else if (keyword === "css") formattedKeyword = "CSS";
      else if (keyword === "ml") formattedKeyword = "ML";
      else if (keyword === "ai") formattedKeyword = "AI";
      else if (keyword === "asp.net") formattedKeyword = "ASP.NET";
      else {
        // Capitalize first letter of each word for others
        formattedKeyword = keyword
          .split(/[\s.-]+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        // Special case for Node.js, React Native etc.
        if (keyword.includes('.js')) {
          formattedKeyword = formattedKeyword.replace('Js', '.js');
        }
        if (keyword === "node.js") formattedKeyword = "Node.js";
      }
      
      extractedSkills.add(formattedKeyword);
    }
  });
  
  return Array.from(extractedSkills);
};

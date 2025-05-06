
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
      .slice(0, 7);
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
      .map(lang => lang.charAt(0).toUpperCase() + lang.slice(1));
  }
  
  return ["English"];
};

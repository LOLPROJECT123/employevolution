
export const parseWorkExperiences = (text: string) => {
  const workExperiences = [];
  const workSection = text.match(/EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|PROFESSIONAL EXPERIENCE/i);

  if (workSection) {
    const sectionStart = text.indexOf(workSection[0]);
    const nextSection = text.slice(sectionStart + workSection[0].length).match(/EDUCATION|PROJECTS|SKILLS|LANGUAGES|CERTIFICATIONS/i);
    const sectionEnd = nextSection ? text.indexOf(nextSection[0], sectionStart) : text.length;
    const workText = text.slice(sectionStart, sectionEnd);

    const workEntries = workText.split(/\n\s*\n/);

    for (let i = 1; i < workEntries.length; i++) {
      const entry = workEntries[i].trim();
      if (entry.length < 10) continue;
      
      const roleMatch = entry.match(/^(.*?)(?:at|@|\||-|–|,|\n)/i);
      const companyMatch = entry.match(/(?:at|@|\||-|–|,|\n)(.*?)(?:\||,|-|–|\n)/i);
      const dateMatch = entry.match(/(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b)\s*(?:to|-|–|—)\s*(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b|\bPresent\b)/i);
      
      const role = roleMatch ? roleMatch[1].trim() : "Role";
      const company = companyMatch ? companyMatch[1].trim() : "Company";
      const startDate = dateMatch ? dateMatch[1].trim() : "Jan 2020";
      const endDate = dateMatch && dateMatch[2] ? dateMatch[2].trim() : "Present";
      
      const description = entry
        .replace(/^.*\n/, '')
        .split(/[-•*]/)
        .map(item => item.trim())
        .filter(item => item.length > 10);
      
      workExperiences.push({
        role,
        company,
        location: "Location",
        startDate,
        endDate,
        description: description.length > 0 ? description : ["Responsibilities and achievements"]
      });
    }
  }

  return workExperiences.length > 0 ? workExperiences : [{
    role: "Software Engineer",
    company: "Example Company",
    location: "City, State",
    startDate: "Jan 2022",
    endDate: "Present",
    description: ["Extracted from resume. Please edit details as needed."]
  }];
};

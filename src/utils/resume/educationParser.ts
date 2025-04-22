
export const parseEducation = (text: string) => {
  const education = [];
  const eduSection = text.match(/EDUCATION|ACADEMIC|EDUCATIONAL BACKGROUND/i);

  if (eduSection) {
    const sectionStart = text.indexOf(eduSection[0]);
    const nextSection = text.slice(sectionStart + eduSection[0].length).match(/EXPERIENCE|WORK EXPERIENCE|PROJECTS|SKILLS|LANGUAGES|CERTIFICATIONS/i);
    const sectionEnd = nextSection ? text.indexOf(nextSection[0], sectionStart) : text.length;
    const eduText = text.slice(sectionStart, sectionEnd);

    const eduEntries = eduText.split(/\n\s*\n/);

    for (let i = 1; i < eduEntries.length; i++) {
      const entry = eduEntries[i].trim();
      if (entry.length < 10) continue;
      
      const schoolMatch = entry.match(/^(.*?)(?:,|-|–|\n)/i);
      const degreeMatch = entry.match(/(?:Bachelor|Master|Ph\.D|B\.S\.|M\.S\.|B\.A\.|M\.A\.|MBA|MD|JD).*?(?:in|of).*?(?:,|-|–|\n)/i);
      const dateMatch = entry.match(/(\d{4})\s*(?:-|–|—|to)\s*(\d{4}|Present)/i);
      
      const school = schoolMatch ? schoolMatch[1].trim() : "University";
      const degree = degreeMatch ? degreeMatch[0].replace(/,|-|–|\n/g, '').trim() : "Degree";
      const startDate = dateMatch ? dateMatch[1].trim() : "2020";
      const endDate = dateMatch && dateMatch[2] ? dateMatch[2].trim() : "2024";
      
      education.push({
        school,
        degree,
        startDate: `${startDate}`,
        endDate: `${endDate}`
      });
    }
  }

  return education.length > 0 ? education : [{
    school: "University Name",
    degree: "Degree in Field",
    startDate: "2020",
    endDate: "2024"
  }];
};

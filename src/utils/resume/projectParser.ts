
export const parseProjects = (text: string) => {
  const projects = [];
  const projectSection = text.match(/PROJECTS|PERSONAL PROJECTS|ACADEMIC PROJECTS/i);

  if (projectSection) {
    const sectionStart = text.indexOf(projectSection[0]);
    const nextSection = text.slice(sectionStart + projectSection[0].length).match(/EXPERIENCE|WORK EXPERIENCE|EDUCATION|SKILLS|LANGUAGES|CERTIFICATIONS/i);
    const sectionEnd = nextSection ? text.indexOf(nextSection[0], sectionStart) : text.length;
    const projectText = text.slice(sectionStart, sectionEnd);

    const projectEntries = projectText.split(/\n\s*\n/);

    for (let i = 1; i < projectEntries.length; i++) {
      const entry = projectEntries[i].trim();
      if (entry.length < 10) continue;
      
      const nameMatch = entry.match(/^(.*?)(?:,|-|–|\n)/i);
      const dateMatch = entry.match(/(\d{4})\s*(?:-|–|—|to)\s*(\d{4}|Present)/i);
      
      const name = nameMatch ? nameMatch[1].trim() : "Project Name";
      const startDate = dateMatch ? dateMatch[1].trim() : "2023";
      const endDate = dateMatch && dateMatch[2] ? dateMatch[2].trim() : "Present";
      
      const description = entry
        .replace(/^.*\n/, '')
        .split(/[-•*]/)
        .map(item => item.trim())
        .filter(item => item.length > 5);
      
      projects.push({
        name,
        startDate,
        endDate,
        description: description.length > 0 ? description : ["Project description. Please edit as needed."]
      });
    }
  }

  return projects.length > 0 ? projects : [{
    name: "Project Name",
    startDate: "2023",
    endDate: "Present",
    description: ["Project description extracted from resume. Please edit as needed."]
  }];
};


import React, { useState } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs, { TabPanel } from "@/components/profile/ProfileTabs";
import ResumeSection from "@/components/profile/ResumeSection";
import WorkExperienceSection from "@/components/profile/WorkExperienceSection";
import EducationSection from "@/components/profile/EducationSection";
import ProjectsSection from "@/components/profile/ProjectsSection";
import SocialLinksSection from "@/components/profile/SocialLinksSection";
import JobPreferencesSection from "@/components/profile/JobPreferencesSection";
import EqualEmploymentSection from "@/components/profile/EqualEmploymentSection";
import SettingsSection from "@/components/profile/SettingsSection";
import SkillsSection from "@/components/profile/SkillsSection";
import LanguagesSection from "@/components/profile/LanguagesSection";

// Mock data - in a real app, this would come from your backend or state management
const Profile = () => {
  // User profile data
  const [userData, setUserData] = useState({
    name: "John Smith",
    jobStatus: "Actively looking",
    profileStrength: 65,
  });

  // Work experiences
  const [experiences, setExperiences] = useState([
    {
      id: 1,
      role: "Software Engineer Intern/ Co-Lead",
      company: "DIRAC",
      location: "New York, NY, USA",
      startDate: "Oct 2024",
      endDate: "Dec 2024",
      description: [
        "Creating a solution to simulate and calculate the optimal path for installing and removing the wire and the installation and removal of a flexible wire from an electrical cabinet",
        "Using the A* algorithm, PythonOCC, Blender, FreeCAD, CAD, and an RL model to help take into account real-world constraints like collisions with other components and bending behavior of the flexible material and showing the output in animation",
        "The future purpose is to use the script we developed in robots to help build the electrical aspects of houses"
      ],
    },
    {
      id: 2,
      role: "AI Fellowship",
      company: "Headstarter AI",
      location: "Remote",
      startDate: "Jul 2024",
      endDate: "Sep 2024",
      description: [
        "Personal Portfolio (HTML/CSS): Used to showcase individual talents, skills and experience",
        "Pantry Tracker (Next.js, Material UI, React, GCP, Vercel, CI/CD, and Firebase): Built inventory management system with next.js, react, and Firebase, enabling real-time tracking of 1000+ products across 5 warehouses, increasing efficiency by 30%"
      ],
    },
  ]);

  // Educations
  const [educations, setEducations] = useState([
    {
      id: 1,
      school: "Georgia Institute of Technology",
      degree: "Bachelor's",
      field: "Computer Science",
      startDate: "Aug 2023",
      endDate: "May 2027",
    },
  ]);

  // Projects
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "AI Malware and Virus Reader For Emails",
      startDate: "May 2024",
      endDate: "May 2024",
      description: [
        "Serves as a tool to ensure your emails are not corrupting the user's device",
        "It uses Python, a Gmail import tool, and an IMAP port to take emails and scan them for malware and viruses"
      ],
    },
    {
      id: 2,
      name: "Trading Algorithm",
      startDate: "Dec 2024",
      endDate: "Present",
      description: [
        "Serves as a tool to help study trends of the stock markets and company and world issues and success and their impacts on stocks to make trading more predictable and help with better trade outcomes"
      ],
    },
  ]);

  // Social links
  const [socialLinks, setSocialLinks] = useState({
    linkedin: "https://www.linkedin.com/in/varun-veluri-6698a628a/",
    github: "",
    portfolio: "",
    other: "",
  });

  // Job preferences
  const [jobPreferences, setJobPreferences] = useState({
    desiredRoles: ["Software Engineer", "Full Stack Developer", "Data Scientist"],
    experienceLevel: "Entry",
    industries: ["Technology", "Finance", "Healthcare"],
    companySize: ["Startup", "Mid-size"],
    salary: "USD 80,000 - 120,000 per yearly",
    benefits: ["Health Insurance", "401k", "Remote Work", "Professional Development"],
    locations: ["New York, NY", "San Francisco, CA", "Remote"],
    workModel: "Hybrid",
    jobTypes: ["Full-time", "Internship", "Contract"],
    skills: ["JavaScript", "React", "Node.js", "Python", "SQL"],
  });

  // Equal employment data
  const [equalEmploymentData, setEqualEmploymentData] = useState({
    ethnicity: "Southeast Asian",
    workAuthUS: true,
    workAuthCanada: false,
    workAuthUK: false,
    needsSponsorship: false,
    gender: "Male",
    lgbtq: "Not specified",
    disability: "Not specified",
    veteran: "Not specified",
  });

  // Email preferences
  const [emailPreferences, setEmailPreferences] = useState({
    jobAlerts: true,
    newsletters: false,
    accountUpdates: true,
  });

  // Skills and languages
  const [skills, setSkills] = useState(["React", "TypeScript", "JavaScript", "Node.js", "Python"]);
  const [languages, setLanguages] = useState(["English", "Spanish", "Hindi"]);

  // Resume handlers
  const handleResumeUpload = (file: File) => {
    console.log("Uploaded resume:", file.name);
    // In a real app, you would upload the file to your backend
  };

  // Work experience handlers
  const handleAddExperience = (experience: any) => {
    setExperiences([...experiences, experience]);
  };

  const handleEditExperience = (updatedExperience: any) => {
    setExperiences(
      experiences.map((exp) =>
        exp.id === updatedExperience.id ? updatedExperience : exp
      )
    );
  };

  const handleDeleteExperience = (id: number) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };

  // Education handlers
  const handleAddEducation = (education: any) => {
    setEducations([...educations, education]);
  };

  const handleEditEducation = (updatedEducation: any) => {
    setEducations(
      educations.map((edu) =>
        edu.id === updatedEducation.id ? updatedEducation : edu
      )
    );
  };

  const handleDeleteEducation = (id: number) => {
    setEducations(educations.filter((edu) => edu.id !== id));
  };

  // Project handlers
  const handleAddProject = (project: any) => {
    setProjects([...projects, project]);
  };

  const handleEditProject = (updatedProject: any) => {
    setProjects(
      projects.map((proj) =>
        proj.id === updatedProject.id ? updatedProject : proj
      )
    );
  };

  const handleDeleteProject = (id: number) => {
    setProjects(projects.filter((proj) => proj.id !== id));
  };

  // Settings handlers
  const handleUpdateEmail = async (newEmail: string, password: string) => {
    console.log("Updating email:", newEmail);
    // In a real app, you would call your backend API
  };

  const handleUpdatePassword = async (currentPassword: string, newPassword: string) => {
    console.log("Updating password");
    // In a real app, you would call your backend API
  };

  // Skills and languages handlers
  const handleAddSkill = (skill: string) => {
    setSkills([...skills, skill]);
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleAddLanguage = (language: string) => {
    setLanguages([...languages, language]);
  };

  const handleRemoveLanguage = (language: string) => {
    setLanguages(languages.filter((l) => l !== language));
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <ProfileHeader
        name={userData.name}
        jobStatus={userData.jobStatus}
        profileStrength={userData.profileStrength}
        onProfileUpdate={(data) => setUserData({ ...userData, ...data })}
      />

      <div className="mt-8">
        <ProfileTabs defaultTab="resume">
          <TabPanel value="contact">
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SocialLinksSection
                  socialLinks={socialLinks}
                  onUpdateSocialLinks={setSocialLinks}
                />
                <div className="space-y-8">
                  <SkillsSection
                    skills={skills}
                    onAddSkill={handleAddSkill}
                    onRemoveSkill={handleRemoveSkill}
                  />
                  <LanguagesSection
                    languages={languages}
                    onAddLanguage={handleAddLanguage}
                    onRemoveLanguage={handleRemoveLanguage}
                  />
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="resume">
            <div className="space-y-8">
              <ResumeSection onResumeUpload={handleResumeUpload} />
              <WorkExperienceSection
                experiences={experiences}
                onAddExperience={handleAddExperience}
                onEditExperience={handleEditExperience}
                onDeleteExperience={handleDeleteExperience}
              />
              <EducationSection
                educations={educations}
                onAddEducation={handleAddEducation}
                onEditEducation={handleEditEducation}
                onDeleteEducation={handleDeleteEducation}
              />
              <ProjectsSection
                projects={projects}
                onAddProject={handleAddProject}
                onEditProject={handleEditProject}
                onDeleteProject={handleDeleteProject}
              />
            </div>
          </TabPanel>

          <TabPanel value="job-preferences">
            <JobPreferencesSection
              preferences={jobPreferences}
              onEdit={() => console.log("Edit job preferences")}
            />
          </TabPanel>

          <TabPanel value="equal-employment">
            <EqualEmploymentSection
              data={equalEmploymentData}
              onUpdate={setEqualEmploymentData}
            />
          </TabPanel>

          <TabPanel value="settings">
            <SettingsSection
              email="vveluri6@gmail.com"
              emailPreferences={emailPreferences}
              onUpdateEmail={handleUpdateEmail}
              onUpdatePassword={handleUpdatePassword}
              onUpdateEmailPreferences={setEmailPreferences}
            />
          </TabPanel>
        </ProfileTabs>
      </div>
    </div>
  );
};

export default Profile;

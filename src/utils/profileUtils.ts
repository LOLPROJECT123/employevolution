
/**
 * Utilities for working with user profiles and resume data
 */

// Simple mock profile for development purposes
export const getUserProfile = () => {
  return {
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.johnson@example.com',
    phone: '555-123-4567',
    location: 'San Francisco, CA',
    title: 'Frontend Developer',
    summary: 'Passionate frontend developer with experience in React, TypeScript, and modern web development.',
    skills: [
      'JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Node.js',
      'GraphQL', 'Git', 'Responsive Design', 'UI/UX', 'Redux', 'Jest'
    ],
    experience: [
      {
        title: 'Frontend Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        startDate: '2021-05',
        endDate: '2023-03',
        current: false,
        description: 'Developed responsive web applications using React and TypeScript.'
      },
      {
        title: 'Junior Web Developer',
        company: 'WebSolutions LLC',
        location: 'Oakland, CA',
        startDate: '2019-08',
        endDate: '',
        current: true,
        description: 'Built and maintained client websites using modern web technologies.'
      }
    ],
    education: [
      {
        school: 'University of California, Berkeley',
        degree: 'Bachelor of Science in Computer Science',
        fieldOfStudy: 'Computer Science',
        startDate: '2015-09',
        endDate: '2019-05'
      }
    ]
  };
};

/**
 * Convert our user profile format to ParsedResume format for job matching
 */
export const convertProfileToResumeFormat = (profile: any) => {
  return {
    personalInfo: {
      name: `${profile.firstName} ${profile.lastName}`,
      email: profile.email,
      phone: profile.phone,
      location: profile.location
    },
    workExperiences: profile.experience?.map((exp: any) => ({
      role: exp.title,
      company: exp.company,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.current ? 'present' : (exp.endDate || ''),
      description: [exp.description]
    })) || [],
    education: profile.education?.map((edu: any) => ({
      school: edu.school,
      degree: edu.degree,
      startDate: edu.startDate,
      endDate: edu.endDate
    })) || [],
    projects: [],
    skills: profile.skills || [],
    languages: [],
    socialLinks: {
      linkedin: '',
      github: '',
      portfolio: '',
      other: ''
    }
  };
};

/**
 * Get the parsed resume format from the user's profile
 */
export const getParsedResumeFromProfile = () => {
  const profile = getUserProfile();
  return convertProfileToResumeFormat(profile);
};


import { Job } from "@/types/job";

export const mockJobs: Job[] = [
  {
    id: "job1",
    title: "Senior React Developer",
    company: "TechCorp",
    location: "San Francisco, CA",
    salary: {
      min: 120000,
      max: 160000,
      currency: "USD"
    },
    type: "full-time",
    level: "senior",
    description: "We are looking for an experienced React developer to join our team and help build our next-generation web application. The ideal candidate has extensive experience with React, Redux, and TypeScript.",
    requirements: [
      "5+ years of frontend development experience",
      "3+ years of React experience",
      "Experience with state management solutions like Redux",
      "Strong TypeScript skills",
      "Experience with modern build tools like Webpack or Vite"
    ],
    postedAt: "2 days ago",
    skills: ["React", "Redux", "TypeScript", "JavaScript", "HTML", "CSS", "Git", "REST API"],
    remote: false
  },
  {
    id: "job2",
    title: "Full Stack Engineer",
    company: "StartupX",
    location: "Remote",
    salary: {
      min: 100000,
      max: 140000,
      currency: "USD"
    },
    type: "full-time",
    level: "mid",
    description: "Join our growing team as a Full Stack Engineer and help us build innovative solutions. You'll work with React on the frontend and Node.js on the backend.",
    requirements: [
      "3+ years of full stack development experience",
      "Experience with React and Node.js",
      "Knowledge of SQL and NoSQL databases",
      "Strong communication skills",
      "Ability to work independently in a remote environment"
    ],
    postedAt: "1 week ago",
    skills: ["React", "Node.js", "JavaScript", "MongoDB", "PostgreSQL", "Express", "Git", "Docker"],
    remote: true
  },
  {
    id: "job3",
    title: "Frontend Engineer",
    company: "BigTech Inc",
    location: "Seattle, WA",
    salary: {
      min: 110000,
      max: 150000,
      currency: "USD"
    },
    type: "full-time",
    level: "mid",
    description: "We're seeking a Frontend Engineer to join our team and help build user interfaces for our enterprise products. The ideal candidate has a strong foundation in JavaScript and experience with modern frontend frameworks.",
    requirements: [
      "3+ years of frontend development experience",
      "Strong JavaScript skills",
      "Experience with React, Vue, or Angular",
      "Understanding of responsive design principles",
      "Experience with REST APIs"
    ],
    postedAt: "3 days ago",
    skills: ["JavaScript", "React", "HTML", "CSS", "REST API", "Git", "Webpack"],
    remote: false
  },
  {
    id: "job4",
    title: "Senior Backend Developer",
    company: "DataSys",
    location: "New York, NY",
    salary: {
      min: 130000,
      max: 170000,
      currency: "USD"
    },
    type: "full-time",
    level: "senior",
    description: "Join our backend team to design and implement scalable APIs and services. You'll work with Node.js, Express, and various databases.",
    requirements: [
      "5+ years of backend development experience",
      "Strong knowledge of Node.js and Express",
      "Experience with SQL and NoSQL databases",
      "Understanding of API design principles",
      "Experience with cloud platforms (AWS, GCP, or Azure)"
    ],
    postedAt: "1 week ago",
    skills: ["Node.js", "Express", "MongoDB", "PostgreSQL", "Docker", "AWS", "REST API", "GraphQL"],
    remote: false
  },
  {
    id: "job5",
    title: "DevOps Engineer",
    company: "CloudTech",
    location: "Remote",
    salary: {
      min: 120000,
      max: 160000,
      currency: "USD"
    },
    type: "full-time",
    level: "mid",
    description: "We're looking for a DevOps Engineer to help build and maintain our cloud infrastructure. The ideal candidate has experience with AWS, Docker, and CI/CD pipelines.",
    requirements: [
      "3+ years of DevOps or SRE experience",
      "Experience with AWS or other cloud providers",
      "Knowledge of Docker and Kubernetes",
      "Experience with CI/CD tools",
      "Scripting skills in Python, Bash, or similar"
    ],
    postedAt: "5 days ago",
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Python", "Bash", "Linux"],
    remote: true
  },
  {
    id: "job6",
    title: "UI/UX Designer",
    company: "DesignStudio",
    location: "Los Angeles, CA",
    salary: {
      min: 90000,
      max: 130000,
      currency: "USD"
    },
    type: "full-time",
    level: "mid",
    description: "Join our design team to create beautiful, intuitive user interfaces for web and mobile applications. The ideal candidate has a strong portfolio showcasing UX research and UI design skills.",
    requirements: [
      "3+ years of UI/UX design experience",
      "Proficiency with design tools like Figma or Sketch",
      "Experience with user research and usability testing",
      "Understanding of design systems",
      "Ability to collaborate with developers"
    ],
    postedAt: "2 weeks ago",
    skills: ["UI Design", "UX Design", "Figma", "Sketch", "Wireframing", "Prototyping", "User Research"],
    remote: false
  },
  {
    id: "job7",
    title: "Data Scientist",
    company: "AI Solutions",
    location: "Remote",
    salary: {
      min: 110000,
      max: 150000,
      currency: "USD"
    },
    type: "full-time",
    level: "mid",
    description: "Join our data science team to build machine learning models and extract insights from large datasets. The ideal candidate has experience with Python, data analysis, and machine learning.",
    requirements: [
      "3+ years of data science experience",
      "Strong Python skills",
      "Experience with ML frameworks like TensorFlow or PyTorch",
      "Knowledge of data visualization techniques",
      "Experience with SQL and data processing"
    ],
    postedAt: "1 week ago",
    skills: ["Python", "Machine Learning", "TensorFlow", "PyTorch", "SQL", "Data Visualization", "Statistics"],
    remote: true
  },
  {
    id: "job8",
    title: "Technical Project Manager",
    company: "SoftSolutions",
    location: "Chicago, IL",
    salary: {
      min: 100000,
      max: 140000,
      currency: "USD"
    },
    type: "full-time",
    level: "mid",
    description: "We're seeking a Technical Project Manager to oversee software development projects from conception to deployment. The ideal candidate has both technical knowledge and project management skills.",
    requirements: [
      "3+ years of project management experience in software development",
      "Understanding of software development methodologies",
      "Experience with project management tools",
      "Strong communication and leadership skills",
      "Technical background preferred"
    ],
    postedAt: "3 days ago",
    skills: ["Project Management", "Agile", "Scrum", "JIRA", "Confluence", "Software Development", "Stakeholder Management"],
    remote: false
  },
  {
    id: "job9",
    title: "Machine Learning Engineer",
    company: "AI Research Labs",
    location: "Boston, MA",
    salary: {
      min: 130000,
      max: 180000,
      currency: "USD"
    },
    type: "full-time",
    level: "senior",
    description: "Join our research team to develop cutting-edge machine learning models. The ideal candidate has strong ML expertise and experience implementing algorithms at scale.",
    requirements: [
      "5+ years of experience in machine learning",
      "Strong background in mathematics and statistics",
      "Experience with ML frameworks like TensorFlow or PyTorch",
      "Knowledge of deep learning techniques",
      "Experience deploying ML models to production"
    ],
    postedAt: "2 weeks ago",
    skills: ["Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Python", "Mathematics", "Statistics"],
    remote: false
  },
  {
    id: "job10",
    title: "Security Engineer",
    company: "SecureTech",
    location: "Remote",
    salary: {
      min: 120000,
      max: 160000,
      currency: "USD"
    },
    type: "full-time",
    level: "senior",
    description: "We're looking for a Security Engineer to help secure our systems and applications. The ideal candidate has experience with network security, penetration testing, and security best practices.",
    requirements: [
      "5+ years of information security experience",
      "Experience with vulnerability assessment and penetration testing",
      "Knowledge of security frameworks like NIST or ISO 27001",
      "Understanding of web application security",
      "Experience with security tools and monitoring systems"
    ],
    postedAt: "1 week ago",
    skills: ["Cybersecurity", "Penetration Testing", "Network Security", "OWASP", "Security Auditing", "Python", "Linux"],
    remote: true
  }
];

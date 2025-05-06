
/**
 * Mock data for job scraper demonstration
 */
import { ScrapedJobListing, JobSource } from "./types";

/**
 * Generate mock scraped job listings
 */
export const mockScrapedJobs: ScrapedJobListing[] = [
  {
    title: "Senior Frontend Developer",
    company: "TechCorp",
    location: "San Francisco, CA",
    salary: "$120K - $150K/year",
    datePosted: "2 days ago",
    jobUrl: "https://example.com/jobs/123",
    description: "We're looking for a senior frontend developer with experience in React, TypeScript, and modern web development practices.",
    requirements: [
      "5+ years of experience with JavaScript and frontend frameworks",
      "Strong knowledge of React, Redux, and TypeScript",
      "Experience with responsive design and cross-browser compatibility",
      "Bachelor's degree in Computer Science or related field"
    ],
    benefits: [
      "Competitive salary and equity package",
      "Flexible remote work policy",
      "Health, dental, and vision insurance",
      "401(k) matching"
    ],
    skills: ["React", "TypeScript", "JavaScript", "Redux", "CSS", "HTML", "Webpack", "Git"],
    source: "LinkedIn",
    sourceId: "12345",
    isPremium: false,
    hasEasyApply: true
  },
  {
    title: "Full Stack Engineer",
    company: "StartupInc",
    location: "Remote",
    salary: "$100K - $130K/year",
    datePosted: "5 days ago",
    jobUrl: "https://example.com/jobs/456",
    description: "Join our growing team as a Full Stack Engineer working on our cutting-edge SaaS platform.",
    requirements: [
      "3+ years of full stack development experience",
      "Proficiency in JavaScript/TypeScript, Node.js, and React",
      "Experience with SQL and NoSQL databases",
      "Understanding of CI/CD pipelines and cloud services"
    ],
    benefits: [
      "Remote-first company",
      "Competitive compensation",
      "Unlimited PTO",
      "Professional development budget"
    ],
    skills: ["JavaScript", "TypeScript", "Node.js", "React", "MongoDB", "PostgreSQL", "AWS", "Docker"],
    source: "Indeed",
    sourceId: "67890",
    isPremium: false,
    hasEasyApply: true
  },
  {
    title: "Backend Engineer (Python)",
    company: "DataSystems",
    location: "Seattle, WA (Hybrid)",
    salary: "$130K - $160K/year",
    datePosted: "1 day ago",
    jobUrl: "https://example.com/jobs/789",
    description: "We're seeking a skilled Backend Engineer with expertise in Python to join our data processing team.",
    requirements: [
      "4+ years of experience with Python development",
      "Experience with data processing and ETL pipelines",
      "Knowledge of SQL databases and schema design",
      "Familiarity with cloud platforms (AWS/GCP/Azure)"
    ],
    skills: ["Python", "Django", "FastAPI", "PostgreSQL", "AWS", "Docker", "Kubernetes", "Redis"],
    source: "Glassdoor",
    sourceId: "54321",
    isPremium: true,
    hasEasyApply: false
  },
  {
    title: "DevOps Engineer",
    company: "CloudTech",
    location: "Remote (US)",
    salary: "$110K - $140K/year",
    datePosted: "3 days ago",
    jobUrl: "https://example.com/jobs/101112",
    description: "Help us build and maintain our cloud infrastructure and CI/CD pipelines.",
    requirements: [
      "3+ years in DevOps or Site Reliability Engineering",
      "Experience with AWS or other cloud platforms",
      "Knowledge of containerization and orchestration (Docker, Kubernetes)",
      "Experience with Infrastructure as Code (Terraform, CloudFormation)"
    ],
    skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux", "Monitoring", "Bash/Python scripting"],
    source: "LinkedIn",
    sourceId: "131415",
    isPremium: false,
    hasEasyApply: true
  },
  {
    title: "UI/UX Designer",
    company: "CreativeStudio",
    location: "Austin, TX",
    salary: "$90K - $120K/year",
    datePosted: "1 week ago",
    jobUrl: "https://example.com/jobs/161718",
    description: "Join our design team to create beautiful, user-friendly interfaces for our clients' web and mobile applications.",
    requirements: [
      "3+ years of UI/UX design experience",
      "Proficiency with design tools (Figma, Sketch)",
      "Understanding of user-centered design principles",
      "Portfolio demonstrating previous work"
    ],
    skills: ["UI Design", "UX Design", "Figma", "Sketch", "User Testing", "Wireframing", "Prototyping"],
    source: "Indeed",
    sourceId: "192021",
    isPremium: false,
    hasEasyApply: false
  },
  {
    title: "Machine Learning Engineer",
    company: "AILabs",
    location: "Remote",
    salary: "$140K - $180K/year",
    datePosted: "4 days ago",
    jobUrl: "https://example.com/jobs/222324",
    description: "Work on cutting-edge machine learning models for our AI-powered platform.",
    requirements: [
      "Master's or PhD in Computer Science, Machine Learning, or related field",
      "Experience with ML frameworks (TensorFlow, PyTorch)",
      "Strong programming skills in Python",
      "Knowledge of data processing and feature engineering"
    ],
    skills: ["Python", "TensorFlow", "PyTorch", "Machine Learning", "NLP", "Computer Vision", "Data Science"],
    source: "AngelList",
    sourceId: "252627",
    isPremium: true,
    hasEasyApply: true
  },
  {
    title: "Product Manager",
    company: "ProductCo",
    location: "New York, NY (Hybrid)",
    salary: "$120K - $150K/year",
    datePosted: "6 days ago",
    jobUrl: "https://example.com/jobs/282930",
    description: "Lead product development for our flagship SaaS platform, working with cross-functional teams to deliver new features.",
    requirements: [
      "5+ years of product management experience",
      "Experience with agile methodologies",
      "Strong communication and leadership skills",
      "Technical background or ability to communicate with technical teams"
    ],
    skills: ["Product Management", "Agile", "Roadmapping", "User Stories", "Market Research", "Data Analysis"],
    source: "LinkedIn",
    sourceId: "313233",
    isPremium: false,
    hasEasyApply: true
  },
  {
    title: "Data Scientist",
    company: "DataInsights",
    location: "Boston, MA",
    salary: "$110K - $140K/year",
    datePosted: "2 days ago",
    jobUrl: "https://example.com/jobs/343536",
    description: "Apply statistical and machine learning techniques to extract insights from large datasets.",
    requirements: [
      "Master's or PhD in Statistics, Computer Science, or related field",
      "Experience with statistical analysis and machine learning",
      "Proficiency in Python or R for data analysis",
      "Knowledge of SQL and data visualization tools"
    ],
    skills: ["Python", "R", "SQL", "Machine Learning", "Statistics", "Data Visualization", "Pandas", "Scikit-learn"],
    source: "Glassdoor",
    sourceId: "373839",
    isPremium: false,
    hasEasyApply: false
  },
  {
    title: "Mobile Developer (iOS)",
    company: "AppWorks",
    location: "Remote (US)",
    salary: "$100K - $130K/year",
    datePosted: "3 days ago",
    jobUrl: "https://example.com/jobs/404142",
    description: "Create beautiful, performant iOS applications for our clients in various industries.",
    requirements: [
      "3+ years of iOS development experience",
      "Proficiency in Swift and UIKit",
      "Understanding of iOS design principles and guidelines",
      "Experience with RESTful APIs and JSON"
    ],
    skills: ["Swift", "iOS", "UIKit", "SwiftUI", "Xcode", "CocoaPods", "Core Data", "Git"],
    source: "Indeed",
    sourceId: "434445",
    isPremium: false,
    hasEasyApply: true
  },
  {
    title: "Technical Project Manager",
    company: "SoftSolutions",
    location: "Chicago, IL",
    salary: "$100K - $130K/year",
    datePosted: "5 days ago",
    jobUrl: "https://example.com/jobs/464748",
    description: "Lead technical projects from conception to completion, coordinating with development teams and stakeholders.",
    requirements: [
      "5+ years of project management experience in software development",
      "PMP certification or equivalent",
      "Strong understanding of software development lifecycle",
      "Excellent communication and leadership skills"
    ],
    skills: ["Project Management", "Agile", "Scrum", "JIRA", "Confluence", "Risk Management", "Budgeting"],
    source: "LinkedIn",
    sourceId: "495051",
    isPremium: true,
    hasEasyApply: false
  }
];

// Generate more mock jobs to have a decent sample
const extraMockJobs: ScrapedJobListing[] = Array.from({ length: 15 }, (_, i) => {
  const sources: JobSource[] = ['LinkedIn', 'Indeed', 'Glassdoor', 'ZipRecruiter', 'AngelList'];
  const titles = [
    "Frontend Developer", "Backend Engineer", "Full Stack Developer", 
    "UX Designer", "DevOps Engineer", "Data Scientist", "Product Manager",
    "QA Engineer", "Tech Lead", "Cloud Architect"
  ];
  const companies = [
    "TechCorp", "DataSystems", "WebSolutions", "AILabs", "CloudServices",
    "SoftwareInc", "AppStudio", "DevTeam", "InnovateTech", "CodeMasters"
  ];
  const locations = [
    "Remote", "San Francisco, CA", "New York, NY", "Austin, TX", 
    "Seattle, WA", "Boston, MA", "Chicago, IL", "Denver, CO",
    "Los Angeles, CA", "Portland, OR"
  ];
  
  return {
    title: titles[Math.floor(Math.random() * titles.length)],
    company: companies[Math.floor(Math.random() * companies.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    salary: `$${80 + Math.floor(Math.random() * 80)}K - $${100 + Math.floor(Math.random() * 80)}K/year`,
    datePosted: `${Math.floor(Math.random() * 14) + 1} days ago`,
    jobUrl: `https://example.com/jobs/${1000 + i}`,
    description: "This is a mock job description for demonstration purposes.",
    skills: ["JavaScript", "React", "TypeScript", "Node.js", "AWS"].slice(0, 3 + Math.floor(Math.random() * 3)),
    source: sources[Math.floor(Math.random() * sources.length)],
    sourceId: `mock-${i}`,
    isPremium: Math.random() > 0.8,
    hasEasyApply: Math.random() > 0.3
  };
});

// Combine the detailed mock jobs with the generated ones
export const mockScrapedJobsExtended = [...mockScrapedJobs, ...extraMockJobs];

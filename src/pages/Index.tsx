
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/JobCard";
import { 
  BriefcaseIcon, 
  FileTextIcon, 
  SearchIcon, 
  BarChartIcon, 
  RocketIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  MessageCircleIcon,
  BookIcon
} from 'lucide-react';

const sampleJobs = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    salary: {
      min: 150000,
      max: 220000,
      currency: '$'
    },
    type: 'full-time' as const,
    level: 'senior' as const,
    description: 'We are looking for a Senior Software Engineer...',
    requirements: ['5+ years experience', 'React', 'Node.js'],
    postedAt: new Date().toISOString(),
    skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker']
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'InnovateCo',
    location: 'New York, NY',
    salary: {
      min: 130000,
      max: 180000,
      currency: '$'
    },
    type: 'full-time' as const,
    level: 'mid' as const,
    description: 'Seeking an experienced Product Manager...',
    requirements: ['3+ years experience', 'Agile', 'Technical background'],
    postedAt: new Date(Date.now() - 86400000).toISOString(),
    skills: ['Product Strategy', 'Agile', 'User Research', 'Data Analysis']
  }
];

const features = [
  {
    title: "Find Relevant Jobs",
    description: "Discover job opportunities tailored to your skills and preferences.",
    icon: SearchIcon,
    delay: "100",
    path: "/jobs"
  },
  {
    title: "Track Applications",
    description: "Keep track of your job applications and never miss a follow-up.",
    icon: CheckCircleIcon,
    delay: "200",
    path: "/dashboard"
  },
  {
    title: "Resume Forum",
    description: "Get feedback on your resume from the community and industry professionals.",
    icon: MessageCircleIcon,
    delay: "300",
    path: "/resume-forum"
  },
  {
    title: "LeetCode Patterns",
    description: "Learn common patterns for solving technical interview problems effectively.",
    icon: BookIcon,
    delay: "400",
    path: "/leetcode-patterns"
  },
  {
    title: "Application Insights",
    description: "Gain valuable insights on your job search progress and performance.",
    icon: BarChartIcon,
    delay: "500",
    path: "/dashboard"
  },
  {
    title: "Career Opportunities",
    description: "Explore global opportunities beyond your local area.",
    icon: BriefcaseIcon,
    delay: "600",
    path: "/jobs"
  }
];

const Index = () => {
  return (
    <div className="p-12 pl-72">
      <h1 className="text-4xl font-bold mb-6">Welcome to Streamline</h1>
      <p className="mb-4 max-w-2xl">
        Streamline is your all-in-one career platform: auto-fill job applications, optimize your resume/CV and cover letters, track your progress, practice interviews, join forums, research salaries, and network with recruiters.
        <br />
        <br />
        Supercharge your job search with browser extension automation, job scraping from top sites, and AI tools for every stage of your career journey.
      </p>
      <ul className="list-disc pl-6 max-w-2xl">
        <li>Auto-fill job applications and track your progress</li>
        <li>Scrape jobs from LinkedIn, Indeed, GitHub Jobs, and more</li>
        <li>Resume and Cover Letter Builder + ATS Optimizer</li>
        <li>Interview Practice (coding and behavioral)</li>
        <li>Forums for resume tips, salary negotiation, and networking</li>
        <li>Salary research powered by levels.fyi, Glassdoor, etc.</li>
        <li>Networking tools and recruiter finder</li>
        <li>Extension Manager for easy setup</li>
      </ul>
    </div>
  );
};

export default Index;

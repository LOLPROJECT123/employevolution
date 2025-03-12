
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/JobCard";
import { 
  BriefcaseIcon, 
  FileTextIcon, 
  SearchIcon, 
  BarChartIcon, 
  RocketIcon,
  CheckCircleIcon,
  TrendingUpIcon
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
    delay: "100"
  },
  {
    title: "Track Applications",
    description: "Keep track of your job applications and never miss a follow-up.",
    icon: CheckCircleIcon,
    delay: "200"
  },
  {
    title: "Generate Resumes",
    description: "Create professional resumes tailored to specific job applications.",
    icon: FileTextIcon,
    delay: "300"
  },
  {
    title: "AI Assistance",
    description: "Get AI-powered help with writing cover letters and preparing for interviews.",
    icon: RocketIcon,
    delay: "400"
  },
  {
    title: "Application Insights",
    description: "Gain valuable insights on your job search progress and performance.",
    icon: BarChartIcon,
    delay: "500"
  },
  {
    title: "Career Opportunities",
    description: "Explore global opportunities beyond your local area.",
    icon: BriefcaseIcon,
    delay: "600"
  }
];

const Index = () => {
  const navigate = useNavigate();
  const [animationReady, setAnimationReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleApply = (jobId: string) => {
    navigate(`/auth?mode=signup&redirect=/jobs/${jobId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/80 to-transparent z-0"></div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className={`${animationReady ? 'slide-up' : 'opacity-0'} text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 transition-all duration-700`}>
              Land Your Dream Tech Job With <span className="text-primary">AI-Powered Tools</span>
            </h1>
            
            <p className={`${animationReady ? 'slide-up' : 'opacity-0'} text-xl text-muted-foreground mb-8 transition-all duration-700 delay-100`}>
              Get personalized job recommendations, track applications, and accelerate your tech career with our comprehensive platform.
            </p>
            
            <div className={`${animationReady ? 'slide-up' : 'opacity-0'} flex flex-col sm:flex-row justify-center gap-4 mb-12 transition-all duration-700 delay-200`}>
              <Button 
                size="lg"
                onClick={() => navigate('/auth?mode=signup')}
                className="bg-primary hover:bg-primary/90"
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/jobs')}
              >
                Browse Jobs
              </Button>
            </div>

            <div className={`${animationReady ? 'slide-up' : 'opacity-0'} grid grid-cols-3 gap-6 max-w-3xl mx-auto mb-12 transition-all duration-700 delay-300`}>
              <div className="text-center">
                <div className="font-bold text-3xl text-primary mb-2">500K+</div>
                <div className="text-muted-foreground">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-3xl text-primary mb-2">50K+</div>
                <div className="text-muted-foreground">Companies</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-3xl text-primary mb-2">1M+</div>
                <div className="text-muted-foreground">Job Seekers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Jobs</h2>
            <p className="text-muted-foreground">
              Discover opportunities at top tech companies
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {sampleJobs.map((job) => (
              <JobCard key={job.id} job={job} onApply={handleApply} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/jobs')}
            >
              View All Jobs
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className={`${animationReady ? 'slide-up' : 'opacity-0'} font-bold transition-all duration-700`}>
              Everything You Need for Your Job Search
            </h2>
            <p className={`${animationReady ? 'slide-up' : 'opacity-0'} text-muted-foreground mt-4 transition-all duration-700 delay-100`}>
              Our platform provides comprehensive tools to help you find and secure your dream job.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`${animationReady ? 'slide-up' : 'opacity-0'} glass-card rounded-xl p-6 transition-all duration-700`}
                style={{ transitionDelay: `${parseInt(feature.delay)}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-accent to-background">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className={`${animationReady ? 'slide-up' : 'opacity-0'} font-bold mb-6 transition-all duration-700`}>
              Ready to Accelerate Your Career?
            </h2>
            <p className={`${animationReady ? 'slide-up' : 'opacity-0'} text-xl text-muted-foreground mb-10 transition-all duration-700 delay-100`}>
              Join thousands of professionals who are already using Streamline to find their dream jobs.
            </p>
            <Button 
              size="lg" 
              className={`${animationReady ? 'slide-up' : 'opacity-0'} bg-primary hover:bg-primary/90 button-hover transition-all duration-700 delay-200`}
              onClick={() => navigate('/auth?mode=signup')}
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img src="/lovable-uploads/8d78f162-7185-4058-b018-02e6724321d1.png" alt="Streamline Logo" className="w-6 h-6" />
              <span className="font-medium">Streamline</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Streamline. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;


import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/JobCard";
import { useAuth } from "@/hooks/useAuth";
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
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [animationReady, setAnimationReady] = useState(false);
  const isMobile = useMobile();

  useEffect(() => {
    const timer = setTimeout(() => setAnimationReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth?mode=signup');
    }
  };

  const handleBrowseJobs = () => {
    if (user) {
      navigate('/jobs');
    } else {
      navigate('/auth?mode=signin');
    }
  };

  // Now accepting a Job object instead of a string
  const handleApply = (job: any) => {
    if (user) {
      navigate(`/jobs/${job.id}`);
    } else {
      navigate(`/auth?mode=signup&redirect=/jobs/${job.id}`);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {isMobile ? (
        <MobileHeader title="Streamline" />
      ) : (
        <Navbar />
      )}
      
      {/* Hero Section */}
      <section className={`${isMobile ? 'pt-20' : 'pt-32'} pb-20 px-4 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-accent/80 to-transparent z-0"></div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className={`${animationReady ? 'slide-up' : 'opacity-0'} text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 transition-all duration-700`}>
              Land Your Dream Tech Job With <span className="text-primary">Streamline</span>
            </h1>
            
            <p className={`${animationReady ? 'slide-up' : 'opacity-0'} text-xl text-muted-foreground mb-8 transition-all duration-700 delay-100`}>
              Get personalized job recommendations, resume feedback, and interview preparation with our comprehensive platform.
            </p>
            
            <div className={`${animationReady ? 'slide-up' : 'opacity-0'} flex flex-col sm:flex-row justify-center gap-4 mb-12 transition-all duration-700 delay-200`}>
              <Button 
                size="lg"
                onClick={handleGetStarted}
                className="bg-primary hover:bg-primary/90"
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleBrowseJobs}
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
                className={`${animationReady ? 'slide-up' : 'opacity-0'} glass-card rounded-xl p-6 transition-all duration-700 cursor-pointer hover:shadow-md`}
                style={{ transitionDelay: `${parseInt(feature.delay)}ms` }}
                onClick={() => navigate(feature.path)}
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
            <div className="flex items-center space-x-2 mb-4 md:mb-0 cursor-pointer" onClick={() => navigate('/')}>
              <img 
                src="/lovable-uploads/e143f174-8a9d-4972-8058-44990ccdb8f3.png" 
                alt="Streamline Logo" 
                className="w-6 h-6" 
              />
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

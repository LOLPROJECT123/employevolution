
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { 
  BriefcaseIcon, 
  FileTextIcon, 
  SearchIcon, 
  BarChartIcon, 
  RocketIcon,
  CheckCircleIcon
} from 'lucide-react';

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
    // Delay animations slightly for better page load experience
    const timer = setTimeout(() => setAnimationReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-24 md:pt-48 md:pb-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/80 to-transparent z-0"></div>
        <div 
          className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlZWUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')]"
          style={{ opacity: 0.3 }}
        ></div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className={`${animationReady ? 'slide-in-left' : 'opacity-0'} transition-all duration-700 delay-100`}>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <span className="flex-1">Your Career, Reimagined</span>
              </div>
            </div>
            
            <h1 className={`${animationReady ? 'slide-up' : 'opacity-0'} font-bold leading-tight mb-6 transition-all duration-700 delay-200`}>
              Supercharge Your Job Search with <span className="text-primary">AI-Powered Tools</span>
            </h1>
            
            <p className={`${animationReady ? 'slide-up' : 'opacity-0'} text-xl text-muted-foreground mb-10 transition-all duration-700 delay-300`}>
              Find better opportunities, track applications, and advance your career with our comprehensive platform.
            </p>
            
            <div className={`${animationReady ? 'slide-up' : 'opacity-0'} flex flex-col sm:flex-row justify-center gap-4 transition-all duration-700 delay-400`}>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 button-hover"
                onClick={() => navigate('/auth?mode=signup')}
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="button-hover"
                onClick={() => navigate('/auth?mode=login')}
              >
                Sign In
              </Button>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className={`${animationReady ? 'fade-in' : 'opacity-0'} mt-16 max-w-5xl mx-auto transition-all duration-1000 delay-500`}>
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-primary/5 to-primary/20 rounded-xl flex items-center justify-center">
                <div className="glass-card rounded-lg p-6 w-[80%] max-w-3xl shadow-xl">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-800 rounded ml-4"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="flex space-x-4">
                      <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded flex-1"></div>
                      <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded flex-1"></div>
                      <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded flex-1"></div>
                    </div>
                    <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-24 bg-secondary/50">
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
      <section className="py-24 bg-gradient-to-br from-accent to-background">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className={`${animationReady ? 'slide-up' : 'opacity-0'} font-bold mb-6 transition-all duration-700`}>
              Ready to Accelerate Your Career?
            </h2>
            <p className={`${animationReady ? 'slide-up' : 'opacity-0'} text-xl text-muted-foreground mb-10 transition-all duration-700 delay-100`}>
              Join thousands of professionals who are already using EmployEvolution to find their dream jobs.
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
              <BriefcaseIcon className="w-5 h-5 text-primary" />
              <span className="font-medium">EmployEvolution</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} EmployEvolution. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

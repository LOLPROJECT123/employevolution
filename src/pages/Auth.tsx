
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { BriefcaseIcon, Loader2Icon, GithubIcon, LinkedinIcon, MailIcon, CheckIcon } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordManager } from "@/components/PasswordManager";

type AuthMode = 'login' | 'signup';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [animationReady, setAnimationReady] = useState(false);
  const [savePassword, setSavePassword] = useState(true);
  const [usePresetPassword, setUsePresetPassword] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const modeParam = searchParams.get('mode');
    if (modeParam === 'login' || modeParam === 'signup') {
      setMode(modeParam);
    }
    
    // Load preset password from localStorage if exists
    if (mode === 'signup') {
      const presetPassword = localStorage.getItem('presetPassword');
      if (presetPassword && usePresetPassword) {
        setPassword(presetPassword);
      }
    }
    
    const timer = setTimeout(() => setAnimationReady(true), 100);
    return () => clearTimeout(timer);
  }, [location.search, mode, usePresetPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save password for job applications if checkbox is checked
      if (mode === 'signup' && savePassword) {
        const website = new URL(window.location.href).hostname;
        const savedPasswords = JSON.parse(localStorage.getItem('savedJobPasswords') || '[]');
        
        // Add the current password to saved passwords
        const newSavedPassword = {
          website,
          username: email,
          password,
          length: password.length,
          createdAt: new Date().toISOString(),
        };
        
        localStorage.setItem('savedJobPasswords', JSON.stringify([...savedPasswords, newSavedPassword]));
        
        // If this is a new account, save as preset password if not already set
        if (!localStorage.getItem('presetPassword')) {
          localStorage.setItem('presetPassword', password);
          toast({
            title: "Password Saved as Preset",
            description: "This password will be available for future sign-ups",
          });
        }
      }
      
      toast({
        title: mode === 'login' ? "Login successful" : "Account created",
        description: mode === 'login' 
          ? "Welcome back to Streamline" 
          : "Your account has been created successfully. Your email will be used for job application updates.",
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    toast({
      title: `${provider} Authentication`,
      description: `Authenticating with ${provider}...`,
    });
    
    // Simulate social login
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Login successful",
        description: `You've been authenticated with ${provider}`,
      });
      navigate('/dashboard');
    }, 1500);
  };

  const toggleMode = () => {
    const newMode = mode === 'login' ? 'signup' : 'login';
    setMode(newMode);
    navigate(`/auth?mode=${newMode}`);
  };

  const generatePassword = () => {
    if (mode !== 'signup') return;
    
    const length = Math.random() > 0.5 ? 8 : 12; // Randomly choose 8 or 12 characters
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let generatedPassword = "";
    
    // Ensure at least one uppercase, one lowercase, one number, one special char
    generatedPassword += "A"; // Uppercase
    generatedPassword += "a"; // Lowercase
    generatedPassword += "1"; // Number
    generatedPassword += "!"; // Special
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      generatedPassword += charset[randomIndex];
    }
    
    // Shuffle the password
    generatedPassword = generatedPassword
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
    
    setPassword(generatedPassword);
    
    toast({
      title: "Password Generated",
      description: `A secure ${length}-character password has been generated.`,
    });
  };

  // Function to save current password as preset for future sign-ups
  const saveAsPresetPassword = () => {
    if (!password) {
      toast({
        title: "No Password",
        description: "Please enter or generate a password first",
        variant: "destructive",
      });
      return;
    }
    
    localStorage.setItem('presetPassword', password);
    
    toast({
      title: "Preset Password Saved",
      description: "This password will be used for future job application sign-ups",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20">
        <div className="container flex items-center justify-center px-4 py-16 md:py-24">
          <div className={`${animationReady ? 'fade-in' : 'opacity-0'} w-full max-w-md transition-all duration-500`}>
            <div className="glass-card rounded-xl p-8 shadow-xl">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BriefcaseIcon className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">
                  {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {mode === 'login' 
                    ? 'Sign in to access your account' 
                    : 'Sign up to start your job search journey'}
                </p>
                {mode === 'signup' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Your email will be used for job tracker status updates
                  </p>
                )}
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                  {mode === 'signup' && (
                    <p className="text-xs text-muted-foreground">
                      We'll use this email to send you job application status updates
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {mode === 'login' ? (
                      <a 
                        href="#" 
                        className="text-xs text-primary hover:text-primary/80"
                        onClick={(e) => {
                          e.preventDefault();
                          toast({
                            title: "Password Reset",
                            description: "This feature is coming soon.",
                          });
                        }}
                      >
                        Forgot password?
                      </a>
                    ) : (
                      <div className="flex space-x-3">
                        <a 
                          href="#" 
                          className="text-xs text-primary hover:text-primary/80"
                          onClick={(e) => {
                            e.preventDefault();
                            generatePassword();
                          }}
                        >
                          Generate password
                        </a>
                        <a 
                          href="#" 
                          className="text-xs text-primary hover:text-primary/80"
                          onClick={(e) => {
                            e.preventDefault();
                            saveAsPresetPassword();
                          }}
                        >
                          Save as preset
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <Input 
                    id="password"
                    type="password"
                    placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                  
                  {mode === 'signup' && (
                    <div className="space-y-3 mt-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="save-password" 
                          checked={savePassword}
                          onCheckedChange={(checked) => setSavePassword(checked as boolean)}
                        />
                        <label
                          htmlFor="save-password"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Save password for job applications
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="use-preset" 
                          checked={usePresetPassword}
                          onCheckedChange={(checked) => {
                            setUsePresetPassword(checked as boolean);
                            if (checked) {
                              const presetPassword = localStorage.getItem('presetPassword');
                              if (presetPassword) {
                                setPassword(presetPassword);
                              }
                            }
                          }}
                        />
                        <label
                          htmlFor="use-preset"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Use preset password
                        </label>
                      </div>
                    </div>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11 mt-6 button-hover"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    <>{mode === 'login' ? 'Sign In' : 'Create Account'}</>
                  )}
                </Button>
              </form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background dark:bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-11 button-hover flex justify-center"
                    onClick={() => handleSocialLogin('Google')}
                    disabled={isLoading}
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                      <path
                        d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                        fill="#EA4335"
                      />
                      <path
                        d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24 12.0004 24Z"
                        fill="#34A853"
                      />
                    </svg>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-11 button-hover flex justify-center"
                    onClick={() => handleSocialLogin('GitHub')}
                    disabled={isLoading}
                  >
                    <GithubIcon className="h-5 w-5" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-11 button-hover flex justify-center"
                    onClick={() => handleSocialLogin('LinkedIn')}
                    disabled={isLoading}
                  >
                    <LinkedinIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">
                  {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 font-medium"
                  onClick={toggleMode}
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </div>
              
              {mode === 'signup' && (
                <div className="mt-6 flex justify-center">
                  <PasswordManager />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;

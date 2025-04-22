
export interface User {
  name: string;
  email: string;
  avatar?: string;
  streak: number;
  isAllStar: boolean;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
}

export interface MatchPreferences {
  location: string;
  jobType: string[];
  salary: {
    min: number;
    max: number;
  };
  remote: boolean;
}

export interface Match {
  id: string;
  title: string;
  company: string;
  location: string;
  matchPercentage: number;
}

export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  link: string;
}

export interface JobApplication {
  id: string;
  title: string;
  company: string;
  location: string;
  status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected';
  date: string;
  logo?: string;
}

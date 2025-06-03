
// Database type definitions with proper casting utilities
export interface DatabaseJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  posted: string;
  type: string;
  remote: boolean;
  description: string;
  requirements: string[];
  benefits?: string[];
  [key: string]: any; // Index signature for Json compatibility
}

export type DevelopmentStatus = 'completed' | 'in_progress' | 'paused';

export interface DatabaseDevelopmentGoal {
  id: string;
  goal_title: string;
  category: string;
  goal_description?: string;
  status: string; // Raw database string
  progress_percentage: number;
  target_date?: string;
  completion_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TypedDevelopmentGoal extends Omit<DatabaseDevelopmentGoal, 'status'> {
  status: DevelopmentStatus;
}

// Type casting utilities
export const castDevelopmentStatus = (status: string): DevelopmentStatus => {
  if (['completed', 'in_progress', 'paused'].includes(status)) {
    return status as DevelopmentStatus;
  }
  return 'in_progress'; // Default fallback
};

export const castJsonToStringArray = (jsonData: any): string[] => {
  if (Array.isArray(jsonData)) {
    return jsonData.map(item => String(item));
  }
  if (typeof jsonData === 'string') {
    try {
      const parsed = JSON.parse(jsonData);
      return Array.isArray(parsed) ? parsed.map(item => String(item)) : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const castJobData = (rawJob: any): DatabaseJob => {
  return {
    id: rawJob.id || '',
    title: rawJob.title || '',
    company: rawJob.company || '',
    location: rawJob.location || '',
    salary: rawJob.salary,
    posted: rawJob.posted || '',
    type: rawJob.type || '',
    remote: Boolean(rawJob.remote),
    description: rawJob.description || '',
    requirements: castJsonToStringArray(rawJob.requirements),
    benefits: rawJob.benefits ? castJsonToStringArray(rawJob.benefits) : undefined,
    ...rawJob
  };
};

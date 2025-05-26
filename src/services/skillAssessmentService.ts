
interface SkillAssessment {
  id: string;
  skillName: string;
  category: 'technical' | 'soft' | 'domain';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  questions: AssessmentQuestion[];
  timeLimit: number; // in minutes
  passingScore: number; // percentage
}

interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'coding' | 'short_answer' | 'true_false';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface UserSkillProfile {
  userId: string;
  assessments: CompletedAssessment[];
  skillGaps: SkillGap[];
  recommendations: LearningRecommendation[];
  lastUpdated: string;
}

interface CompletedAssessment {
  assessmentId: string;
  skillName: string;
  score: number;
  level: string;
  completedAt: string;
  timeSpent: number; // in minutes
  correctAnswers: number;
  totalQuestions: number;
  detailedResults: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    pointsEarned: number;
  }[];
}

interface SkillGap {
  skillName: string;
  currentLevel: string;
  targetLevel: string;
  priority: 'low' | 'medium' | 'high';
  jobsRequiring: number;
  learningPath: string[];
}

interface LearningRecommendation {
  skillName: string;
  type: 'course' | 'book' | 'project' | 'certification';
  title: string;
  provider: string;
  url: string;
  duration: string;
  difficulty: string;
  rating: number;
  cost: 'free' | 'paid';
}

class SkillAssessmentService {
  private assessments: Map<string, SkillAssessment> = new Map();
  private userProfiles: Map<string, UserSkillProfile> = new Map();

  constructor() {
    this.initializeAssessments();
  }

  private initializeAssessments(): void {
    // JavaScript Assessment
    this.assessments.set('javascript', {
      id: 'javascript',
      skillName: 'JavaScript',
      category: 'technical',
      level: 'intermediate',
      timeLimit: 30,
      passingScore: 70,
      questions: [
        {
          id: 'js1',
          question: 'What is the difference between "let" and "var" in JavaScript?',
          type: 'multiple_choice',
          options: [
            'No difference, they are interchangeable',
            'let has block scope, var has function scope',
            'var has block scope, let has function scope',
            'let is for numbers, var is for strings'
          ],
          correctAnswer: 'let has block scope, var has function scope',
          explanation: 'let variables are block-scoped while var variables are function-scoped or globally-scoped.',
          difficulty: 'medium',
          points: 10
        },
        {
          id: 'js2',
          question: 'Write a function that returns the sum of all numbers in an array.',
          type: 'coding',
          correctAnswer: 'function sumArray(arr) { return arr.reduce((sum, num) => sum + num, 0); }',
          explanation: 'Using reduce is an efficient way to sum array elements.',
          difficulty: 'easy',
          points: 15
        },
        {
          id: 'js3',
          question: 'What will console.log(typeof null) output?',
          type: 'multiple_choice',
          options: ['null', 'undefined', 'object', 'boolean'],
          correctAnswer: 'object',
          explanation: 'This is a well-known JavaScript quirk - typeof null returns "object".',
          difficulty: 'hard',
          points: 10
        }
      ]
    });

    // Python Assessment
    this.assessments.set('python', {
      id: 'python',
      skillName: 'Python',
      category: 'technical',
      level: 'intermediate',
      timeLimit: 45,
      passingScore: 75,
      questions: [
        {
          id: 'py1',
          question: 'What is the difference between a list and a tuple in Python?',
          type: 'multiple_choice',
          options: [
            'Lists are mutable, tuples are immutable',
            'Tuples are mutable, lists are immutable',
            'No difference',
            'Lists store numbers, tuples store strings'
          ],
          correctAnswer: 'Lists are mutable, tuples are immutable',
          explanation: 'Lists can be modified after creation, while tuples cannot be changed.',
          difficulty: 'easy',
          points: 10
        },
        {
          id: 'py2',
          question: 'Write a Python function to find the factorial of a number.',
          type: 'coding',
          correctAnswer: 'def factorial(n): return 1 if n <= 1 else n * factorial(n-1)',
          explanation: 'This is a recursive solution for calculating factorial.',
          difficulty: 'medium',
          points: 15
        }
      ]
    });

    // Communication Skills Assessment
    this.assessments.set('communication', {
      id: 'communication',
      skillName: 'Communication',
      category: 'soft',
      level: 'intermediate',
      timeLimit: 20,
      passingScore: 80,
      questions: [
        {
          id: 'comm1',
          question: 'In a team meeting, a colleague presents an idea you disagree with. What is the best approach?',
          type: 'multiple_choice',
          options: [
            'Immediately point out why the idea won\'t work',
            'Stay silent to avoid conflict',
            'Ask clarifying questions and present your concerns constructively',
            'Wait until after the meeting to complain to others'
          ],
          correctAnswer: 'Ask clarifying questions and present your concerns constructively',
          explanation: 'Constructive communication involves understanding before being understood and presenting concerns professionally.',
          difficulty: 'medium',
          points: 10
        }
      ]
    });
  }

  async takeAssessment(assessmentId: string, userId: string): Promise<SkillAssessment | null> {
    return this.assessments.get(assessmentId) || null;
  }

  async submitAssessment(assessmentId: string, userId: string, answers: Record<string, string>): Promise<CompletedAssessment> {
    const assessment = this.assessments.get(assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    let score = 0;
    let correctAnswers = 0;
    const detailedResults = [];

    for (const question of assessment.questions) {
      const userAnswer = answers[question.id] || '';
      const isCorrect = this.checkAnswer(question, userAnswer);
      
      if (isCorrect) {
        score += question.points;
        correctAnswers++;
      }

      detailedResults.push({
        questionId: question.id,
        userAnswer,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0
      });
    }

    const totalPoints = assessment.questions.reduce((sum, q) => sum + q.points, 0);
    const percentageScore = (score / totalPoints) * 100;

    const completedAssessment: CompletedAssessment = {
      assessmentId,
      skillName: assessment.skillName,
      score: Math.round(percentageScore),
      level: this.determineSkillLevel(percentageScore),
      completedAt: new Date().toISOString(),
      timeSpent: assessment.timeLimit, // Would track actual time in real implementation
      correctAnswers,
      totalQuestions: assessment.questions.length,
      detailedResults
    };

    // Update user profile
    await this.updateUserProfile(userId, completedAssessment);

    return completedAssessment;
  }

  private checkAnswer(question: AssessmentQuestion, userAnswer: string): boolean {
    if (Array.isArray(question.correctAnswer)) {
      return question.correctAnswer.includes(userAnswer);
    }
    return question.correctAnswer.toLowerCase().trim() === userAnswer.toLowerCase().trim();
  }

  private determineSkillLevel(score: number): string {
    if (score >= 90) return 'expert';
    if (score >= 80) return 'advanced';
    if (score >= 70) return 'intermediate';
    return 'beginner';
  }

  private async updateUserProfile(userId: string, completedAssessment: CompletedAssessment): Promise<void> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        assessments: [],
        skillGaps: [],
        recommendations: [],
        lastUpdated: new Date().toISOString()
      };
    }

    // Remove previous assessment for the same skill
    profile.assessments = profile.assessments.filter(a => a.skillName !== completedAssessment.skillName);
    profile.assessments.push(completedAssessment);

    // Update skill gaps and recommendations
    profile.skillGaps = await this.analyzeSkillGaps(profile.assessments);
    profile.recommendations = await this.generateLearningRecommendations(profile.skillGaps);
    profile.lastUpdated = new Date().toISOString();

    this.userProfiles.set(userId, profile);
    
    // Persist to localStorage
    localStorage.setItem('skill_profiles', JSON.stringify(Array.from(this.userProfiles.entries())));
  }

  async getUserSkillProfile(userId: string): Promise<UserSkillProfile | null> {
    // Load from localStorage if not in memory
    if (!this.userProfiles.has(userId)) {
      this.loadUserProfiles();
    }
    
    return this.userProfiles.get(userId) || null;
  }

  private loadUserProfiles(): void {
    try {
      const stored = localStorage.getItem('skill_profiles');
      if (stored) {
        const profiles = JSON.parse(stored);
        this.userProfiles = new Map(profiles);
      }
    } catch (error) {
      console.error('Error loading skill profiles:', error);
    }
  }

  async analyzeSkillGaps(assessments: CompletedAssessment[]): Promise<SkillGap[]> {
    const skillGaps: SkillGap[] = [];
    
    // Define target skills for different roles
    const targetSkills = {
      'frontend': ['JavaScript', 'React', 'CSS', 'TypeScript'],
      'backend': ['Python', 'JavaScript', 'SQL', 'API Design'],
      'fullstack': ['JavaScript', 'Python', 'React', 'SQL', 'Communication'],
      'data': ['Python', 'SQL', 'Machine Learning', 'Statistics']
    };

    // For demo, assume user is targeting fullstack role
    const requiredSkills = targetSkills.fullstack;
    
    for (const skill of requiredSkills) {
      const assessment = assessments.find(a => a.skillName === skill);
      const currentLevel = assessment ? assessment.level : 'beginner';
      const targetLevel = 'advanced';

      if (!assessment || this.getLevelValue(currentLevel) < this.getLevelValue(targetLevel)) {
        skillGaps.push({
          skillName: skill,
          currentLevel,
          targetLevel,
          priority: this.calculatePriority(skill, currentLevel),
          jobsRequiring: this.getJobsRequiringSkill(skill),
          learningPath: this.generateLearningPath(skill, currentLevel, targetLevel)
        });
      }
    }

    return skillGaps;
  }

  private getLevelValue(level: string): number {
    const levels = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
    return levels[level as keyof typeof levels] || 1;
  }

  private calculatePriority(skill: string, currentLevel: string): 'low' | 'medium' | 'high' {
    const highPrioritySkills = ['JavaScript', 'Python', 'Communication'];
    const isHighPriority = highPrioritySkills.includes(skill);
    const isLowLevel = currentLevel === 'beginner';
    
    if (isHighPriority && isLowLevel) return 'high';
    if (isHighPriority || isLowLevel) return 'medium';
    return 'low';
  }

  private getJobsRequiringSkill(skill: string): number {
    // Mock data - in real implementation, this would query job data
    const skillDemand: Record<string, number> = {
      'JavaScript': 1250,
      'Python': 890,
      'React': 650,
      'SQL': 540,
      'Communication': 1100,
      'TypeScript': 420
    };
    
    return skillDemand[skill] || 100;
  }

  private generateLearningPath(skill: string, currentLevel: string, targetLevel: string): string[] {
    const learningPaths: Record<string, Record<string, string[]>> = {
      'JavaScript': {
        'beginner': ['Complete JavaScript Basics Course', 'Build 3 Simple Projects', 'Practice ES6+ Features'],
        'intermediate': ['Learn Advanced JavaScript Concepts', 'Master Async Programming', 'Build Complex Applications'],
        'advanced': ['Study JavaScript Internals', 'Contribute to Open Source', 'Mentor Others']
      },
      'Python': {
        'beginner': ['Python Fundamentals Course', 'Build Basic Scripts', 'Learn Object-Oriented Programming'],
        'intermediate': ['Advanced Python Features', 'Learn Web Frameworks', 'Data Manipulation with Pandas'],
        'advanced': ['System Design with Python', 'Performance Optimization', 'Contribute to Python Projects']
      },
      'Communication': {
        'beginner': ['Practice Active Listening', 'Learn Presentation Basics', 'Join Speaking Groups'],
        'intermediate': ['Advanced Presentation Skills', 'Conflict Resolution', 'Team Leadership'],
        'advanced': ['Executive Communication', 'Public Speaking', 'Cross-Cultural Communication']
      }
    };

    return learningPaths[skill]?.[currentLevel] || ['Study fundamentals', 'Practice regularly', 'Seek feedback'];
  }

  async generateLearningRecommendations(skillGaps: SkillGap[]): Promise<LearningRecommendation[]> {
    const recommendations: LearningRecommendation[] = [];

    for (const gap of skillGaps) {
      const skillRecommendations = this.getRecommendationsForSkill(gap.skillName, gap.currentLevel);
      recommendations.push(...skillRecommendations);
    }

    return recommendations.slice(0, 10); // Limit to top 10 recommendations
  }

  private getRecommendationsForSkill(skillName: string, currentLevel: string): LearningRecommendation[] {
    const recommendations: Record<string, LearningRecommendation[]> = {
      'JavaScript': [
        {
          skillName: 'JavaScript',
          type: 'course',
          title: 'The Complete JavaScript Course 2024',
          provider: 'Udemy',
          url: 'https://udemy.com/javascript-course',
          duration: '69 hours',
          difficulty: 'beginner',
          rating: 4.7,
          cost: 'paid'
        },
        {
          skillName: 'JavaScript',
          type: 'book',
          title: 'You Don\'t Know JS Yet',
          provider: 'Kyle Simpson',
          url: 'https://github.com/getify/You-Dont-Know-JS',
          duration: '6-8 weeks',
          difficulty: 'intermediate',
          rating: 4.8,
          cost: 'free'
        }
      ],
      'Python': [
        {
          skillName: 'Python',
          type: 'course',
          title: 'Python for Everybody Specialization',
          provider: 'Coursera',
          url: 'https://coursera.org/python-everybody',
          duration: '8 months',
          difficulty: 'beginner',
          rating: 4.8,
          cost: 'paid'
        }
      ],
      'Communication': [
        {
          skillName: 'Communication',
          type: 'course',
          title: 'Effective Communication Skills',
          provider: 'LinkedIn Learning',
          url: 'https://linkedin.com/learning/communication',
          duration: '2 hours',
          difficulty: 'beginner',
          rating: 4.5,
          cost: 'paid'
        }
      ]
    };

    return recommendations[skillName] || [];
  }

  async getAvailableAssessments(): Promise<SkillAssessment[]> {
    return Array.from(this.assessments.values());
  }

  async getSkillBenchmark(skillName: string): Promise<{
    averageScore: number;
    distributions: Record<string, number>;
    industryDemand: number;
    salaryImpact: number;
  }> {
    // Mock benchmarking data
    return {
      averageScore: 73,
      distributions: {
        'beginner': 25,
        'intermediate': 45,
        'advanced': 25,
        'expert': 5
      },
      industryDemand: 85, // percentage
      salaryImpact: 15 // percentage increase
    };
  }
}

export const skillAssessmentService = new SkillAssessmentService();

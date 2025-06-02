
import { Job } from '@/types/job';

export interface VoiceCommand {
  command: string;
  intent: 'search' | 'filter' | 'navigate' | 'apply' | 'save' | 'help';
  parameters: Record<string, any>;
  confidence: number;
}

export interface VoiceResponse {
  message: string;
  action?: {
    type: 'navigate' | 'search' | 'filter' | 'execute';
    payload: any;
  };
  suggestions?: string[];
}

export class VoiceCommandService {
  private static readonly COMMAND_PATTERNS = {
    search: [
      /(?:search|find|look for) (?:jobs?|positions?) (?:in|for|as) (.+)/i,
      /(?:show me|find) (.+) (?:jobs?|positions?)/i,
      /(?:i want to work|looking for work) (?:in|as) (.+)/i
    ],
    filter: [
      /(?:filter by|show only|limit to) (.+)/i,
      /(?:remote|work from home|wfh) (?:jobs?|only)/i,
      /(?:full time|part time|contract) (?:jobs?|only)/i,
      /(?:salary|pay) (?:above|over|more than) (.+)/i,
      /(?:in|near|around) (.+) (?:area|city|location)/i
    ],
    navigate: [
      /(?:go to|open|show me) (.+)/i,
      /(?:back|previous|home|dashboard)/i
    ],
    apply: [
      /(?:apply to|apply for) (.+)/i,
      /(?:submit application|send resume) (?:to|for) (.+)/i
    ],
    save: [
      /(?:save|bookmark) (?:this )?(?:job|position)/i,
      /(?:add to|save to) (?:favorites|saved jobs)/i
    ],
    help: [
      /(?:help|what can you do|commands)/i
    ]
  };

  static async processVoiceCommand(transcript: string): Promise<VoiceResponse> {
    try {
      console.log('Processing voice command:', transcript);
      
      const command = this.parseCommand(transcript);
      
      if (!command) {
        return {
          message: "I didn't understand that command. Try saying 'search for developer jobs' or 'help' for available commands.",
          suggestions: [
            "Search for software engineer jobs",
            "Filter by remote jobs",
            "Go to dashboard",
            "Show me help"
          ]
        };
      }

      return await this.executeCommand(command);
    } catch (error) {
      console.error('Error processing voice command:', error);
      return {
        message: "Sorry, I encountered an error processing your command. Please try again.",
        suggestions: ["Try a simpler command", "Say 'help' for available commands"]
      };
    }
  }

  private static parseCommand(transcript: string): VoiceCommand | null {
    const normalizedTranscript = transcript.toLowerCase().trim();

    for (const [intent, patterns] of Object.entries(this.COMMAND_PATTERNS)) {
      for (const pattern of patterns) {
        const match = normalizedTranscript.match(pattern);
        if (match) {
          return {
            command: transcript,
            intent: intent as VoiceCommand['intent'],
            parameters: this.extractParameters(intent, match),
            confidence: 0.8
          };
        }
      }
    }

    return null;
  }

  private static extractParameters(intent: string, match: RegExpMatchArray): Record<string, any> {
    const params: Record<string, any> = {};

    switch (intent) {
      case 'search':
        params.query = match[1]?.trim();
        break;
      case 'filter':
        if (match[0].includes('remote') || match[0].includes('work from home')) {
          params.workType = 'remote';
        } else if (match[0].includes('full time')) {
          params.employmentType = 'full-time';
        } else if (match[0].includes('part time')) {
          params.employmentType = 'part-time';
        } else if (match[0].includes('contract')) {
          params.employmentType = 'contract';
        } else if (match[0].includes('salary') || match[0].includes('pay')) {
          params.minSalary = this.extractSalary(match[1]);
        } else if (match[0].includes('in') || match[0].includes('near')) {
          params.location = match[1]?.trim();
        } else {
          params.filterType = match[1]?.trim();
        }
        break;
      case 'navigate':
        params.destination = match[1]?.trim() || match[0];
        break;
      case 'apply':
        params.jobTitle = match[1]?.trim();
        break;
    }

    return params;
  }

  private static extractSalary(salaryText: string): number | null {
    if (!salaryText) return null;
    
    const numbers = salaryText.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      const value = parseInt(numbers[0]);
      // Handle k suffix (e.g., "50k" -> 50000)
      if (salaryText.toLowerCase().includes('k')) {
        return value * 1000;
      }
      return value;
    }
    return null;
  }

  private static async executeCommand(command: VoiceCommand): Promise<VoiceResponse> {
    switch (command.intent) {
      case 'search':
        return this.handleSearchCommand(command);
      case 'filter':
        return this.handleFilterCommand(command);
      case 'navigate':
        return this.handleNavigateCommand(command);
      case 'apply':
        return this.handleApplyCommand(command);
      case 'save':
        return this.handleSaveCommand(command);
      case 'help':
        return this.handleHelpCommand();
      default:
        return {
          message: "Command recognized but not implemented yet.",
          suggestions: ["Try a different command", "Say 'help' for available commands"]
        };
    }
  }

  private static handleSearchCommand(command: VoiceCommand): VoiceResponse {
    const query = command.parameters.query;
    return {
      message: `Searching for ${query} jobs...`,
      action: {
        type: 'search',
        payload: { query }
      },
      suggestions: [
        "Filter by remote jobs",
        "Show salary requirements",
        "Apply filters"
      ]
    };
  }

  private static handleFilterCommand(command: VoiceCommand): VoiceResponse {
    const params = command.parameters;
    let message = "Applying filters...";
    
    if (params.workType === 'remote') {
      message = "Showing only remote jobs...";
    } else if (params.employmentType) {
      message = `Filtering for ${params.employmentType} positions...`;
    } else if (params.minSalary) {
      message = `Showing jobs with salary above $${params.minSalary.toLocaleString()}...`;
    } else if (params.location) {
      message = `Filtering jobs in ${params.location}...`;
    }

    return {
      message,
      action: {
        type: 'filter',
        payload: params
      },
      suggestions: [
        "Clear filters",
        "Add more filters",
        "Search specific jobs"
      ]
    };
  }

  private static handleNavigateCommand(command: VoiceCommand): VoiceResponse {
    const destination = command.parameters.destination;
    
    const navigationMap: Record<string, string> = {
      'dashboard': '/dashboard',
      'jobs': '/jobs',
      'applications': '/applications',
      'profile': '/profile',
      'settings': '/settings',
      'saved jobs': '/saved-jobs',
      'interviews': '/interviews',
      'back': 'back',
      'previous': 'back',
      'home': '/dashboard'
    };

    const route = navigationMap[destination?.toLowerCase()] || '/dashboard';

    return {
      message: `Navigating to ${destination || 'dashboard'}...`,
      action: {
        type: 'navigate',
        payload: { route }
      }
    };
  }

  private static handleApplyCommand(command: VoiceCommand): VoiceResponse {
    return {
      message: "To apply for a job, please navigate to the job details first.",
      suggestions: [
        "Search for specific jobs",
        "Go to saved jobs",
        "Browse current listings"
      ]
    };
  }

  private static handleSaveCommand(command: VoiceCommand): VoiceResponse {
    return {
      message: "To save a job, please navigate to the job details first.",
      suggestions: [
        "Search for jobs to save",
        "View current job listings",
        "Go to saved jobs"
      ]
    };
  }

  private static handleHelpCommand(): VoiceResponse {
    return {
      message: "Here are the voice commands you can use:",
      suggestions: [
        "Search for [job title] jobs",
        "Filter by remote jobs",
        "Show full time positions",
        "Go to dashboard",
        "Filter by location",
        "Show salary above [amount]"
      ]
    };
  }

  // Natural language job filtering
  static async convertVoiceToFilters(voiceCommand: string): Promise<any> {
    const command = this.parseCommand(voiceCommand);
    
    if (!command || command.intent !== 'filter') {
      return {};
    }

    const filters: any = {};
    const params = command.parameters;

    if (params.workType === 'remote') {
      filters.remote = true;
    }
    
    if (params.employmentType) {
      filters.jobType = params.employmentType;
    }
    
    if (params.minSalary) {
      filters.minSalary = params.minSalary;
    }
    
    if (params.location) {
      filters.location = params.location;
    }

    return filters;
  }
}

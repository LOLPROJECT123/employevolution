
export interface FunctionDocumentation {
  name: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
  }>;
  returnType: string;
  examples: Array<{
    title: string;
    code: string;
    description: string;
  }>;
  relatedFunctions: string[];
  complexity: 'simple' | 'moderate' | 'complex';
}

export class DocumentationGenerator {
  private static documentation = new Map<string, FunctionDocumentation>();

  static generateProfileServiceDocs(): FunctionDocumentation[] {
    const docs: FunctionDocumentation[] = [
      {
        name: 'EnhancedProfileService.saveProfileWithValidation',
        description: 'Saves profile data with comprehensive validation, address standardization, and automatic backup creation.',
        parameters: [
          { name: 'userId', type: 'string', description: 'Unique user identifier', required: true },
          { name: 'profileData', type: 'any', description: 'Complete profile data object', required: true }
        ],
        returnType: 'Promise<boolean>',
        examples: [
          {
            title: 'Basic Profile Save',
            code: `
const success = await EnhancedProfileService.saveProfileWithValidation(userId, {
  personalInfo: {
    name: 'John Doe',
    email: 'john@example.com',
    streetAddress: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345'
  },
  skills: ['JavaScript', 'React'],
  workExperiences: [...]
});
`,
            description: 'Save a complete profile with validation'
          }
        ],
        relatedFunctions: ['loadProfileForUI', 'validateProfileCompletionDetailed'],
        complexity: 'complex'
      },

      {
        name: 'useEnhancedValidation',
        description: 'React hook for debounced validation with caching and performance monitoring.',
        parameters: [
          { name: 'rules', type: 'ValidationRule<T>[]', description: 'Array of validation rules', required: true },
          { name: 'debounceMs', type: 'number', description: 'Debounce delay in milliseconds', required: false }
        ],
        returnType: '{ validate: Function, isValidating: boolean, clearCache: Function }',
        examples: [
          {
            title: 'Email Validation',
            code: `
const emailRules = [
  {
    validate: (email) => email.includes('@'),
    message: 'Email must contain @ symbol',
    severity: 'error'
  }
];

const { validate, isValidating } = useEnhancedValidation(emailRules, 300);
`,
            description: 'Setup email validation with 300ms debounce'
          }
        ],
        relatedFunctions: ['useAutoSave', 'EnhancedErrorDisplay'],
        complexity: 'moderate'
      },

      {
        name: 'useAutoSave',
        description: 'React hook for automatic saving with debouncing and status tracking.',
        parameters: [
          { name: 'data', type: 'T', description: 'Data to auto-save', required: true },
          { name: 'options', type: 'AutoSaveOptions<T>', description: 'Save configuration options', required: true }
        ],
        returnType: '{ saveStatus: string, lastSaved: Date, error: string, forceSave: Function }',
        examples: [
          {
            title: 'Auto-save Profile Data',
            code: `
const { saveStatus, lastSaved } = useAutoSave(profileData, {
  saveFunction: (data) => profileService.saveProfile(userId, data),
  interval: 2000,
  onSaveSuccess: () => toast.success('Profile saved!'),
  onSaveError: (error) => toast.error('Save failed: ' + error.message)
});
`,
            description: 'Auto-save profile data every 2 seconds'
          }
        ],
        relatedFunctions: ['AutoSaveIndicator', 'useEnhancedValidation'],
        complexity: 'moderate'
      }
    ];

    docs.forEach(doc => this.documentation.set(doc.name, doc));
    return docs;
  }

  static generateUtilityDocs(): FunctionDocumentation[] {
    const docs: FunctionDocumentation[] = [
      {
        name: 'EnhancedCacheService.getWithRefresh',
        description: 'Gets cached data with optional background refresh for stale entries.',
        parameters: [
          { name: 'key', type: 'string', description: 'Cache key', required: true },
          { name: 'fetcher', type: '() => Promise<T>', description: 'Function to fetch fresh data', required: true },
          { name: 'options', type: 'CacheOptions', description: 'Caching options', required: false }
        ],
        returnType: 'Promise<T>',
        examples: [
          {
            title: 'Cache User Profile',
            code: `
const profile = await EnhancedCacheService.getWithRefresh(
  \`profile:\${userId}\`,
  () => profileService.loadUserData(userId),
  {
    ttl: 300000, // 5 minutes
    refreshInBackground: true,
    onStale: (key) => console.log('Refreshed', key)
  }
);
`,
            description: 'Get profile with background refresh'
          }
        ],
        relatedFunctions: ['warmCache', 'invalidatePattern'],
        complexity: 'moderate'
      },

      {
        name: 'PerformanceOptimizer.measureComponentRender',
        description: 'Higher-order component that measures and reports render performance.',
        parameters: [
          { name: 'Component', type: 'React.ComponentType', description: 'Component to measure', required: true },
          { name: 'componentName', type: 'string', description: 'Name for performance tracking', required: true }
        ],
        returnType: 'React.ComponentType',
        examples: [
          {
            title: 'Measure Profile Form Performance',
            code: `
const MeasuredProfileForm = PerformanceOptimizer.measureComponentRender(
  ProfileForm, 
  'ProfileForm'
);

// Use the measured component
<MeasuredProfileForm {...props} />
`,
            description: 'Automatically track ProfileForm render performance'
          }
        ],
        relatedFunctions: ['initializeMonitoring', 'getCoreWebVitals'],
        complexity: 'simple'
      }
    ];

    docs.forEach(doc => this.documentation.set(doc.name, doc));
    return docs;
  }

  static getAllDocumentation(): FunctionDocumentation[] {
    return Array.from(this.documentation.values());
  }

  static generateMarkdown(): string {
    const allDocs = this.getAllDocumentation();
    
    let markdown = '# Enhanced Profile Service Documentation\n\n';
    markdown += 'This documentation covers the enhanced profile management system with validation, caching, and performance optimizations.\n\n';

    // Table of Contents
    markdown += '## Table of Contents\n\n';
    allDocs.forEach(doc => {
      markdown += `- [${doc.name}](#${doc.name.toLowerCase().replace(/\./g, '').replace(/\s+/g, '-')})\n`;
    });
    markdown += '\n';

    // Function Documentation
    allDocs.forEach(doc => {
      markdown += `## ${doc.name}\n\n`;
      markdown += `**Complexity:** ${doc.complexity}\n\n`;
      markdown += `${doc.description}\n\n`;
      
      markdown += '### Parameters\n\n';
      doc.parameters.forEach(param => {
        const required = param.required ? '(required)' : '(optional)';
        markdown += `- **${param.name}** \`${param.type}\` ${required}: ${param.description}\n`;
      });
      markdown += '\n';
      
      markdown += `### Returns\n\n\`${doc.returnType}\`\n\n`;
      
      if (doc.examples.length > 0) {
        markdown += '### Examples\n\n';
        doc.examples.forEach(example => {
          markdown += `#### ${example.title}\n\n`;
          markdown += `${example.description}\n\n`;
          markdown += '```typescript\n';
          markdown += example.code.trim();
          markdown += '\n```\n\n';
        });
      }
      
      if (doc.relatedFunctions.length > 0) {
        markdown += '### Related Functions\n\n';
        doc.relatedFunctions.forEach(func => {
          markdown += `- ${func}\n`;
        });
        markdown += '\n';
      }
      
      markdown += '---\n\n';
    });

    return markdown;
  }

  static exportDocumentation(): string {
    this.generateProfileServiceDocs();
    this.generateUtilityDocs();
    return this.generateMarkdown();
  }
}

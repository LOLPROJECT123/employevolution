
// Enhanced Content Script for comprehensive job application automation

class EnhancedJobApplicationAutomator {
  constructor() {
    this.questionDatabase = new Map();
    this.currentPageQuestions = [];
    this.userAnswers = {};
    this.platformDetector = new PlatformDetector();
    this.formFiller = new IntelligentFormFiller();
    this.isProcessing = false;
  }

  async initialize() {
    console.log('Enhanced Job Application Automator initializing...');
    
    // Load user answers from storage
    await this.loadUserAnswers();
    
    // Detect current platform
    const platform = this.platformDetector.detectPlatform(window.location.href);
    console.log('Detected platform:', platform);
    
    // Set up observers
    this.setupFormObserver();
    this.setupPageObserver();
    
    // Scan for existing forms
    await this.scanPageForForms();
    
    // Listen for messages from background script
    this.setupMessageListeners();
  }

  setupFormObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const forms = node.querySelectorAll ? node.querySelectorAll('form') : [];
              const inputs = node.querySelectorAll ? node.querySelectorAll('input, textarea, select') : [];
              
              if (forms.length > 0 || inputs.length > 0) {
                setTimeout(() => this.scanPageForForms(), 1000);
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  setupPageObserver() {
    // Monitor for page changes (SPA navigation)
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(() => {
          this.scanPageForForms();
        }, 2000);
      }
    }).observe(document, { subtree: true, childList: true });
  }

  async scanPageForForms() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const forms = document.querySelectorAll('form');
      const allInputs = document.querySelectorAll('input, textarea, select');
      
      if (forms.length === 0 && allInputs.length === 0) {
        this.isProcessing = false;
        return;
      }

      console.log(`Found ${forms.length} forms and ${allInputs.length} input fields`);

      // Extract all questions from the page
      const questions = await this.extractQuestionsFromPage();
      
      if (questions.length > 0) {
        await this.processQuestions(questions);
        
        // Check for auto-fill opportunity
        const platform = this.platformDetector.detectPlatform(window.location.href);
        if (this.shouldAutoFill(platform)) {
          await this.autoFillForm();
        }
      }
    } catch (error) {
      console.error('Error scanning page for forms:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async extractQuestionsFromPage() {
    const questions = [];
    const selectors = [
      'input[type="text"]',
      'input[type="email"]',
      'input[type="tel"]',
      'input[type="url"]',
      'textarea',
      'select',
      'input[type="radio"]',
      'input[type="checkbox"]'
    ];

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        const questionData = this.extractQuestionData(element);
        if (questionData && !this.isDuplicateQuestion(questionData, questions)) {
          questions.push(questionData);
        }
      });
    });

    return questions;
  }

  extractQuestionData(element) {
    const label = this.findLabelForElement(element);
    const placeholder = element.placeholder;
    const name = element.name;
    const id = element.id;
    
    const questionText = label || placeholder || name || id;
    
    if (!questionText || questionText.length < 3) {
      return null;
    }

    const questionHash = this.generateQuestionHash(questionText);
    const category = this.categorizeQuestion(questionText);

    return {
      element,
      questionText: questionText.trim(),
      questionHash,
      category,
      elementType: element.tagName.toLowerCase(),
      inputType: element.type || 'text',
      required: element.required || element.hasAttribute('required'),
      options: this.getSelectOptions(element)
    };
  }

  findLabelForElement(element) {
    // Try to find associated label
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent.trim();
    }

    // Look for parent label
    const parentLabel = element.closest('label');
    if (parentLabel) {
      return parentLabel.textContent.replace(element.value || '', '').trim();
    }

    // Look for nearby text (sibling or parent text)
    const parent = element.parentElement;
    if (parent) {
      const textNodes = this.getTextNodesNear(parent);
      if (textNodes.length > 0) {
        return textNodes[0].trim();
      }
    }

    return null;
  }

  getTextNodesNear(element) {
    const texts = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent.trim();
      if (text.length > 0 && !text.match(/^\s*$/)) {
        texts.push(text);
      }
    }

    return texts;
  }

  categorizeQuestion(questionText) {
    const lower = questionText.toLowerCase();
    
    const categories = {
      personal: ['name', 'address', 'phone', 'email', 'city', 'state', 'zip', 'country'],
      experience: ['experience', 'years', 'position', 'role', 'company', 'employer', 'work'],
      education: ['education', 'degree', 'school', 'university', 'college', 'gpa', 'graduation'],
      skills: ['skills', 'programming', 'language', 'technology', 'software', 'tool'],
      legal: ['authorization', 'visa', 'citizen', 'eligible', 'background', 'drug', 'security'],
      behavioral: ['why', 'describe', 'tell', 'explain', 'example', 'challenge', 'strength'],
      technical: ['algorithm', 'coding', 'technical', 'system', 'database', 'api']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lower.includes(keyword))) {
        return category;
      }
    }

    return 'custom';
  }

  generateQuestionHash(questionText) {
    // Simple hash function for question identification
    let hash = 0;
    for (let i = 0; i < questionText.length; i++) {
      const char = questionText.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  async processQuestions(questions) {
    const newQuestions = [];
    const existingQuestions = [];

    for (const question of questions) {
      if (this.userAnswers[question.questionHash]) {
        existingQuestions.push({
          ...question,
          answer: this.userAnswers[question.questionHash]
        });
      } else {
        newQuestions.push(question);
      }
    }

    if (newQuestions.length > 0) {
      // Notify user about new questions
      await this.notifyUserAboutNewQuestions(newQuestions);
    }

    // Store all questions for potential auto-fill
    this.currentPageQuestions = [...existingQuestions, ...newQuestions];
  }

  async notifyUserAboutNewQuestions(newQuestions) {
    // Send message to background script to show notification
    chrome.runtime.sendMessage({
      action: 'newQuestionsFound',
      questions: newQuestions.map(q => ({
        questionText: q.questionText,
        questionHash: q.questionHash,
        category: q.category,
        required: q.required
      })),
      url: window.location.href
    });
  }

  async autoFillForm() {
    console.log('Starting auto-fill process...');
    
    for (const questionData of this.currentPageQuestions) {
      if (questionData.answer && questionData.element) {
        await this.fillFormField(questionData.element, questionData.answer);
      }
    }
  }

  async fillFormField(element, value) {
    try {
      // Scroll to element
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Wait a bit for scroll
      await this.delay(500);

      // Focus on element
      element.focus();
      
      if (element.tagName.toLowerCase() === 'select') {
        this.selectOption(element, value);
      } else if (element.type === 'checkbox' || element.type === 'radio') {
        this.handleCheckboxRadio(element, value);
      } else {
        // Text input, textarea, etc.
        this.setInputValue(element, value);
      }

      // Trigger change events
      this.triggerEvents(element);
      
      await this.delay(300);
    } catch (error) {
      console.error('Error filling form field:', error);
    }
  }

  setInputValue(element, value) {
    // Clear existing value
    element.value = '';
    
    // Set new value
    element.value = value;
    
    // For React/Vue applications
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    ).set;
    nativeInputValueSetter.call(element, value);
  }

  selectOption(selectElement, value) {
    for (let option of selectElement.options) {
      if (option.text.toLowerCase().includes(value.toLowerCase()) ||
          option.value.toLowerCase().includes(value.toLowerCase())) {
        selectElement.value = option.value;
        break;
      }
    }
  }

  handleCheckboxRadio(element, value) {
    const lowerValue = value.toLowerCase();
    const shouldCheck = lowerValue === 'yes' || lowerValue === 'true' || lowerValue === '1';
    element.checked = shouldCheck;
  }

  triggerEvents(element) {
    const events = ['input', 'change', 'blur', 'keyup'];
    events.forEach(eventType => {
      const event = new Event(eventType, { bubbles: true });
      element.dispatchEvent(event);
    });
  }

  async loadUserAnswers() {
    try {
      const result = await chrome.storage.local.get('userAnswers');
      this.userAnswers = result.userAnswers || {};
    } catch (error) {
      console.error('Error loading user answers:', error);
      this.userAnswers = {};
    }
  }

  async saveUserAnswer(questionHash, answer) {
    this.userAnswers[questionHash] = answer;
    try {
      await chrome.storage.local.set({ userAnswers: this.userAnswers });
    } catch (error) {
      console.error('Error saving user answer:', error);
    }
  }

  shouldAutoFill(platform) {
    // Check user preferences for auto-fill
    return true; // For now, always allow auto-fill
  }

  getSelectOptions(element) {
    if (element.tagName.toLowerCase() !== 'select') {
      return [];
    }
    return Array.from(element.options).map(option => ({
      value: option.value,
      text: option.text
    }));
  }

  isDuplicateQuestion(questionData, existingQuestions) {
    return existingQuestions.some(q => q.questionHash === questionData.questionHash);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.action) {
        case 'startAutoFill':
          this.autoFillForm();
          break;
        case 'saveAnswer':
          this.saveUserAnswer(message.questionHash, message.answer);
          break;
        case 'getPageQuestions':
          sendResponse(this.currentPageQuestions);
          break;
      }
    });
  }
}

class PlatformDetector {
  detectPlatform(url) {
    const hostname = new URL(url).hostname.toLowerCase();
    
    const platforms = {
      'linkedin.com': 'linkedin',
      'indeed.com': 'indeed',
      'glassdoor.com': 'glassdoor',
      'handshake.com': 'handshake',
      'joinhandshake.com': 'handshake',
      'ziprecruiter.com': 'ziprecruiter',
      'dice.com': 'dice',
      'simplyhired.com': 'simplyhired',
      'lever.co': 'lever',
      'icims.com': 'icims',
      'workday.com': 'workday',
      'greenhouse.io': 'greenhouse',
      'ashbyhq.com': 'ashby',
      'rippling.com': 'rippling'
    };

    for (const [domain, platform] of Object.entries(platforms)) {
      if (hostname.includes(domain)) {
        return platform;
      }
    }

    return 'unknown';
  }
}

class IntelligentFormFiller {
  constructor() {
    this.standardAnswers = {
      'first_name': '',
      'last_name': '',
      'email': '',
      'phone': '',
      'address': '',
      'city': '',
      'state': '',
      'zip': '',
      'country': 'United States'
    };
  }

  async loadStandardAnswers() {
    try {
      const result = await chrome.storage.local.get('standardAnswers');
      this.standardAnswers = { ...this.standardAnswers, ...result.standardAnswers };
    } catch (error) {
      console.error('Error loading standard answers:', error);
    }
  }

  getAnswerForField(fieldName, questionText) {
    const lower = questionText.toLowerCase();
    
    // Map common questions to standard answers
    const mappings = {
      'first_name': ['first name', 'given name', 'fname'],
      'last_name': ['last name', 'surname', 'family name', 'lname'],
      'email': ['email', 'e-mail', 'email address'],
      'phone': ['phone', 'telephone', 'mobile', 'cell'],
      'address': ['address', 'street'],
      'city': ['city', 'town'],
      'state': ['state', 'province', 'region'],
      'zip': ['zip', 'postal', 'postcode'],
      'country': ['country', 'nation']
    };

    for (const [key, patterns] of Object.entries(mappings)) {
      if (patterns.some(pattern => lower.includes(pattern))) {
        return this.standardAnswers[key];
      }
    }

    return null;
  }
}

// Initialize the automator when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const automator = new EnhancedJobApplicationAutomator();
    automator.initialize();
  });
} else {
  const automator = new EnhancedJobApplicationAutomator();
  automator.initialize();
}

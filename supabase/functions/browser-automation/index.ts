
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BrowserAutomationRequest {
  action: 'initialize' | 'scrape_jobs' | 'submit_applications' | 'send_outreach_emails' | 'linkedin_connect' | 'get_task_status' | 'stop_task' | 'close_session';
  sessionId?: string;
  config?: any;
  userId?: string;
  platforms?: string[];
  searchCriteria?: any;
  jobUrls?: string[];
  userProfile?: any;
  resumeContent?: string;
  coverLetter?: string;
  contacts?: any[];
  emailTemplate?: string;
  personalizationData?: any;
  profiles?: any[];
  messageTemplate?: string;
  taskId?: string;
}

// Store active sessions and tasks in memory
const activeSessions = new Map<string, any>();
const activeTasks = new Map<string, any>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData: BrowserAutomationRequest = await req.json();
    
    switch (requestData.action) {
      case 'initialize':
        return await initializeBrowserSession(requestData, user.id);
      
      case 'scrape_jobs':
        return await scrapeJobs(requestData, user.id);
      
      case 'submit_applications':
        return await submitApplications(requestData, user.id);
      
      case 'send_outreach_emails':
        return await sendOutreachEmails(requestData, user.id);
      
      case 'linkedin_connect':
        return await linkedinConnect(requestData, user.id);
      
      case 'get_task_status':
        return await getTaskStatus(requestData);
      
      case 'stop_task':
        return await stopTask(requestData);
      
      case 'close_session':
        return await closeBrowserSession(requestData);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Browser automation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})

async function initializeBrowserSession(request: BrowserAutomationRequest, userId: string) {
  const sessionId = `session-${userId}-${Date.now()}`;
  
  // Initialize browser session (simulated for now)
  const session = {
    id: sessionId,
    userId,
    config: request.config,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  activeSessions.set(sessionId, session);
  
  console.log(`Initialized browser session ${sessionId} for user ${userId}`);
  
  return new Response(
    JSON.stringify({ sessionId, status: 'initialized' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function scrapeJobs(request: BrowserAutomationRequest, userId: string) {
  const { sessionId, platforms, searchCriteria, taskId } = request;
  
  if (!sessionId || !activeSessions.has(sessionId)) {
    return new Response(
      JSON.stringify({ error: 'Invalid session' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  const task = {
    id: taskId,
    type: 'job_scraping',
    status: 'running',
    sessionId,
    startedAt: new Date().toISOString(),
    progress: 0
  };
  
  activeTasks.set(taskId!, task);
  
  // Simulate job scraping with browser-use
  setTimeout(async () => {
    try {
      // Simulate AI-powered job scraping
      const mockResults = await simulateJobScraping(platforms!, searchCriteria);
      
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      task.results = mockResults;
      task.progress = 100;
      
      activeTasks.set(taskId!, task);
      
      console.log(`Job scraping completed for task ${taskId}: ${mockResults.jobsFound} jobs found`);
    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      activeTasks.set(taskId!, task);
      console.error(`Job scraping failed for task ${taskId}:`, error);
    }
  }, 5000); // Simulate 5 second processing time
  
  return new Response(
    JSON.stringify({ taskId, status: 'started' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function submitApplications(request: BrowserAutomationRequest, userId: string) {
  const { sessionId, jobUrls, userProfile, resumeContent, coverLetter, taskId } = request;
  
  if (!sessionId || !activeSessions.has(sessionId)) {
    return new Response(
      JSON.stringify({ error: 'Invalid session' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  const task = {
    id: taskId,
    type: 'application_submission',
    status: 'running',
    sessionId,
    startedAt: new Date().toISOString(),
    progress: 0
  };
  
  activeTasks.set(taskId!, task);
  
  // Simulate application submission with browser-use
  setTimeout(async () => {
    try {
      const results = await simulateApplicationSubmission(jobUrls!, userProfile, resumeContent!, coverLetter);
      
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      task.results = results;
      task.progress = 100;
      
      activeTasks.set(taskId!, task);
      
      console.log(`Application submission completed for task ${taskId}: ${results.applicationsSubmitted} applications submitted`);
    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      activeTasks.set(taskId!, task);
      console.error(`Application submission failed for task ${taskId}:`, error);
    }
  }, 8000); // Simulate 8 second processing time
  
  return new Response(
    JSON.stringify({ taskId, status: 'started' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function sendOutreachEmails(request: BrowserAutomationRequest, userId: string) {
  const { sessionId, contacts, emailTemplate, personalizationData, taskId } = request;
  
  if (!sessionId || !activeSessions.has(sessionId)) {
    return new Response(
      JSON.stringify({ error: 'Invalid session' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  const task = {
    id: taskId,
    type: 'email_outreach',
    status: 'running',
    sessionId,
    startedAt: new Date().toISOString(),
    progress: 0
  };
  
  activeTasks.set(taskId!, task);
  
  // Simulate email outreach
  setTimeout(async () => {
    try {
      const results = await simulateEmailOutreach(contacts!, emailTemplate!, personalizationData);
      
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      task.results = results;
      task.progress = 100;
      
      activeTasks.set(taskId!, task);
      
      console.log(`Email outreach completed for task ${taskId}: ${results.emailsSent} emails sent`);
    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      activeTasks.set(taskId!, task);
      console.error(`Email outreach failed for task ${taskId}:`, error);
    }
  }, 6000); // Simulate 6 second processing time
  
  return new Response(
    JSON.stringify({ taskId, status: 'started' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function linkedinConnect(request: BrowserAutomationRequest, userId: string) {
  const { sessionId, profiles, messageTemplate, taskId } = request;
  
  if (!sessionId || !activeSessions.has(sessionId)) {
    return new Response(
      JSON.stringify({ error: 'Invalid session' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  const task = {
    id: taskId,
    type: 'linkedin_connect',
    status: 'running',
    sessionId,
    startedAt: new Date().toISOString(),
    progress: 0
  };
  
  activeTasks.set(taskId!, task);
  
  // Simulate LinkedIn connections
  setTimeout(async () => {
    try {
      const results = await simulateLinkedInConnect(profiles!, messageTemplate!);
      
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      task.results = results;
      task.progress = 100;
      
      activeTasks.set(taskId!, task);
      
      console.log(`LinkedIn connections completed for task ${taskId}: ${results.connectionsRequested} connections requested`);
    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      activeTasks.set(taskId!, task);
      console.error(`LinkedIn connections failed for task ${taskId}:`, error);
    }
  }, 7000); // Simulate 7 second processing time
  
  return new Response(
    JSON.stringify({ taskId, status: 'started' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getTaskStatus(request: BrowserAutomationRequest) {
  const { taskId } = request;
  const task = activeTasks.get(taskId!);
  
  if (!task) {
    return new Response(
      JSON.stringify({ error: 'Task not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  return new Response(
    JSON.stringify({ task }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function stopTask(request: BrowserAutomationRequest) {
  const { taskId } = request;
  const task = activeTasks.get(taskId!);
  
  if (task && task.status === 'running') {
    task.status = 'stopped';
    task.stoppedAt = new Date().toISOString();
    activeTasks.set(taskId!, task);
  }
  
  return new Response(
    JSON.stringify({ status: 'stopped' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function closeBrowserSession(request: BrowserAutomationRequest) {
  const { sessionId } = request;
  
  if (sessionId && activeSessions.has(sessionId)) {
    activeSessions.delete(sessionId);
    
    // Stop all tasks for this session
    for (const [taskId, task] of activeTasks.entries()) {
      if (task.sessionId === sessionId && task.status === 'running') {
        task.status = 'stopped';
        task.stoppedAt = new Date().toISOString();
        activeTasks.set(taskId, task);
      }
    }
  }
  
  return new Response(
    JSON.stringify({ status: 'closed' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Simulation functions (replace with actual browser-use integration)
async function simulateJobScraping(platforms: string[], searchCriteria: any) {
  const jobsPerPlatform = Math.floor(Math.random() * 20) + 10;
  return {
    jobsFound: platforms.length * jobsPerPlatform,
    platformsSearched: platforms,
    searchCriteria,
    duration: Math.floor(Math.random() * 30) + 10
  };
}

async function simulateApplicationSubmission(jobUrls: string[], userProfile: any, resumeContent: string, coverLetter?: string) {
  const successRate = 0.8; // 80% success rate
  const applicationsSubmitted = Math.floor(jobUrls.length * successRate);
  
  return {
    applicationsSubmitted,
    totalAttempted: jobUrls.length,
    successRate: successRate * 100,
    failedApplications: jobUrls.length - applicationsSubmitted,
    duration: Math.floor(Math.random() * 60) + 30
  };
}

async function simulateEmailOutreach(contacts: any[], emailTemplate: string, personalizationData: any) {
  const successRate = 0.9; // 90% success rate for emails
  const emailsSent = Math.floor(contacts.length * successRate);
  
  return {
    emailsSent,
    totalContacts: contacts.length,
    successRate: successRate * 100,
    failedEmails: contacts.length - emailsSent,
    duration: Math.floor(Math.random() * 20) + 5
  };
}

async function simulateLinkedInConnect(profiles: any[], messageTemplate: string) {
  const successRate = 0.7; // 70% success rate for LinkedIn connections
  const connectionsRequested = Math.floor(profiles.length * successRate);
  
  return {
    connectionsRequested,
    totalProfiles: profiles.length,
    successRate: successRate * 100,
    failedConnections: profiles.length - connectionsRequested,
    duration: Math.floor(Math.random() * 40) + 20
  };
}

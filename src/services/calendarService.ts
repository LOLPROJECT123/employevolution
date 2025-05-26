
import { supabase } from '@/integrations/supabase/client';

export interface Interview {
  id: string;
  user_id: string;
  application_id?: string;
  company_name: string;
  position_title: string;
  interview_type: 'phone_screen' | 'video_call' | 'in_person' | 'technical' | 'behavioral' | 'final';
  scheduled_date: string;
  duration_minutes: number;
  location?: string;
  interviewer_name?: string;
  interviewer_email?: string;
  interviewer_phone?: string;
  notes?: string;
  preparation_notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show';
  outcome?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_type: 'application_deadline' | 'follow_up' | 'interview_prep' | 'interview_reminder' | 'custom';
  due_date: string;
  reminder_date: string;
  related_id?: string;
  related_type?: string;
  is_completed: boolean;
  is_sent: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface ApplicationEvent {
  id: string;
  user_id: string;
  application_id: string;
  event_type: 'applied' | 'viewed' | 'phone_screen' | 'interview' | 'follow_up' | 'offer' | 'rejection' | 'withdrawal';
  title: string;
  description?: string;
  event_date: string;
  created_at: string;
}

class CalendarService {
  // Interview Management
  async createInterview(interview: Omit<Interview, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Interview> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('interviews')
      .insert({
        ...interview,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create interview: ${error.message}`);
    return data as Interview;
  }

  async getInterviews(): Promise<Interview[]> {
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .order('scheduled_date', { ascending: true });

    if (error) throw new Error(`Failed to fetch interviews: ${error.message}`);
    return data as Interview[];
  }

  async updateInterview(id: string, updates: Partial<Interview>): Promise<void> {
    const { error } = await supabase
      .from('interviews')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(`Failed to update interview: ${error.message}`);
  }

  async deleteInterview(id: string): Promise<void> {
    const { error } = await supabase
      .from('interviews')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete interview: ${error.message}`);
  }

  // Reminder Management
  async createReminder(reminder: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Reminder> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('reminders')
      .insert({
        ...reminder,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create reminder: ${error.message}`);
    return data as Reminder;
  }

  async getReminders(): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) throw new Error(`Failed to fetch reminders: ${error.message}`);
    return data as Reminder[];
  }

  async getUpcomingReminders(days: number = 7): Promise<Reminder[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .gte('due_date', new Date().toISOString())
      .lte('due_date', futureDate.toISOString())
      .eq('is_completed', false)
      .order('due_date', { ascending: true });

    if (error) throw new Error(`Failed to fetch upcoming reminders: ${error.message}`);
    return data as Reminder[];
  }

  async updateReminder(id: string, updates: Partial<Reminder>): Promise<void> {
    const { error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(`Failed to update reminder: ${error.message}`);
  }

  async completeReminder(id: string): Promise<void> {
    await this.updateReminder(id, { is_completed: true });
  }

  async deleteReminder(id: string): Promise<void> {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete reminder: ${error.message}`);
  }

  // Application Events Management
  async createApplicationEvent(event: Omit<ApplicationEvent, 'id' | 'user_id' | 'created_at'>): Promise<ApplicationEvent> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('application_events')
      .insert({
        ...event,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create application event: ${error.message}`);
    return data as ApplicationEvent;
  }

  async getApplicationEvents(applicationId?: string): Promise<ApplicationEvent[]> {
    let query = supabase
      .from('application_events')
      .select('*')
      .order('event_date', { ascending: false });

    if (applicationId) {
      query = query.eq('application_id', applicationId);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch application events: ${error.message}`);
    return data as ApplicationEvent[];
  }

  // Calendar View Data
  async getCalendarData(startDate: string, endDate: string): Promise<{
    interviews: Interview[];
    reminders: Reminder[];
    events: ApplicationEvent[];
  }> {
    const [interviews, reminders, events] = await Promise.all([
      this.getInterviewsInRange(startDate, endDate),
      this.getRemindersInRange(startDate, endDate),
      this.getEventsInRange(startDate, endDate)
    ]);

    return { interviews, reminders, events };
  }

  private async getInterviewsInRange(startDate: string, endDate: string): Promise<Interview[]> {
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .order('scheduled_date', { ascending: true });

    if (error) throw new Error(`Failed to fetch interviews: ${error.message}`);
    return data as Interview[];
  }

  private async getRemindersInRange(startDate: string, endDate: string): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .gte('due_date', startDate)
      .lte('due_date', endDate)
      .eq('is_completed', false)
      .order('due_date', { ascending: true });

    if (error) throw new Error(`Failed to fetch reminders: ${error.message}`);
    return data as Reminder[];
  }

  private async getEventsInRange(startDate: string, endDate: string): Promise<ApplicationEvent[]> {
    const { data, error } = await supabase
      .from('application_events')
      .select('*')
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .order('event_date', { ascending: true });

    if (error) throw new Error(`Failed to fetch events: ${error.message}`);
    return data as ApplicationEvent[];
  }
}

export const calendarService = new CalendarService();

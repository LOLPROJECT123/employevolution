
export interface Communication {
  id: string;
  user_id: string;
  contact_id?: string;
  application_id?: string;
  communication_type: 'email' | 'phone' | 'video_call' | 'linkedin' | 'in_person';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content?: string;
  status: 'draft' | 'sent' | 'delivered' | 'opened' | 'replied' | 'bounced';
  sent_at?: string;
  response_received?: boolean;
  follow_up_required?: boolean;
  follow_up_date?: string;
  created_at: string;
  updated_at?: string;
  scheduled_for?: string;
  template_used?: string;
}

export interface Contact {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company_name: string;
  job_title?: string;
  linkedin_url?: string;
  contact_type: 'recruiter' | 'hiring_manager' | 'employee' | 'hr' | 'referral' | 'other';
  source?: string;
  notes?: string;
  relationship_strength: 'new' | 'warm' | 'strong' | 'close';
  tags?: string[];
  last_contacted?: string;
  created_at: string;
  updated_at?: string;
}

export const communicationService = {
  async getCommunications(): Promise<Communication[]> {
    // Mock data for now
    return [
      {
        id: '1',
        user_id: 'user-1',
        communication_type: 'email',
        direction: 'outbound',
        subject: 'Application for Software Engineer',
        content: 'Thank you for considering my application...',
        status: 'sent',
        sent_at: '2024-01-15T10:00:00Z',
        created_at: '2024-01-15T09:30:00Z'
      }
    ];
  },

  async getContacts(): Promise<Contact[]> {
    // Mock data for now
    return [
      {
        id: '1',
        user_id: 'user-1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@company.com',
        company_name: 'Tech Corp',
        job_title: 'Senior Engineer',
        contact_type: 'employee',
        relationship_strength: 'warm',
        created_at: '2024-01-10T00:00:00Z'
      }
    ];
  },

  async createContact(contactData: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Contact> {
    // Mock implementation
    const newContact: Contact = {
      id: Date.now().toString(),
      user_id: 'user-1',
      ...contactData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return newContact;
  },

  async updateContact(contactId: string, contactData: Partial<Contact>): Promise<Contact> {
    // Mock implementation
    const updatedContact: Contact = {
      id: contactId,
      user_id: 'user-1',
      first_name: 'Updated',
      last_name: 'Contact',
      email: 'updated@company.com',
      company_name: 'Updated Corp',
      contact_type: 'employee',
      relationship_strength: 'warm',
      created_at: '2024-01-10T00:00:00Z',
      updated_at: new Date().toISOString(),
      ...contactData
    };
    return updatedContact;
  },

  async deleteContact(contactId: string): Promise<void> {
    // Mock implementation
    console.log('Deleting contact:', contactId);
  }
};

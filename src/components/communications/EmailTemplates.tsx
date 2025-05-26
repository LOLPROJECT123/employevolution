
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Copy, Mail, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  variables: string[];
  is_default: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

// Type for database response
interface DatabaseEmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  variables: any; // Json type from database
  is_default: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const TEMPLATE_CATEGORIES = [
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'thank_you', label: 'Thank You' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'networking', label: 'Networking' },
  { value: 'referral_request', label: 'Referral Request' },
  { value: 'interview_request', label: 'Interview Request' },
  { value: 'custom', label: 'Custom' }
];

const DEFAULT_TEMPLATES = [
  {
    name: 'Follow-up After Application',
    category: 'follow_up',
    subject: 'Following up on my application for {{position}} at {{company}}',
    body: `Dear {{contact_name}},

I hope this email finds you well. I recently submitted my application for the {{position}} role at {{company}} and wanted to follow up to express my continued interest.

I am particularly excited about this opportunity because {{reason_for_interest}}. My background in {{relevant_experience}} aligns well with the requirements outlined in the job description.

I would welcome the opportunity to discuss how my skills and experience can contribute to your team. Would you be available for a brief call in the coming week?

Thank you for your time and consideration.

Best regards,
{{your_name}}`,
    variables: ['position', 'company', 'contact_name', 'reason_for_interest', 'relevant_experience', 'your_name']
  },
  {
    name: 'Thank You After Interview',
    category: 'thank_you',
    subject: 'Thank you for the {{position}} interview',
    body: `Dear {{interviewer_name}},

Thank you for taking the time to interview me for the {{position}} role at {{company}} yesterday. I enjoyed our conversation about {{discussion_topic}} and learning more about the team's goals.

Our discussion reinforced my enthusiasm for this opportunity, particularly {{specific_interest}}. I believe my experience in {{relevant_skill}} would enable me to make a meaningful contribution to your team.

Please let me know if you need any additional information from me. I look forward to hearing about the next steps in the process.

Best regards,
{{your_name}}`,
    variables: ['interviewer_name', 'position', 'company', 'discussion_topic', 'specific_interest', 'relevant_skill', 'your_name']
  },
  {
    name: 'Networking Introduction',
    category: 'networking',
    subject: 'Introduction and interest in {{company}}',
    body: `Hello {{contact_name}},

I hope this message finds you well. I came across your profile on {{platform}} and was impressed by your work at {{company}}.

I am currently {{your_situation}} and have been following {{company}}'s work in {{industry_area}}. I would love to learn more about your experience and the opportunities within your organization.

Would you be open to a brief 15-minute conversation over coffee or a phone call? I would greatly appreciate any insights you could share about {{specific_topic}}.

Thank you for your time and consideration.

Best regards,
{{your_name}}`,
    variables: ['contact_name', 'platform', 'company', 'your_situation', 'industry_area', 'specific_topic', 'your_name']
  }
];

const EmailTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'follow_up',
    subject: '',
    body: '',
    variables: [] as string[]
  });

  // Transform database response to EmailTemplate format
  const transformDatabaseTemplate = (dbTemplate: DatabaseEmailTemplate): EmailTemplate => {
    return {
      id: dbTemplate.id,
      name: dbTemplate.name,
      category: dbTemplate.category,
      subject: dbTemplate.subject,
      body: dbTemplate.body,
      variables: Array.isArray(dbTemplate.variables) ? dbTemplate.variables : [],
      is_default: dbTemplate.is_default,
      usage_count: dbTemplate.usage_count,
      created_at: dbTemplate.created_at,
      updated_at: dbTemplate.updated_at
    };
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to view your email templates.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        // Create default templates for new users
        await createDefaultTemplates(user.user.id);
        // Reload templates after creating defaults
        const { data: newData, error: newError } = await supabase
          .from('email_templates')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (newError) throw newError;
        const transformedTemplates = (newData || []).map(transformDatabaseTemplate);
        setTemplates(transformedTemplates);
      } else {
        const transformedTemplates = data.map(transformDatabaseTemplate);
        setTemplates(transformedTemplates);
      }
    } catch (error: any) {
      console.error('Error loading templates:', error);
      toast({
        title: "Failed to load templates",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultTemplates = async (userId: string) => {
    try {
      const templatesWithUserId = DEFAULT_TEMPLATES.map(template => ({
        ...template,
        user_id: userId,
        is_default: true
      }));

      const { error } = await supabase
        .from('email_templates')
        .insert(templatesWithUserId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error creating default templates:', error);
    }
  };

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    
    return [...new Set(matches.map(match => match.replace(/\{\{|\}\}/g, '')))];
  };

  const handleSaveTemplate = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const subjectVariables = extractVariables(formData.subject);
      const bodyVariables = extractVariables(formData.body);
      const allVariables = [...new Set([...subjectVariables, ...bodyVariables])];

      const templateData = {
        ...formData,
        variables: allVariables,
        user_id: user.user.id
      };

      if (isEditing && selectedTemplate) {
        const { error } = await supabase
          .from('email_templates')
          .update(templateData)
          .eq('id', selectedTemplate.id);

        if (error) throw error;
        
        toast({
          title: "Template updated",
          description: "Your email template has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert(templateData);

        if (error) throw error;
        
        toast({
          title: "Template created",
          description: "Your email template has been created successfully.",
        });
      }

      resetForm();
      loadTemplates();
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast({
        title: "Failed to save template",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (template: EmailTemplate) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: "Template deleted",
        description: "The email template has been deleted successfully.",
      });

      loadTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast({
        title: "Failed to delete template",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      subject: template.subject,
      body: template.body,
      variables: template.variables
    });
    setIsEditing(true);
  };

  const handleDuplicateTemplate = (template: EmailTemplate) => {
    setFormData({
      name: `${template.name} (Copy)`,
      category: template.category,
      subject: template.subject,
      body: template.body,
      variables: template.variables
    });
    setIsEditing(false);
    setSelectedTemplate(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'follow_up',
      subject: '',
      body: '',
      variables: []
    });
    setIsEditing(false);
    setSelectedTemplate(null);
  };

  const renderPreview = () => {
    if (!previewTemplate) return null;

    let previewSubject = previewTemplate.subject;
    let previewBody = previewTemplate.body;

    // Replace variables with preview values
    Object.entries(previewVariables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      previewSubject = previewSubject.replace(regex, value || `[${key}]`);
      previewBody = previewBody.replace(regex, value || `[${key}]`);
    });

    return (
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview: {previewTemplate.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Variable inputs */}
            <div className="grid grid-cols-2 gap-4">
              {previewTemplate.variables.map(variable => (
                <div key={variable}>
                  <Label htmlFor={variable}>{variable.replace('_', ' ')}</Label>
                  <Input
                    id={variable}
                    value={previewVariables[variable] || ''}
                    onChange={(e) => setPreviewVariables(prev => ({
                      ...prev,
                      [variable]: e.target.value
                    }))}
                    placeholder={`Enter ${variable}`}
                  />
                </div>
              ))}
            </div>

            {/* Email preview */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="mb-2">
                <strong>Subject:</strong> {previewSubject}
              </div>
              <div className="whitespace-pre-wrap">{previewBody}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading email templates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Email Templates</h2>
          <p className="text-muted-foreground">
            Create and manage reusable email templates for your job search communications.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit Template' : 'Create New Template'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Use {{variable}} for dynamic content"
                />
              </div>

              <div>
                <Label htmlFor="body">Email Body</Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Use {{variable}} for dynamic content"
                  rows={10}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate}>
                  {isEditing ? 'Update Template' : 'Create Template'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-sm transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">
                      {TEMPLATE_CATEGORIES.find(cat => cat.value === template.category)?.label}
                    </Badge>
                    {template.is_default && (
                      <Badge variant="outline">Default</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Subject:</p>
                  <p className="text-sm truncate">{template.subject}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Variables ({template.variables.length}):</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.variables.slice(0, 3).map(variable => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                    {template.variables.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.variables.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    Used {template.usage_count} times
                  </span>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setPreviewTemplate(template);
                        setPreviewVariables({});
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    {!template.is_default && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTemplate(template)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No templates yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first email template to streamline your job search communications.
            </p>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}

      {renderPreview()}
    </div>
  );
};

export default EmailTemplates;

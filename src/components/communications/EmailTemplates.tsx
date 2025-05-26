
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Copy, Mail } from 'lucide-react';
import { communicationService, EmailTemplate } from '@/services/communicationService';
import { toast } from '@/hooks/use-toast';

const EmailTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await communicationService.getEmailTemplates();
      
      // If no templates exist, create default ones
      if (data.length === 0) {
        await communicationService.createDefaultTemplates();
        const newData = await communicationService.getEmailTemplates();
        setTemplates(newData);
      } else {
        setTemplates(data);
      }
    } catch (error) {
      toast({
        title: "Failed to load templates",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (templateData: Partial<EmailTemplate>) => {
    try {
      await communicationService.createEmailTemplate(templateData as Omit<EmailTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>);
      await loadTemplates();
      setShowCreateDialog(false);
      toast({
        title: "Template created",
        description: "Email template has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to create template",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTemplate = async (templateData: Partial<EmailTemplate>) => {
    if (!editingTemplate) return;
    
    try {
      await communicationService.updateEmailTemplate(editingTemplate.id, templateData);
      await loadTemplates();
      setEditingTemplate(null);
      toast({
        title: "Template updated",
        description: "Email template has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update template",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await communicationService.deleteEmailTemplate(templateId);
      await loadTemplates();
      toast({
        title: "Template deleted",
        description: "Email template has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete template",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const categoryColors: Record<string, string> = {
    follow_up: 'bg-blue-100 text-blue-800',
    thank_you: 'bg-green-100 text-green-800',
    withdrawal: 'bg-red-100 text-red-800',
    networking: 'bg-purple-100 text-purple-800',
    referral_request: 'bg-orange-100 text-orange-800',
    interview_request: 'bg-yellow-100 text-yellow-800',
    custom: 'bg-gray-100 text-gray-800'
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading templates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="follow_up">Follow-up</SelectItem>
              <SelectItem value="thank_you">Thank You</SelectItem>
              <SelectItem value="networking">Networking</SelectItem>
              <SelectItem value="referral_request">Referral Request</SelectItem>
              <SelectItem value="interview_request">Interview Request</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Email Template</DialogTitle>
            </DialogHeader>
            <TemplateForm onSubmit={handleCreateTemplate} onCancel={() => setShowCreateDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge className={categoryColors[template.category]} variant="secondary">
                    {template.category.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTemplate(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{template.subject}</p>
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                {template.body.substring(0, 120)}...
              </p>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Used {template.usage_count} times</span>
                {template.is_default && <Badge variant="outline">Default</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingTemplate && (
        <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Email Template</DialogTitle>
            </DialogHeader>
            <TemplateForm 
              template={editingTemplate}
              onSubmit={handleUpdateTemplate} 
              onCancel={() => setEditingTemplate(null)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Template Form Component
interface TemplateFormProps {
  template?: EmailTemplate;
  onSubmit: (data: Partial<EmailTemplate>) => void;
  onCancel: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ template, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    category: template?.category || 'custom',
    subject: template?.subject || '',
    body: template?.body || '',
    variables: template?.variables || [],
    is_default: template?.is_default || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="follow_up">Follow-up</SelectItem>
              <SelectItem value="thank_you">Thank You</SelectItem>
              <SelectItem value="networking">Networking</SelectItem>
              <SelectItem value="referral_request">Referral Request</SelectItem>
              <SelectItem value="interview_request">Interview Request</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="subject">Subject Line</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="body">Email Body</Label>
        <Textarea
          id="body"
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          rows={10}
          required
        />
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>Use variables like {{company}}, {{position}}, {{contact_name}} in your template.</p>
        <p>Available variables will be populated when composing emails.</p>
      </div>
      
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {template ? 'Update' : 'Create'} Template
        </Button>
      </div>
    </form>
  );
};

export default EmailTemplates;

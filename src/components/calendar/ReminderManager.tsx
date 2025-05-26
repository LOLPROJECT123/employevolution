
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { calendarService, Reminder } from '@/services/calendarService';
import { toast } from '@/hooks/use-toast';

interface ReminderManagerProps {
  open: boolean;
  onClose: () => void;
  onReminderCreated: (reminder: Reminder) => void;
}

const ReminderManager: React.FC<ReminderManagerProps> = ({
  open,
  onClose,
  onReminderCreated
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminder_type: 'custom' as Reminder['reminder_type'],
    due_date: new Date(),
    due_time: '09:00',
    reminder_date: new Date(),
    reminder_time: '09:00',
    priority: 'medium' as Reminder['priority']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const dueDateTime = new Date(formData.due_date);
      const [dueHours, dueMinutes] = formData.due_time.split(':');
      dueDateTime.setHours(parseInt(dueHours), parseInt(dueMinutes));

      const reminderDateTime = new Date(formData.reminder_date);
      const [reminderHours, reminderMinutes] = formData.reminder_time.split(':');
      reminderDateTime.setHours(parseInt(reminderHours), parseInt(reminderMinutes));

      const reminder = await calendarService.createReminder({
        title: formData.title,
        description: formData.description || undefined,
        reminder_type: formData.reminder_type,
        due_date: dueDateTime.toISOString(),
        reminder_date: reminderDateTime.toISOString(),
        priority: formData.priority,
        is_completed: false,
        is_sent: false
      });

      onReminderCreated(reminder);
      onClose();
      
      toast({
        title: "Reminder created",
        description: `Reminder "${formData.title}" has been created for ${format(dueDateTime, 'PPP p')}.`,
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        reminder_type: 'custom',
        due_date: new Date(),
        due_time: '09:00',
        reminder_date: new Date(),
        reminder_time: '09:00',
        priority: 'medium'
      });
    } catch (error) {
      toast({
        title: "Failed to create reminder",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Reminder</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Follow up with Google"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about this reminder..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Reminder Type</Label>
              <Select
                value={formData.reminder_type}
                onValueChange={(value: Reminder['reminder_type']) =>
                  setFormData({ ...formData, reminder_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="application_deadline">Application Deadline</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="interview_prep">Interview Preparation</SelectItem>
                  <SelectItem value="interview_reminder">Interview Reminder</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: Reminder['priority']) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Due Date & Time</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.due_date, "MMM dd")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.due_date}
                      onSelect={(date) => date && setFormData({ ...formData, due_date: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={formData.due_time}
                  onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Reminder Date & Time</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.reminder_date, "MMM dd")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.reminder_date}
                      onSelect={(date) => date && setFormData({ ...formData, reminder_date: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={formData.reminder_time}
                  onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Reminder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderManager;

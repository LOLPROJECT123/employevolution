
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { calendarService, Interview } from '@/services/calendarService';
import { toast } from '@/hooks/use-toast';

interface InterviewSchedulerProps {
  open: boolean;
  onClose: () => void;
  onInterviewCreated: (interview: Interview) => void;
  prefillData?: {
    companyName?: string;
    positionTitle?: string;
    applicationId?: string;
  };
}

const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({
  open,
  onClose,
  onInterviewCreated,
  prefillData
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: prefillData?.companyName || '',
    position_title: prefillData?.positionTitle || '',
    interview_type: 'video_call' as Interview['interview_type'],
    scheduled_date: new Date(),
    scheduled_time: '09:00',
    duration_minutes: 60,
    location: '',
    interviewer_name: '',
    interviewer_email: '',
    interviewer_phone: '',
    notes: '',
    preparation_notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const scheduledDateTime = new Date(formData.scheduled_date);
      const [hours, minutes] = formData.scheduled_time.split(':');
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

      const interview = await calendarService.createInterview({
        application_id: prefillData?.applicationId,
        company_name: formData.company_name,
        position_title: formData.position_title,
        interview_type: formData.interview_type,
        scheduled_date: scheduledDateTime.toISOString(),
        duration_minutes: formData.duration_minutes,
        location: formData.location || undefined,
        interviewer_name: formData.interviewer_name || undefined,
        interviewer_email: formData.interviewer_email || undefined,
        interviewer_phone: formData.interviewer_phone || undefined,
        notes: formData.notes || undefined,
        preparation_notes: formData.preparation_notes || undefined,
        status: 'scheduled',
        follow_up_required: false
      });

      onInterviewCreated(interview);
      onClose();
      
      toast({
        title: "Interview scheduled",
        description: `Interview with ${formData.company_name} has been scheduled for ${format(scheduledDateTime, 'PPP p')}.`,
      });
    } catch (error) {
      toast({
        title: "Failed to schedule interview",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position_title">Position Title *</Label>
              <Input
                id="position_title"
                value={formData.position_title}
                onChange={(e) => setFormData({ ...formData, position_title: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Interview Type *</Label>
            <Select
              value={formData.interview_type}
              onValueChange={(value: Interview['interview_type']) =>
                setFormData({ ...formData, interview_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone_screen">Phone Screen</SelectItem>
                <SelectItem value="video_call">Video Call</SelectItem>
                <SelectItem value="in_person">In Person</SelectItem>
                <SelectItem value="technical">Technical Interview</SelectItem>
                <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                <SelectItem value="final">Final Interview</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.scheduled_date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.scheduled_date}
                    onSelect={(date) => date && setFormData({ ...formData, scheduled_date: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled_time">Time *</Label>
              <Input
                id="scheduled_time"
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
              <Input
                id="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                min="15"
                max="480"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location / Link</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Meeting link, address, or phone number"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interviewer_name">Interviewer Name</Label>
              <Input
                id="interviewer_name"
                value={formData.interviewer_name}
                onChange={(e) => setFormData({ ...formData, interviewer_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interviewer_email">Interviewer Email</Label>
              <Input
                id="interviewer_email"
                type="email"
                value={formData.interviewer_email}
                onChange={(e) => setFormData({ ...formData, interviewer_email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interviewer_phone">Interviewer Phone</Label>
              <Input
                id="interviewer_phone"
                value={formData.interviewer_phone}
                onChange={(e) => setFormData({ ...formData, interviewer_phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Interview Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about the interview..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preparation_notes">Preparation Notes</Label>
            <Textarea
              id="preparation_notes"
              value={formData.preparation_notes}
              onChange={(e) => setFormData({ ...formData, preparation_notes: e.target.value })}
              placeholder="Notes for interview preparation..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Interview"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewScheduler;

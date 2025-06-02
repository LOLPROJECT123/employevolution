
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bookmark, Clock, ExternalLink, Trash2 } from 'lucide-react';

interface SavedAndAppliedJobsProps {
  onJobSelect?: (job: any) => void;
}

export const SavedAndAppliedJobs: React.FC<SavedAndAppliedJobsProps> = ({ onJobSelect }) => {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'saved' | 'applied'>('saved');

  useEffect(() => {
    if (user) {
      loadJobs();
    }
  }, [user]);

  const loadJobs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [savedResponse, appliedResponse] = await Promise.all([
        supabase.from('saved_jobs').select('*').eq('user_id', user.id),
        supabase.from('job_applications').select('*').eq('user_id', user.id)
      ]);

      if (savedResponse.data) {
        setSavedJobs(savedResponse.data);
      }

      if (appliedResponse.data) {
        setAppliedJobs(appliedResponse.data);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSavedJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      toast.success('Job removed from saved list');
    } catch (error) {
      console.error('Failed to remove saved job:', error);
      toast.error('Failed to remove job');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'interview_scheduled': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'offer_received': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Loading jobs...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bookmark className="h-5 w-5" />
          <span>My Jobs</span>
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'saved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('saved')}
          >
            Saved ({savedJobs.length})
          </Button>
          <Button
            variant={activeTab === 'applied' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('applied')}
          >
            Applied ({appliedJobs.length})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'saved' && (
          <div className="space-y-3">
            {savedJobs.map((savedJob) => {
              const jobData = savedJob.job_data;
              return (
                <div key={savedJob.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{jobData.title}</h3>
                      <p className="text-sm text-muted-foreground">{jobData.company}</p>
                      <p className="text-sm text-muted-foreground">{jobData.location}</p>
                      {savedJob.notes && (
                        <p className="text-sm text-blue-600 mt-1">{savedJob.notes}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onJobSelect?.(jobData)}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveSavedJob(savedJob.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Saved {new Date(savedJob.saved_at).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
            
            {savedJobs.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                No saved jobs yet. Start saving jobs you're interested in!
              </div>
            )}
          </div>
        )}

        {activeTab === 'applied' && (
          <div className="space-y-3">
            {appliedJobs.map((application) => (
              <div key={application.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium">{application.job_id}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getStatusColor(application.status)}>
                        {application.status.replace('_', ' ')}
                      </Badge>
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Applied {new Date(application.applied_at).toLocaleDateString()}
                      </span>
                    </div>
                    {application.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{application.notes}</p>
                    )}
                  </div>
                </div>
                
                {application.interview_date && (
                  <div className="mt-2 text-sm text-green-600">
                    Interview: {new Date(application.interview_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
            
            {appliedJobs.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                No applications yet. Start applying to jobs!
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedAndAppliedJobs;

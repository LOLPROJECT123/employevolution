
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MobileHeader from '@/components/MobileHeader';
import { useMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabaseApplicationService } from '@/services/supabaseApplicationService';
import { Calendar, MapPin, DollarSign, Clock, Building } from 'lucide-react';

interface Application {
  id: string;
  job_id: string;
  user_id: string;
  status: string;
  applied_at: string;
  updated_at: string;
  notes?: string;
  resume_version?: string;
  cover_letter?: string;
  follow_up_date?: string;
  interview_date?: string;
  salary_offered?: number;
  contact_person?: string;
  application_url?: string;
}

const Applications = () => {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user]);

  const loadApplications = async () => {
    if (!user) return;
    
    try {
      const userApplications = await supabaseApplicationService.getUserApplications(user.id);
      setApplications(userApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-yellow-100 text-yellow-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {!isMobile && <Navbar />}
        {isMobile && <MobileHeader />}
        <div className="container mx-auto px-4 py-8">
          <p>Please log in to view your applications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader />}
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Applications</h1>
          <p className="text-muted-foreground">
            Track your job applications and their status
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p>Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">No applications found</p>
              <Button onClick={() => window.location.href = '/jobs'}>
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((application) => (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        Application #{application.job_id.slice(-6)}
                      </CardTitle>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Applied: {formatDate(application.applied_at)}
                  </div>
                  
                  {application.resume_version && (
                    <div className="text-sm">
                      <span className="font-medium">Resume:</span> {application.resume_version}
                    </div>
                  )}
                  
                  {application.contact_person && (
                    <div className="text-sm">
                      <span className="font-medium">Contact:</span> {application.contact_person}
                    </div>
                  )}
                  
                  {application.follow_up_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Follow up: {formatDate(application.follow_up_date)}
                    </div>
                  )}
                  
                  {application.interview_date && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Calendar className="h-4 w-4" />
                      Interview: {formatDate(application.interview_date)}
                    </div>
                  )}
                  
                  {application.salary_offered && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <DollarSign className="h-4 w-4" />
                      Offer: ${application.salary_offered.toLocaleString()}
                    </div>
                  )}
                  
                  {application.notes && (
                    <div className="text-sm">
                      <span className="font-medium">Notes:</span>
                      <p className="text-muted-foreground mt-1">{application.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;

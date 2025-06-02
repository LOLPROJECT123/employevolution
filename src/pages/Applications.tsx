import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ContextAwareNavigationSuggestions } from "@/components/navigation/ContextAwareNavigationSuggestions";
import { GestureEnabledJobCard } from "@/components/jobs/GestureEnabledJobCard";
import { useVoiceCommands } from "@/hooks/useVoiceCommands";
import { NavigationAnalyticsService } from "@/services/navigationAnalyticsService";
import { useAuth } from "@/hooks/useAuth";
import { useDatabase } from "@/hooks/useDatabase";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Mic
} from "lucide-react";

const Applications = () => {
  const { user } = useAuth();
  const { fetchJobApplications, saveJobApplication } = useDatabase();
  const [applications, setApplications] = useState<any[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showAddApplication, setShowAddApplication] = useState(false);

  // Voice command integration
  const { 
    isListening, 
    transcript, 
    startListening, 
    isSupported: voiceSupported 
  } = useVoiceCommands({
    onSearchChange: handleVoiceSearch,
    onFiltersChange: handleVoiceFilters
  });

  useEffect(() => {
    // Track navigation to applications page
    NavigationAnalyticsService.trackNavigationPatterns(
      window.location.pathname,
      '/applications',
      'direct'
    );
    
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchQuery, statusFilter]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await fetchJobApplications();
      
      // Add mock applications if none exist
      if (data.length === 0) {
        const mockApplications = [
          {
            id: "1",
            job_id: "job_1",
            company: "TechCorp Inc.",
            position: "Senior React Developer",
            location: "San Francisco, CA",
            status: "interview_scheduled",
            applied_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            interview_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            contact_person: "Jane Smith",
            application_url: "https://techcorp.com/careers/123",
            notes: "Great company culture, exciting tech stack"
          },
          {
            id: "2",
            job_id: "job_2",
            company: "StartupXYZ",
            position: "Full Stack Engineer", 
            location: "New York, NY",
            status: "under_review",
            applied_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            contact_person: "John Doe",
            application_url: "https://startupxyz.com/jobs/456",
            notes: "Fast-paced environment, equity opportunity"
          },
          {
            id: "3",
            job_id: "job_3",
            company: "BigTech Corp",
            position: "Software Engineer",
            location: "Seattle, WA", 
            status: "rejected",
            applied_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
            contact_person: "Sarah Wilson",
            notes: "Good interview experience, learned a lot"
          }
        ];
        
        setApplications(mockApplications);
      } else {
        setApplications(data);
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    if (searchQuery) {
      filtered = filtered.filter(app =>
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  const handleVoiceSearch = (query: string) => {
    setSearchQuery(query);
    toast.success(`Voice search: "${query}"`);
    
    // Track voice search
    NavigationAnalyticsService.trackNavigationPatterns(
      '/applications',
      `/applications?search=${query}`,
      'voice'
    );
  };

  const handleVoiceFilters = (filters: any) => {
    if (filters.status) {
      setStatusFilter(filters.status);
      toast.success(`Filter applied: ${filters.status}`);
    }
  };

  const handleSwipeAction = async (applicationId: string, action: 'archive' | 'follow_up' | 'update') => {
    try {
      // Track gesture interaction
      NavigationAnalyticsService.trackNavigationPatterns(
        `/applications/${applicationId}`,
        `/applications/${applicationId}?action=${action}`,
        'gesture'
      );

      switch (action) {
        case 'archive':
          setApplications(prev => prev.filter(app => app.id !== applicationId));
          toast.success('Application archived');
          break;
        case 'follow_up':
          // Navigate to communications or create follow-up
          toast.success('Follow-up reminder created');
          break;
        case 'update':
          // Open update dialog
          toast.success('Update application status');
          break;
      }
    } catch (error) {
      console.error('Swipe action failed:', error);
      toast.error('Action failed');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'interview_scheduled': return <Calendar className="h-4 w-4" />;
      case 'offer_received': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading applications...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Context-aware navigation suggestions */}
      <ContextAwareNavigationSuggestions currentPage="/applications" />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">
            Track and manage your job applications with smart features
          </p>
        </div>
        
        <Dialog open={showAddApplication} onOpenChange={setShowAddApplication}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Application</DialogTitle>
              <DialogDescription>
                Record a new job application manually
              </DialogDescription>
            </DialogHeader>
            {/* Add application form would go here */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {voiceSupported && (
            <Button
              variant="outline"
              onClick={startListening}
              className={isListening ? 'bg-red-50 border-red-200' : ''}
            >
              <Mic className={`h-4 w-4 ${isListening ? 'text-red-500' : ''}`} />
            </Button>
          )}
        </div>
        
        {transcript && (
          <div className="text-sm text-muted-foreground">
            Voice input: "{transcript}"
          </div>
        )}

        <div className="flex space-x-2">
          {['all', 'applied', 'under_review', 'interview_scheduled', 'rejected', 'offer_received'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Button>
          ))}
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApplications.map((application) => (
          <GestureEnabledJobCard
            key={application.id}
            job={application}
            onSwipeAction={(action) => handleSwipeAction(application.id, action)}
          >
            <Card className="h-full hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{application.position}</CardTitle>
                    <CardDescription className="flex items-center space-x-1">
                      <Building className="h-4 w-4" />
                      <span>{application.company}</span>
                    </CardDescription>
                  </div>
                  
                  <Badge className={getStatusColor(application.status)}>
                    {getStatusIcon(application.status)}
                    <span className="ml-1">{application.status.replace('_', ' ')}</span>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{application.location}</span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Applied: {new Date(application.applied_at).toLocaleDateString()}
                </div>
                
                {application.interview_date && (
                  <div className="text-sm text-green-600 font-medium">
                    Interview: {new Date(application.interview_date).toLocaleDateString()}
                  </div>
                )}
                
                {application.contact_person && (
                  <div className="text-sm">
                    <span className="font-medium">Contact:</span> {application.contact_person}
                  </div>
                )}
                
                {application.notes && (
                  <div className="text-sm text-muted-foreground">
                    {application.notes.length > 100 
                      ? `${application.notes.substring(0, 100)}...`
                      : application.notes
                    }
                  </div>
                )}
                
                <div className="flex space-x-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Mail className="h-4 w-4 mr-1" />
                    Follow Up
                  </Button>
                  
                  {application.interview_date && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <Phone className="h-4 w-4 mr-1" />
                      Interview
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </GestureEnabledJobCard>
        ))}
      </div>
      
      {filteredApplications.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <div className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No applications match your search criteria.' 
                  : 'No applications yet. Start applying to jobs!'
                }
              </div>
              {!searchQuery && statusFilter === 'all' && (
                <Button onClick={() => window.location.href = '/jobs'}>
                  Browse Jobs
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Gesture Instructions */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        💡 Tip: Swipe left to archive, swipe right to follow up, or use voice commands
      </div>
    </div>
  );
};

export default Applications;

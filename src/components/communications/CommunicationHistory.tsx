
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, Video, User, Calendar } from 'lucide-react';
import { communicationService, Communication } from '@/services/communicationService';
import { formatDate, formatRelativeTime } from '@/utils/dateUtils';
import { toast } from '@/hooks/use-toast';

const CommunicationHistory: React.FC = () => {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDirection, setFilterDirection] = useState<string>('all');

  useEffect(() => {
    loadCommunications();
  }, []);

  const loadCommunications = async () => {
    try {
      setLoading(true);
      const data = await communicationService.getCommunications();
      setCommunications(data);
    } catch (error) {
      toast({
        title: "Failed to load communications",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: Communication['communication_type']) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'video_call': return <Video className="h-4 w-4" />;
      case 'linkedin': return <User className="h-4 w-4" />;
      case 'in_person': return <Calendar className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Communication['status']) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'opened': return 'bg-purple-100 text-purple-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'bounced': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDirectionColor = (direction: Communication['direction']) => {
    return direction === 'outbound' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesType = filterType === 'all' || comm.communication_type === filterType;
    const matchesDirection = filterDirection === 'all' || comm.direction === filterDirection;
    return matchesType && matchesDirection;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading communication history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone">Phone</SelectItem>
            <SelectItem value="video_call">Video Call</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="in_person">In Person</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterDirection} onValueChange={setFilterDirection}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Directions</SelectItem>
            <SelectItem value="outbound">Outbound</SelectItem>
            <SelectItem value="inbound">Inbound</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredCommunications.length > 0 ? (
        <div className="space-y-4">
          {filteredCommunications.map((comm) => (
            <Card key={comm.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-gray-100 rounded-full">
                      {getIcon(comm.communication_type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{comm.subject || 'No subject'}</h3>
                        <Badge className={getDirectionColor(comm.direction)} variant="secondary">
                          {comm.direction}
                        </Badge>
                        <Badge className={getStatusColor(comm.status)} variant="secondary">
                          {comm.status}
                        </Badge>
                      </div>
                      
                      {comm.content && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {comm.content}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatDate(comm.created_at)}</span>
                        <span>{formatRelativeTime(comm.created_at)}</span>
                        {comm.sent_at && (
                          <span>Sent: {formatDate(comm.sent_at)}</span>
                        )}
                      </div>
                      
                      {comm.follow_up_required && comm.follow_up_date && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            Follow-up due: {formatDate(comm.follow_up_date)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground capitalize">
                    {comm.communication_type.replace('_', ' ')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No communications found</h3>
            <p className="text-muted-foreground">
              {filterType !== 'all' || filterDirection !== 'all' 
                ? 'No communications match your current filters.' 
                : 'Your communication history will appear here as you interact with contacts.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommunicationHistory;

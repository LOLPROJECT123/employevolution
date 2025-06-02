
import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Video, 
  Plus,
  Send,
  Search,
  Filter,
  Calendar,
  User,
  Building,
  Clock
} from 'lucide-react';

interface Communication {
  id: string;
  type: 'email' | 'call' | 'video' | 'message';
  direction: 'inbound' | 'outbound';
  contact: string;
  company: string;
  subject: string;
  content?: string;
  date: string;
  status: 'sent' | 'received' | 'scheduled' | 'draft';
  applicationId?: string;
}

const sampleCommunications: Communication[] = [
  {
    id: '1',
    type: 'email',
    direction: 'outbound',
    contact: 'Sarah Chen',
    company: 'Google',
    subject: 'Thank you for the interview - Software Engineer Position',
    content: 'Thank you for taking the time to speak with me today...',
    date: '2024-01-18T14:30:00Z',
    status: 'sent',
    applicationId: 'app1'
  },
  {
    id: '2',
    type: 'email',
    direction: 'inbound',
    contact: 'HR Team',
    company: 'Meta',
    subject: 'Interview Invitation - Product Manager Role',
    content: 'We are pleased to invite you for an interview...',
    date: '2024-01-17T10:15:00Z',
    status: 'received',
    applicationId: 'app2'
  },
  {
    id: '3',
    type: 'call',
    direction: 'outbound',
    contact: 'Mike Rodriguez',
    company: 'Spotify',
    subject: 'Follow-up call regarding application status',
    date: '2024-01-16T16:00:00Z',
    status: 'sent'
  }
];

const Communications = () => {
  const isMobile = useMobile();
  const [communications, setCommunications] = useState<Communication[]>(sampleCommunications);
  const [activeTab, setActiveTab] = useState('all');
  const [newMessage, setNewMessage] = useState({
    type: 'email' as const,
    contact: '',
    company: '',
    subject: '',
    content: ''
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'message': return <MessageCircle className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDirectionColor = (direction: string) => {
    return direction === 'outbound' ? 'text-blue-600' : 'text-green-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.contact || !newMessage.subject) return;

    const message: Communication = {
      id: Date.now().toString(),
      type: newMessage.type,
      direction: 'outbound',
      contact: newMessage.contact,
      company: newMessage.company,
      subject: newMessage.subject,
      content: newMessage.content,
      date: new Date().toISOString(),
      status: 'sent'
    };

    setCommunications([message, ...communications]);
    setNewMessage({ type: 'email', contact: '', company: '', subject: '', content: '' });
    setActiveTab('all');
  };

  const filteredCommunications = communications.filter(comm => {
    if (activeTab === 'all') return true;
    if (activeTab === 'emails') return comm.type === 'email';
    if (activeTab === 'calls') return comm.type === 'call' || comm.type === 'video';
    if (activeTab === 'sent') return comm.direction === 'outbound';
    if (activeTab === 'received') return comm.direction === 'inbound';
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader title="Communications" />}
      
      <div className="bg-blue-600 dark:bg-blue-900 py-4 px-4 md:py-6 md:px-6">
        <div className="container mx-auto max-w-screen-xl">
          <h1 className="text-xl md:text-3xl font-bold text-white">
            Communications
          </h1>
          <p className="text-blue-100 mt-2">
            Manage all your professional communications in one place
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-screen-xl py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="emails">Emails</TabsTrigger>
              <TabsTrigger value="calls">Calls</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="received">Received</TabsTrigger>
            </TabsList>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Communications List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Communications</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                        <Input placeholder="Search communications..." className="pl-9 w-64" />
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredCommunications.map((comm) => (
                      <div key={comm.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${getStatusColor(comm.status)}`}>
                              {getTypeIcon(comm.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-medium">{comm.subject}</h3>
                                <Badge variant="outline" className={getDirectionColor(comm.direction)}>
                                  {comm.direction}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                <span className="flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  {comm.contact}
                                </span>
                                <span className="flex items-center">
                                  <Building className="h-4 w-4 mr-1" />
                                  {comm.company}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {formatDate(comm.date)}
                                </span>
                              </div>
                              {comm.content && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {comm.content}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge className={getStatusColor(comm.status)}>
                            {comm.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Communications</span>
                    <Badge variant="secondary">{communications.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">This Week</span>
                    <Badge variant="secondary">12</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending Responses</span>
                    <Badge variant="secondary">3</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Compose */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Compose</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="contact">Contact</Label>
                    <Input
                      id="contact"
                      placeholder="Recipient name"
                      value={newMessage.contact}
                      onChange={(e) => setNewMessage({ ...newMessage, contact: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      placeholder="Company name"
                      value={newMessage.company}
                      onChange={(e) => setNewMessage({ ...newMessage, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Email subject"
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Message</Label>
                    <Textarea
                      id="content"
                      placeholder="Your message..."
                      rows={3}
                      value={newMessage.content}
                      onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleSendMessage} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Contacts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Sarah Chen - Google', 'Mike Rodriguez - Spotify', 'HR Team - Meta'].map((contact, index) => (
                      <button 
                        key={index}
                        className="w-full text-left p-2 rounded hover:bg-accent transition-colors text-sm"
                      >
                        {contact}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Communications;

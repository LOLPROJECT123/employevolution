
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { linkedInCrawler } from "@/utils/linkedInCrawlerService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Clipboard, 
  Send, 
  LinkedinIcon, 
  User, 
  Users, 
  Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";

interface ContactPerson {
  name: string;
  title: string;
  company: string;
  profileUrl: string;
  connectionDegree: number;
  isAlumni?: boolean;
  isRecruiter?: boolean;
  school?: string;
  commonConnections?: number;
}

interface LinkedInOutreachPanelProps {
  companyName: string;
  jobTitle: string;
  onSendMessage?: (contact: ContactPerson, message: string) => void;
}

export default function LinkedInOutreachPanel({
  companyName,
  jobTitle,
  onSendMessage
}: LinkedInOutreachPanelProps) {
  const [recruiters, setRecruiters] = useState<ContactPerson[]>([]);
  const [alumni, setAlumni] = useState<ContactPerson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactPerson | null>(null);
  const [userMessage, setUserMessage] = useState("");
  const [userSchool, setUserSchool] = useState("Stanford University");
  const [activeTab, setActiveTab] = useState<string>("recruiters");
  
  useEffect(() => {
    if (companyName) {
      fetchContacts();
    }
  }, [companyName]);
  
  const fetchContacts = async () => {
    setIsLoading(true);
    
    try {
      // Find recruiters
      const foundRecruiters = await linkedInCrawler.findRecruiters(companyName);
      setRecruiters(foundRecruiters);
      
      // Find alumni
      const foundAlumni = await linkedInCrawler.findAlumni(companyName, userSchool);
      setAlumni(foundAlumni);
    } catch (error) {
      console.error("Error fetching LinkedIn contacts:", error);
      toast.error("Failed to find contacts on LinkedIn");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectContact = (contact: ContactPerson) => {
    setSelectedContact(contact);
    // Generate outreach message template
    const messageTemplate = linkedInCrawler.generateOutreachMessage(
      contact,
      jobTitle,
      !!contact.isAlumni
    );
    setUserMessage(messageTemplate);
  };
  
  const handleCopyMessage = () => {
    if (!userMessage) return;
    
    navigator.clipboard.writeText(userMessage)
      .then(() => {
        toast.success("Message copied to clipboard", {
          description: "Ready to paste in LinkedIn"
        });
      })
      .catch(() => {
        toast.error("Failed to copy message");
      });
  };
  
  const handleSendMessage = () => {
    if (!selectedContact || !userMessage) return;
    
    // Simulate sending message
    toast.loading("Preparing to send message...");
    
    setTimeout(() => {
      toast.success("Message ready to send", {
        description: "You'll be redirected to LinkedIn to complete sending this message"
      });
      
      // In a real implementation, we would open LinkedIn in a new tab
      window.open(selectedContact.profileUrl, '_blank');
      
      // Call the callback if provided
      if (onSendMessage) {
        onSendMessage(selectedContact, userMessage);
      }
    }, 1500);
  };
  
  const renderContactCard = (contact: ContactPerson) => {
    const initials = contact.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
    
    return (
      <Card 
        key={contact.name} 
        className={`mb-3 cursor-pointer hover:border-blue-400 transition-colors ${
          selectedContact?.name === contact.name ? 'border-blue-500 shadow-sm' : ''
        }`}
        onClick={() => handleSelectContact(contact)}
      >
        <CardContent className="p-4 flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${initials}`} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">{contact.name}</p>
                <p className="text-xs text-gray-500">{contact.title}</p>
              </div>
              
              <Badge variant="outline" className="text-xs">
                {contact.connectionDegree === 2 ? '2nd' : '3rd'} degree
              </Badge>
            </div>
            
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <Briefcase className="h-3 w-3" />
              <span>{contact.company}</span>
            </div>
            
            {contact.commonConnections !== undefined && contact.commonConnections > 0 && (
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                <Users className="h-3 w-3" />
                <span>{contact.commonConnections} mutual connection{contact.commonConnections !== 1 ? 's' : ''}</span>
              </div>
            )}
            
            {contact.isAlumni && contact.school && (
              <div className="mt-1">
                <Badge variant="secondary" className="text-xs">
                  {contact.school} alumni
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderOutreachPanel = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="outreachMessage" className="text-sm font-medium">
            Outreach Message
          </label>
          <Textarea 
            id="outreachMessage" 
            value={userMessage} 
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Type your message here..."
            className="h-40"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCopyMessage} className="mr-2">
            <Clipboard className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button onClick={handleSendMessage}>
            <Send className="mr-2 h-4 w-4" />
            Send via LinkedIn
          </Button>
        </DialogFooter>
      </div>
    );
  };
  
  const renderContactsList = (contacts: ContactPerson[]) => {
    if (contacts.length === 0) {
      return (
        <div className="py-8 text-center text-gray-500">
          <User className="mx-auto h-8 w-8 opacity-30 mb-2" />
          <p>No contacts found</p>
          <p className="text-sm">Try searching for a different company</p>
        </div>
      );
    }
    
    return (
      <ScrollArea className="h-64">
        {contacts.map(contact => renderContactCard(contact))}
      </ScrollArea>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <LinkedinIcon className="h-5 w-5 text-blue-600" />
          LinkedIn Connections
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="mb-4">
          <Button
            size="sm"
            onClick={fetchContacts}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? "Searching..." : "Find LinkedIn Contacts"}
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="recruiters" className="flex-1">
              Recruiters ({recruiters.length})
            </TabsTrigger>
            <TabsTrigger value="alumni" className="flex-1">
              Alumni ({alumni.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <TabsContent value="recruiters">
              {renderContactsList(recruiters)}
            </TabsContent>
            
            <TabsContent value="alumni">
              {renderContactsList(alumni)}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
      
      {selectedContact && (
        <CardFooter>
          {renderOutreachPanel()}
        </CardFooter>
      )}
    </Card>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Send, Linkedin, UserRound, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LinkedInContact, OutreachTemplate } from "@/types/resumePost";

interface LinkedInContactFinderProps {
  contacts: LinkedInContact[];
  isLoading: boolean;
  templates: OutreachTemplate[];
  onSaveTemplate: (template: OutreachTemplate) => void;
  onCreateTemplate: (template: Omit<OutreachTemplate, "id">) => void;
}

const LinkedInContactFinder = ({
  contacts,
  isLoading,
  templates,
  onSaveTemplate,
  onCreateTemplate
}: LinkedInContactFinderProps) => {
  const [contactType, setContactType] = useState<"all" | "recruiters" | "alumni">("all");
  const [selectedContact, setSelectedContact] = useState<LinkedInContact | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Omit<OutreachTemplate, "id">>({
    name: "",
    subject: "",
    body: "",
    type: "recruiter",
    variables: []
  });

  // Filter contacts based on selected type
  const filteredContacts = contacts.filter(contact => {
    if (contactType === "all") return true;
    if (contactType === "recruiters") return contact.title.toLowerCase().includes("recruit") || contact.title.toLowerCase().includes("talent") || contact.title.toLowerCase().includes("hiring");
    if (contactType === "alumni") return contact.isAlumni === true;
    return true;
  });

  // Handle selecting a contact to message
  const handleSelectContact = (contact: LinkedInContact) => {
    setSelectedContact(contact);
    setShowMessageDialog(true);
    
    // Reset message fields
    setMessageSubject("");
    setMessageBody("");
    setSelectedTemplate("");
  };

  // Apply template to message fields
  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template || !selectedContact) return;
    
    let subject = template.subject;
    let body = template.body;
    
    // Replace variables with actual values
    if (subject.includes("[Company]")) {
      subject = subject.replace(/\[Company\]/g, selectedContact.company);
    }
    
    if (subject.includes("[Position]")) {
      subject = subject.replace(/\[Position\]/g, "Software Engineer"); // Example position
    }
    
    if (body.includes("[Name]")) {
      body = body.replace(/\[Name\]/g, selectedContact.name.split(" ")[0]);
    }
    
    if (body.includes("[Company]")) {
      body = body.replace(/\[Company\]/g, selectedContact.company);
    }
    
    if (body.includes("[University]")) {
      body = body.replace(/\[University\]/g, "Stanford University"); // Example university
    }
    
    if (body.includes("[Position]")) {
      body = body.replace(/\[Position\]/g, "Software Engineer"); // Example position
    }
    
    if (body.includes("[Your Name]")) {
      body = body.replace(/\[Your Name\]/g, "Alex Johnson"); // Example name
    }
    
    if (body.includes("[specific aspect of the company]")) {
      body = body.replace(/\[specific aspect of the company\]/g, "innovative AI technology");
    }
    
    if (body.includes("[relevant skill/experience]")) {
      body = body.replace(/\[relevant skill\/experience\]/g, "machine learning and full-stack development");
    }
    
    setMessageSubject(subject);
    setMessageBody(body);
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (!selectedContact) return;
    
    toast.loading("Sending message...", {
      duration: 2000
    });
    
    // Simulate sending message
    setTimeout(() => {
      toast.success("Message sent successfully", {
        description: `Your message to ${selectedContact.name} has been sent.`
      });
      setShowMessageDialog(false);
    }, 2000);
  };

  // Handle creating a new template
  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.body) {
      toast.error("Please fill in all template fields");
      return;
    }
    
    // Extract variables from template
    const variables: string[] = [];
    const regex = /\[(.*?)\]/g;
    let match;
    
    while ((match = regex.exec(newTemplate.body)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    
    while ((match = regex.exec(newTemplate.subject)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    
    // Create new template with variables
    onCreateTemplate({
      ...newTemplate,
      variables
    });
    
    // Reset and close dialog
    setNewTemplate({
      name: "",
      subject: "",
      body: "",
      type: "recruiter",
      variables: []
    });
    setShowTemplateDialog(false);
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-lg font-medium">Searching LinkedIn...</p>
          <p className="text-sm text-muted-foreground">Finding relevant contacts for networking and outreach</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12">
          <UserRound className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">No LinkedIn Contacts Found</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            Apply to a job first to find relevant recruiters and alumni for networking.
          </p>
          <Button variant="outline" onClick={() => setContactType("all")}>
            <Linkedin className="h-4 w-4 mr-2" /> Connect LinkedIn
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <Tabs value={contactType} onValueChange={(value) => setContactType(value as "all" | "recruiters" | "alumni")}>
              <TabsList>
                <TabsTrigger value="all">All Contacts ({contacts.length})</TabsTrigger>
                <TabsTrigger value="recruiters">Recruiters ({contacts.filter(c => c.title.toLowerCase().includes("recruit") || c.title.toLowerCase().includes("talent")).length})</TabsTrigger>
                <TabsTrigger value="alumni">Alumni ({contacts.filter(c => c.isAlumni).length})</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Template
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Create New Outreach Template</DialogTitle>
                  <DialogDescription>
                    Create a template for outreach messages. Use [Variable] syntax for dynamic content.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="template-name" className="text-right text-sm">Name</label>
                    <Input
                      id="template-name"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      className="col-span-3"
                      placeholder="Recruiter Follow-Up"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="template-type" className="text-right text-sm">Type</label>
                    <select
                      id="template-type"
                      value={newTemplate.type}
                      onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as any })}
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="recruiter">Recruiter</option>
                      <option value="alumni">Alumni</option>
                      <option value="hiring-manager">Hiring Manager</option>
                      <option value="referral">Referral Request</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="template-subject" className="text-right text-sm">Subject</label>
                    <Input
                      id="template-subject"
                      value={newTemplate.subject}
                      onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                      className="col-span-3"
                      placeholder="Following Up on [Position] Application at [Company]"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <label htmlFor="template-body" className="text-right text-sm pt-2">Body</label>
                    <Textarea
                      id="template-body"
                      value={newTemplate.body}
                      onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                      className="col-span-3 min-h-[200px]"
                      placeholder="Hello [Name],\n\nI recently applied for the [Position] position at [Company]..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
                  <Button onClick={handleCreateTemplate}>Create Template</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <ScrollArea className="h-[400px] rounded-md border">
            <div className="p-4 grid grid-cols-1 gap-4">
              {filteredContacts.map((contact) => (
                <Card key={contact.id} className="overflow-hidden transition-all hover:shadow-md">
                  <div className="flex">
                    {contact.avatar ? (
                      <div className="w-16 h-16 overflow-hidden">
                        <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
                        <UserRound className="h-8 w-8 text-gray-500" />
                      </div>
                    )}
                    
                    <CardContent className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{contact.name}</h3>
                          <p className="text-sm text-muted-foreground">{contact.title} at {contact.company}</p>
                          
                          <div className="flex flex-wrap gap-1 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {contact.connectionDegree === 1 ? '1st' : contact.connectionDegree === 2 ? '2nd' : '3rd'} connection
                            </Badge>
                            
                            {contact.isAlumni && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">
                                Alumni
                                {contact.graduationYear && ` '${contact.graduationYear.slice(-2)}`}
                              </Badge>
                            )}
                            
                            {contact.title.toLowerCase().includes('recruit') && (
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                                Recruiter
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href={contact.profileUrl} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="h-4 w-4" />
                            </a>
                          </Button>
                          
                          <Button size="sm" onClick={() => handleSelectContact(contact)}>
                            <Mail className="h-4 w-4 mr-1" /> Message
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
              
              {filteredContacts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No contacts found for the selected filter.</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Message Dialog */}
          <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Send Message to {selectedContact?.name}</DialogTitle>
                <DialogDescription>
                  Craft a personalized message to help with your job application
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="template" className="text-right text-sm">Template</label>
                  <select
                    id="template"
                    value={selectedTemplate}
                    onChange={(e) => {
                      setSelectedTemplate(e.target.value);
                      if (e.target.value) {
                        applyTemplate(e.target.value);
                      }
                    }}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a template</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="subject" className="text-right text-sm">Subject</label>
                  <Input
                    id="subject"
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    className="col-span-3"
                    placeholder="Re: Position at Company"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <label htmlFor="body" className="text-right text-sm pt-2">Message</label>
                  <Textarea
                    id="body"
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    className="col-span-3 min-h-[200px]"
                    placeholder="Type your message here..."
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowMessageDialog(false)}>Cancel</Button>
                <Button onClick={handleSendMessage} disabled={!messageSubject || !messageBody}>
                  <Send className="h-4 w-4 mr-2" /> Send Message
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default LinkedInContactFinder;

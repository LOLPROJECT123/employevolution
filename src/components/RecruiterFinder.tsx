import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Send, Search, Pencil, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface Recruiter {
  id: string;
  name: string;
  company: string;
  position: string;
  email?: string;
  linkedInUrl?: string;
  almaMater?: string;
  connectionType: 'alumni' | 'recruiter' | 'manager';
}

const SOURCE_OPTIONS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'email', label: 'Email' },
];

const RecruiterFinder = () => {
  const [companyName, setCompanyName] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"referral" | "advice" | "opportunity">("referral");
  const [searchResults, setSearchResults] = useState<Recruiter[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRecruiter, setSelectedRecruiter] = useState<Recruiter | null>(null);
  const [resumeAttached, setResumeAttached] = useState(false);
  const [sendVia, setSendVia] = useState("email");
  const [isSending, setIsSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState(false);
  const [grammarSuggestions, setGrammarSuggestions] = useState<{text: string, suggestion: string}[]>([]);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    try {
      const userResume = localStorage.getItem('userResume');
      if (userResume) {
        setResumeAttached(true);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, []);

  const messageTemplates = {
    referral: "Hello [Name],\n\nI hope this message finds you well. I noticed you work at [Company] and I'm very interested in opportunities there. Would you be open to providing a referral for the [Position] role?\n\nI've attached my resume for your review. I'd be happy to discuss how my experience aligns with the position.\n\nThank you for your time and consideration.\n\nBest regards,\n[Your Name]",
    advice: "Hello [Name],\n\nI hope this message finds you well. I noticed you're working at [Company] as a [Position]. I'm very interested in this field and would love to get your insights on how to stand out in the application process.\n\nWould you be open to sharing any advice on skills or experiences that would be valuable for someone looking to enter this field?\n\nThank you for your time.\n\nBest regards,\n[Your Name]",
    opportunity: "Hello [Name],\n\nI hope this message finds you well. I've been following [Company] and am impressed by the work your team is doing. I'm particularly interested in [specific aspect of the company].\n\nI'm reaching out to inquire about potential opportunities that might align with my background in [your field]. I've attached my resume for your consideration.\n\nThank you for your time.\n\nBest regards,\n[Your Name]"
  };

  const handleSearch = async () => {
    if (!companyName.trim()) {
      toast.error("Please enter a company name");
      return;
    }

    setIsSearching(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockRecruiters: Recruiter[] = [
        {
          id: "1",
          name: "Sarah Johnson",
          company: companyName,
          position: "University Recruiter",
          email: "sarah.j@" + companyName.toLowerCase().replace(/\s/g, '') + ".com",
          linkedInUrl: "https://linkedin.com/in/sarahjohnson",
          connectionType: 'recruiter'
        },
        {
          id: "2",
          name: "Michael Chen",
          company: companyName,
          position: "Technical Recruiter",
          email: "michael.c@" + companyName.toLowerCase().replace(/\s/g, '') + ".com",
          linkedInUrl: "https://linkedin.com/in/michaelchen",
          connectionType: 'recruiter'
        },
        {
          id: "3",
          name: "Jessica Wong",
          company: companyName,
          position: "Software Engineer",
          almaMater: "Stanford University",
          linkedInUrl: "https://linkedin.com/in/jessicawong",
          connectionType: 'alumni'
        },
        {
          id: "4",
          name: "David Park",
          company: companyName,
          position: "Engineering Manager",
          email: "david.p@" + companyName.toLowerCase().replace(/\s/g, '') + ".com",
          linkedInUrl: "https://linkedin.com/in/davidpark",
          connectionType: 'manager'
        }
      ];
      
      setSearchResults(mockRecruiters);
      
      if (mockRecruiters.length > 0) {
        toast.success(`Found ${mockRecruiters.length} contacts at ${companyName}`);
      } else {
        toast.error(`No contacts found at ${companyName}`);
      }
    } catch (error) {
      console.error("Error searching for recruiters:", error);
      toast.error("Failed to search for contacts. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectRecruiter = (recruiter: Recruiter) => {
    setSelectedRecruiter(recruiter);
    
    let template = messageTemplates[messageType];
    template = template.replace("[Name]", recruiter.name.split(" ")[0]);
    template = template.replace("[Company]", recruiter.company);
    template = template.replace("[Position]", recruiter.position);
    
    setMessage(template);

    setTimeout(() => {
      checkGrammar(template);
    }, 1000);
  };

  const checkGrammar = (text: string) => {
    const mockSuggestions = [
      {
        text: "Would you be open to providing a referral",
        suggestion: "Would you be willing to provide a referral"
      },
      {
        text: "I'd be happy to discuss",
        suggestion: "I would appreciate the opportunity to discuss"
      }
    ];
    
    setGrammarSuggestions(mockSuggestions.filter(s => text.includes(s.text)));
  };

  const applySuggestion = (original: string, suggestion: string) => {
    setMessage(message.replace(original, suggestion));
    setGrammarSuggestions(grammarSuggestions.filter(s => s.text !== original));
    toast.success("Grammar suggestion applied");
  };

  const handleSendMessage = async () => {
    if (!selectedRecruiter) {
      toast.error("Please select a contact first");
      return;
    }
    
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    
    setIsSending(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Message sent to ${selectedRecruiter.name} via ${sendVia === 'email' ? 'Email' : 'LinkedIn'}!`, {
        description: resumeAttached ? "Resume was attached to your message" : ""
      });
      
      setSelectedRecruiter(null);
      setMessage("");
      setResumeAttached(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col">
        <h2 className="text-xl font-semibold mb-2">Find & Connect with Recruiters</h2>
        <p className="text-muted-foreground mb-4">
          Search for recruiters, hiring managers, or alumni at companies you're interested in
        </p>

        {!selectedRecruiter ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter company name (e.g., Google, Microsoft)"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !companyName.trim()}
                className="flex-shrink-0"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Results for {companyName}</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {searchResults.map((recruiter) => (
                    <div 
                      key={recruiter.id} 
                      className="p-3 border rounded-md hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => handleSelectRecruiter(recruiter)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{recruiter.name}</div>
                          <div className="text-sm text-muted-foreground">{recruiter.position} at {recruiter.company}</div>
                          {recruiter.almaMater && (
                            <div className="text-sm text-muted-foreground">Alumni: {recruiter.almaMater}</div>
                          )}
                        </div>
                        <Badge variant={
                          recruiter.connectionType === 'alumni' ? 'secondary' : 
                          recruiter.connectionType === 'recruiter' ? 'default' : 'outline'
                        }>
                          {recruiter.connectionType === 'alumni' ? 'Alumni' : 
                           recruiter.connectionType === 'recruiter' ? 'Recruiter' : 'Manager'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">To: {selectedRecruiter.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedRecruiter.position} at {selectedRecruiter.company}</p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedRecruiter(null)}>
                Change Contact
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Message Type</label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-1.5">
                    <input 
                      type="radio" 
                      name="messageType" 
                      checked={messageType === "referral"} 
                      onChange={() => setMessageType("referral")} 
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Referral</span>
                  </label>
                  <label className="flex items-center space-x-1.5">
                    <input 
                      type="radio" 
                      name="messageType" 
                      checked={messageType === "advice"} 
                      onChange={() => setMessageType("advice")} 
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Advice</span>
                  </label>
                  <label className="flex items-center space-x-1.5">
                    <input 
                      type="radio" 
                      name="messageType" 
                      checked={messageType === "opportunity"} 
                      onChange={() => setMessageType("opportunity")} 
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Opportunity</span>
                  </label>
                </div>
              </div>
              
              <div className="relative">
                <Textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setEditingMessage(true);
                    if (editingMessage) {
                      setTimeout(() => checkGrammar(e.target.value), 1000);
                    }
                  }}
                  rows={12}
                  placeholder="Enter your message here..."
                  icon={<Pencil className="h-4 w-4" />}
                  iconPosition="right"
                />
                
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="absolute top-2 right-2"
                  onClick={() => setEditingMessage(!editingMessage)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              
              {grammarSuggestions.length > 0 && (
                <div className="space-y-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                  <h4 className="text-sm font-medium">Writing Suggestions</h4>
                  <div className="space-y-2">
                    {grammarSuggestions.map((item, index) => (
                      <div key={index} className="flex items-start justify-between text-sm">
                        <div>
                          <span className="line-through text-muted-foreground">{item.text}</span>
                          <span className="ml-2 font-medium">{item.suggestion}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => applySuggestion(item.text, item.suggestion)}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-1.5">
                    <input 
                      type="checkbox" 
                      checked={resumeAttached} 
                      onChange={() => setResumeAttached(!resumeAttached)} 
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Attach Resume</span>
                  </label>
                  {!resumeAttached && (
                    <Button 
                      variant="link" 
                      className="text-xs p-0 h-auto"
                      onClick={() => navigate("/profile", { state: { returnTo: "/recruiter-finder" } })}
                    >
                      Update Resume
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Send via:</span>
                  <select
                    value={sendVia}
                    onChange={(e) => setSendVia(e.target.value)}
                    className="text-sm bg-background border border-input rounded px-2 py-1"
                  >
                    {SOURCE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {selectedRecruiter ? (
          <Button 
            className="w-full mt-4" 
            onClick={handleSendMessage}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        ) : searchResults.length === 0 ? (
          <div className="w-full text-center text-sm text-muted-foreground mt-4">
            Search for a company to find recruiters and connections
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RecruiterFinder;

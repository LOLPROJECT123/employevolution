import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Send, Search, Pencil, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

type OpportunityType = 'clinic' | 'startup' | 'professor';

interface Opportunity {
  id: string;
  name: string;
  type: OpportunityType;
  organization: string;
  field: string;
  email?: string;
  description: string;
  location?: string;
}

const ResearchOpportunityFinder = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [opportunityType, setOpportunityType] = useState<OpportunityType | 'all'>('all');
  const [message, setMessage] = useState("");
  const [searchResults, setSearchResults] = useState<Opportunity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [resumeAttached, setResumeAttached] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [grammarSuggestions, setGrammarSuggestions] = useState<{text: string, suggestion: string}[]>([]);
  const isMobile = useIsMobile();

  // Message templates for different opportunity types
  const messageTemplates = {
    clinic: "Dear [Name],\n\nI hope this email finds you well. I am a [your academic level] at [your university] studying [your field], and I'm writing to express my interest in research opportunities at your clinic. I am particularly interested in [specific research area/project] and would appreciate the opportunity to discuss how I might contribute to your work.\n\nI have experience in [relevant skills/experience] and am excited about the possibility of applying these skills to your clinic's research. I'm available to discuss potential opportunities and can provide additional materials upon request.\n\nThank you for your consideration.\n\nSincerely,\n[Your Name]",
    startup: "Dear [Name],\n\nI hope this email finds you well. I am a [your academic level] at [your university] studying [your field], and I'm writing to express my interest in internship or research opportunities at [Startup Name].\n\nI'm particularly impressed by your work on [specific project/product] and would love to contribute to your innovative approach. My background in [relevant skills/experience] aligns well with your company's mission, and I'm eager to apply my skills in a startup environment.\n\nI'm available to discuss how I might contribute to your team and can provide additional materials upon request.\n\nThank you for your consideration.\n\nSincerely,\n[Your Name]",
    professor: "Dear Professor [Name],\n\nI hope this email finds you well. I am a [your academic level] at [your university] studying [your field], and I'm writing to express my interest in your research on [specific research area].\n\nI have been following your publications on [specific topic] and am particularly interested in your approach to [specific aspect of their research]. I would be grateful for the opportunity to discuss potential research opportunities in your lab, whether as a research assistant or through an independent study project.\n\nI have experience in [relevant skills/experience] and am eager to contribute to your research. I'm available to meet at your convenience to discuss how my interests and skills might align with your current projects.\n\nThank you for your consideration.\n\nSincerely,\n[Your Name]"
  };

  // Function to search for opportunities
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    setIsSearching(true);
    
    try {
      // Simulate API call to search for opportunities
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data - in a real app, this would come from an API
      const mockOpportunities: Opportunity[] = [
        {
          id: "1",
          name: "Dr. Emily Rodriguez",
          type: "professor",
          organization: "Stanford University",
          field: "Computer Science - Machine Learning",
          email: "rodriguez@cs.stanford.edu",
          description: "Research focuses on machine learning applications in healthcare and biomedical data analysis."
        },
        {
          id: "2",
          name: "TechHealth Innovations",
          type: "startup",
          organization: "TechHealth",
          field: "Health Technology",
          email: "research@techhealth.io",
          description: "Early-stage startup developing AI-powered diagnostic tools for primary care physicians.",
          location: "San Francisco, CA"
        },
        {
          id: "3",
          name: "Neurological Research Center",
          type: "clinic",
          organization: "University Medical Center",
          field: "Neuroscience",
          email: "neuro-research@umc.edu",
          description: "Clinical research center focused on neurological disorders and treatment development.",
          location: "Boston, MA"
        },
        {
          id: "4",
          name: "Dr. James Wilson",
          type: "professor",
          organization: "MIT",
          field: "Data Science",
          email: "jwilson@mit.edu",
          description: "Research focuses on data visualization and human-computer interaction."
        },
        {
          id: "5",
          name: "Green Energy Solutions",
          type: "startup",
          organization: "GreenTech Inc",
          field: "Renewable Energy",
          email: "research@greentech.com",
          description: "Startup developing efficient solar energy storage solutions.",
          location: "Austin, TX"
        }
      ];
      
      // Filter based on opportunity type if not 'all'
      const filteredResults = opportunityType === 'all' 
        ? mockOpportunities 
        : mockOpportunities.filter(opp => opp.type === opportunityType);
      
      // Further filter based on search term
      const finalResults = filteredResults.filter(opp => 
        opp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        opp.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setSearchResults(finalResults);
      
      if (finalResults.length > 0) {
        toast.success(`Found ${finalResults.length} opportunities matching your search`);
      } else {
        toast.error(`No opportunities found matching your search criteria`);
      }
    } catch (error) {
      console.error("Error searching for opportunities:", error);
      toast.error("Failed to search for opportunities. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Function to select an opportunity and populate message template
  const handleSelectOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    
    // Populate message with template
    let template = messageTemplates[opportunity.type];
    const nameToUse = opportunity.type === 'professor' 
      ? opportunity.name.split(' ').pop() // Use last name for professors
      : opportunity.name.includes(' ') ? opportunity.name.split(' ')[0] : opportunity.name; // First name or full name for others
    
    template = template.replace("[Name]", nameToUse);
    
    if (opportunity.type === 'startup') {
      template = template.replace("[Startup Name]", opportunity.organization);
    }
    
    setMessage(template);

    // Mock grammar check
    setTimeout(() => {
      checkGrammar(template);
    }, 1000);
  };

  // Function to check grammar (mock implementation)
  const checkGrammar = (text: string) => {
    // Mock implementation - would use an API in production
    const mockSuggestions = [
      {
        text: "I hope this email finds you well",
        suggestion: "I hope you are doing well"
      },
      {
        text: "I would be grateful for the opportunity",
        suggestion: "I would appreciate the opportunity"
      },
      {
        text: "I'm available to meet at your convenience",
        suggestion: "I'm available to meet at a time that works for you"
      }
    ];
    
    setGrammarSuggestions(mockSuggestions.filter(s => text.includes(s.text)));
  };

  // Apply grammar suggestion
  const applySuggestion = (original: string, suggestion: string) => {
    setMessage(message.replace(original, suggestion));
    setGrammarSuggestions(grammarSuggestions.filter(s => s.text !== original));
    toast.success("Grammar suggestion applied");
  };

  // Function to send the message
  const handleSendMessage = async () => {
    if (!selectedOpportunity) {
      toast.error("Please select an opportunity first");
      return;
    }
    
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    
    setIsSending(true);
    
    try {
      // Simulate API call to send message
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Message sent to ${selectedOpportunity.name}!`, {
        description: resumeAttached ? "Resume was attached to your message" : ""
      });
      
      // Reset form after successful send
      setSelectedOpportunity(null);
      setMessage("");
      setResumeAttached(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // Function to get badge color based on opportunity type
  const getOpportunityBadgeStyle = (type: OpportunityType) => {
    switch (type) {
      case 'professor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'startup':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'clinic':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col">
        <h2 className="text-xl font-semibold mb-2">Find Research Opportunities</h2>
        <p className="text-muted-foreground mb-4">
          Connect with professors, startups, and research clinics for internships and research positions
        </p>
        
        {!selectedOpportunity ? (
          // Search form
          <div className="space-y-4">
            <Tabs defaultValue="all" value={opportunityType} onValueChange={(v) => setOpportunityType(v as any)}>
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="professor" className="flex-1">Professors</TabsTrigger>
                <TabsTrigger value="startup" className="flex-1">Startups</TabsTrigger>
                <TabsTrigger value="clinic" className="flex-1">Clinics</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Search by field, name, or keywords (e.g., machine learning, neuroscience)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !searchTerm.trim()}
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
            
            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Results ({searchResults.length})</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {searchResults.map((opportunity) => (
                    <div 
                      key={opportunity.id} 
                      className="p-3 border rounded-md hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => handleSelectOpportunity(opportunity)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{opportunity.name}</div>
                          <div className="text-sm text-muted-foreground">{opportunity.organization}</div>
                          <div className="text-sm text-muted-foreground">{opportunity.field}</div>
                          {opportunity.location && (
                            <div className="text-sm text-muted-foreground">{opportunity.location}</div>
                          )}
                        </div>
                        <Badge className={`${getOpportunityBadgeStyle(opportunity.type)} capitalize`}>
                          {opportunity.type}
                        </Badge>
                      </div>
                      <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{opportunity.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Message composition form
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">To: {selectedOpportunity.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedOpportunity.organization} - {selectedOpportunity.field}
                </p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedOpportunity(null)}>
                Change Recipient
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    // Re-check grammar as user types (with debounce in real app)
                    setTimeout(() => checkGrammar(e.target.value), 1000);
                  }}
                  rows={12}
                  placeholder="Enter your message here..."
                  icon={<Pencil className="h-4 w-4" />}
                  iconPosition="right"
                />
              </div>
              
              {/* Grammar suggestions */}
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
              
              <div className="flex items-center">
                <label className="flex items-center space-x-1.5">
                  <input 
                    type="checkbox" 
                    checked={resumeAttached} 
                    onChange={() => setResumeAttached(!resumeAttached)} 
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Attach Resume</span>
                </label>
              </div>
            </div>
          </div>
        )}
        
        {selectedOpportunity ? (
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
            Search for opportunities and connect with professors, startups, and clinics
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ResearchOpportunityFinder;

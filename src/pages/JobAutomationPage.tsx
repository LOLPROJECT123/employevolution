
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  FileText,
  ListChecks,
  Plus,
  Save,
  Search,
  Trash,
  Upload,
  User,
  Zap,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { ResumeSkillsExtractor } from "@/utils/jobMatching/ResumeSkillsExtractor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const JobAutomationPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [jobDetails, setJobDetails] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    link: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJobDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success notification
      toast.success('Job details saved successfully');
      
      // Proceed to next step or redirect
      setStep(2);
    } catch (error) {
      toast.error('Failed to save job details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setJobDetails({
      title: '',
      company: '',
      location: '',
      description: '',
      requirements: '',
      link: ''
    });
    setStep(1);
  };

  // Form schema for validation
  const formSchema = z.object({
    position: z.string().min(2, {
      message: "Job position must be at least 2 characters.",
    }),
    company: z.string().min(2, {
      message: "Company name must be at least 2 characters.",
    }),
    skills: z.string().min(2, {
      message: "Required skills must be at least 2 characters.",
    }),
  });

  // Form hook
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      position: "",
      company: "",
      skills: "",
    },
  });

  // Form submission handler
  const onFormSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    toast({
      description: "Job details have been saved.",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Job Automation Hub</CardTitle>
          <CardDescription>
            Find, track and apply to jobs automatically with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Software Developer"
                    value={jobDetails.title}
                    onChange={handleJobDetailsChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="e.g. Tech Solutions Inc."
                    value={jobDetails.company}
                    onChange={handleJobDetailsChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g. San Francisco, CA or Remote"
                    value={jobDetails.location}
                    onChange={handleJobDetailsChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="link">Job Listing URL</Label>
                  <Input
                    id="link"
                    name="link"
                    placeholder="https://..."
                    value={jobDetails.link}
                    onChange={handleJobDetailsChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Paste the full job description here..."
                  value={jobDetails.description}
                  onChange={handleJobDetailsChange}
                  className="min-h-[150px]"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements or Qualifications</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  placeholder="Paste job requirements or qualifications here..."
                  value={jobDetails.requirements}
                  onChange={handleJobDetailsChange}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={resetForm}
                >
                  Reset
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Job Details"}
                </Button>
              </div>
            </form>
          )}
          
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-900">
                <div className="flex items-center gap-2 mb-2 text-green-800 dark:text-green-400">
                  <Check className="h-5 w-5" />
                  <h3 className="font-medium">Job Details Saved</h3>
                </div>
                <p className="text-sm text-green-700 dark:text-green-500">
                  Your job details have been saved successfully. You can now proceed to apply or track this job.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resume Match</CardTitle>
                    <CardDescription>
                      Check how your resume matches with this job
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Match Score</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Top Matching Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">React</Badge>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">TypeScript</Badge>
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Node.js</Badge>
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">AWS</Badge>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full">
                      View Detailed Match
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Application Options</CardTitle>
                    <CardDescription>
                      Choose how you want to apply
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Button variant="default" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Cover Letter
                      </Button>
                      
                      <Button variant="outline" className="w-full">
                        <Copy className="mr-2 h-4 w-4" />
                        Prepare Application
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="track" />
                      <Label htmlFor="track">Track this application</Label>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back to Details
                </Button>
                <Button onClick={() => navigate("/")}>
                  Finish
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Additional Job Automation Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job Scraper</CardTitle>
            <CardDescription>
              Find jobs across multiple platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Open Job Scraper
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Auto Apply</CardTitle>
            <CardDescription>
              Apply to multiple jobs automatically
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Zap className="mr-2 h-4 w-4" />
              Setup Auto Apply
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Tracker</CardTitle>
            <CardDescription>
              Track your job applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <ListChecks className="mr-2 h-4 w-4" />
              View Applications
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobAutomationPage;

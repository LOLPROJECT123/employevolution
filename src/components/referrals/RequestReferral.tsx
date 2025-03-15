
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { Send, Upload, User, Briefcase, FileText } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  company: z.string().min(1, { message: "Company is required." }),
  position: z.string().min(1, { message: "Position is required." }),
  message: z.string().min(10, { message: "Please provide more details about your request." }),
});

const RequestReferral = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      position: "",
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    // In a real app, you would upload files to storage and submit the form to your backend
    console.log("Form values:", values);
    console.log("Resume file:", resumeFile);
    console.log("Cover letter file:", coverLetterFile);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccessDialogOpen(true);
      form.reset();
      setResumeFile(null);
      setCoverLetterFile(null);
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'resume' | 'coverLetter') => {
    if (e.target.files && e.target.files[0]) {
      if (fileType === 'resume') {
        setResumeFile(e.target.files[0]);
      } else {
        setCoverLetterFile(e.target.files[0]);
      }
      
      toast({
        title: "File uploaded",
        description: `${fileType === 'resume' ? 'Resume' : 'Cover Letter'} file ready to submit.`,
      });
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Request a Referral</CardTitle>
          <CardDescription>
            Submit your information to request a referral from employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <Input placeholder="John Doe" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Company</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Company you want to work for" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input placeholder="Role you're applying for" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell employees why you'd be a good fit and any relevant experience..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Explain why you're interested in the company and why you'd be a good fit.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="resume">Resume (PDF)</Label>
                  <div className="mt-1 flex items-center">
                    <Label 
                      htmlFor="resume" 
                      className="flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer hover:bg-muted w-full"
                    >
                      <Upload className="h-4 w-4" />
                      {resumeFile ? resumeFile.name : "Upload Resume"}
                    </Label>
                    <Input 
                      id="resume" 
                      type="file" 
                      accept=".pdf,.doc,.docx" 
                      className="sr-only"
                      onChange={(e) => handleFileChange(e, 'resume')}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                  <div className="mt-1 flex items-center">
                    <Label 
                      htmlFor="coverLetter" 
                      className="flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer hover:bg-muted w-full"
                    >
                      <FileText className="h-4 w-4" />
                      {coverLetterFile ? coverLetterFile.name : "Upload Cover Letter"}
                    </Label>
                    <Input 
                      id="coverLetter" 
                      type="file" 
                      accept=".pdf,.doc,.docx" 
                      className="sr-only"
                      onChange={(e) => handleFileChange(e, 'coverLetter')}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Submit Request
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Why Request a Referral?</CardTitle>
          <CardDescription>
            Employee referrals can significantly increase your chances of getting an interview
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Higher Success Rate</h3>
            <p className="text-sm text-muted-foreground">
              Candidates who are referred are 4x more likely to be hired compared to those who apply through job boards.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Faster Hiring Process</h3>
            <p className="text-sm text-muted-foreground">
              The hiring process for referred candidates is typically 55% faster than for candidates who apply through other channels.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Better Cultural Fit</h3>
            <p className="text-sm text-muted-foreground">
              Referred employees tend to stay at companies 38% longer than those hired through job boards or career sites.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Tips for a Successful Referral Request</h3>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Customize your message for each company</li>
              <li>Highlight relevant skills and experience</li>
              <li>Keep your resume and cover letter up-to-date</li>
              <li>Be specific about the role you're interested in</li>
              <li>Follow up politely if you don't hear back</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <Button variant="outline" onClick={() => window.open('#', '_blank')}>
            Learn More About Referrals
          </Button>
        </CardFooter>
      </Card>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Submitted!</DialogTitle>
            <DialogDescription>
              Your referral request has been submitted successfully. Employees will review your request and reach out if they can help.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSuccessDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestReferral;

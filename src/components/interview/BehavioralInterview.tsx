
import React from "react";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle, 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Camera, MonitorSmartphone } from "lucide-react";

const BehavioralInterview = () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Behavioral Interview Practice</CardTitle>
          <CardDescription>
            Practice answering common behavioral interview questions with AI assistance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Interview Category</label>
            <Select defaultValue="leadership">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leadership">Leadership</SelectItem>
                <SelectItem value="teamwork">Teamwork</SelectItem>
                <SelectItem value="conflict">Conflict Resolution</SelectItem>
                <SelectItem value="failure">Dealing with Failure</SelectItem>
                <SelectItem value="success">Success Stories</SelectItem>
                <SelectItem value="challenge">Challenges</SelectItem>
                <SelectItem value="innovation">Innovation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Current Question:</label>
            <div className="p-4 bg-muted/50 rounded-md">
              <p>Tell me about a time when you had to lead a team through a difficult project.</p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Your Notes</label>
            <Textarea 
              placeholder="Take notes during your interview..." 
              className="min-h-[150px]" 
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between flex-wrap gap-3">
          <Button variant="outline" className="flex-1">
            <Camera className="w-4 h-4 mr-2" />
            Enable Camera
          </Button>
          <Button variant="outline" className="flex-1">
            <MonitorSmartphone className="w-4 h-4 mr-2" />
            Share Screen
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="bg-black text-white min-h-[250px] flex items-center justify-center">
        <CardContent>
          <p className="text-center">Video preview will appear here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BehavioralInterview;


import React, { useState } from "react";
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
import { Camera, MonitorSmartphone, Play, Square } from "lucide-react";

const BehavioralInterview = () => {
  const [selectedCategory, setSelectedCategory] = useState("leadership");
  const [isRecording, setIsRecording] = useState(false);
  const [notes, setNotes] = useState("");

  const questions = {
    leadership: "Tell me about a time when you had to lead a team through a difficult project.",
    teamwork: "Describe a situation where you had to work with a difficult team member.",
    conflict: "Tell me about a time when you had to resolve a conflict at work.",
    failure: "Describe a time when you failed and how you handled it.",
    success: "Tell me about your greatest professional achievement.",
    challenge: "Describe the biggest challenge you've faced in your career.",
    innovation: "Tell me about a time when you had to think outside the box."
  };

  const handleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
            <div className="p-4 bg-muted/50 rounded-md border">
              <p className="text-sm">{questions[selectedCategory as keyof typeof questions]}</p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Your Notes</label>
            <Textarea 
              placeholder="Take notes during your interview..." 
              className="min-h-[120px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
          <Button 
            onClick={handleRecording}
            className={`flex-1 ${isRecording ? 'bg-red-600 hover:bg-red-700' : ''}`}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Begin Interview
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="bg-black text-white min-h-[400px] flex items-center justify-center">
        <CardContent className="text-center">
          {isRecording ? (
            <div className="space-y-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mx-auto"></div>
              <p>Recording in progress...</p>
              <p className="text-red-400 text-sm">Camera feed would appear here</p>
            </div>
          ) : (
            <p className="text-gray-400">Video preview will appear here</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BehavioralInterview;

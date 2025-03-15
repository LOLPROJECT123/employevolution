
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { MicIcon, VideoIcon, MonitorIcon, StopCircleIcon, PlayIcon } from "lucide-react";

const INTERVIEW_QUESTIONS = [
  {
    category: "Leadership",
    questions: [
      "Tell me about a time when you had to lead a team through a difficult project.",
      "Describe a situation where you had to make an unpopular decision.",
      "How have you handled a situation where team members disagreed with your approach?",
      "Tell me about a time when you delegated tasks effectively.",
    ]
  },
  {
    category: "Problem Solving",
    questions: [
      "Describe a complex problem you solved and your approach to it.",
      "Tell me about a time when you had to make a decision with incomplete information.",
      "How have you handled a situation where the requirements changed midway through a project?",
      "Tell me about a time when you identified and solved a problem before it became urgent.",
    ]
  },
  {
    category: "Teamwork",
    questions: [
      "Describe a situation where you had to work closely with someone whose personality was different from yours.",
      "Tell me about a time when you had to build consensus among team members.",
      "How have you handled conflicts within your team?",
      "Tell me about a time when you received constructive feedback and how you responded to it.",
    ]
  },
  {
    category: "Adaptability",
    questions: [
      "Describe a time when you had to adapt to a significant change at work.",
      "Tell me about a time when you had to learn a new skill quickly.",
      "How have you handled a situation where you were under pressure with tight deadlines?",
      "Tell me about a time when you had to be flexible in your approach to solve a problem.",
    ]
  }
];

interface RecordingPermissions {
  camera: boolean;
  microphone: boolean;
  screen: boolean;
}

const BehavioralInterview = () => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Leadership");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [notes, setNotes] = useState("");
  const [permissions, setPermissions] = useState<RecordingPermissions>({
    camera: false,
    microphone: false,
    screen: false,
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Get permission status for media devices
  const checkPermissions = async () => {
    try {
      // Check camera and microphone
      const mediaPermission = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });
      const micPermission = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      
      setPermissions(prev => ({
        ...prev,
        camera: mediaPermission.state === "granted",
        microphone: micPermission.state === "granted",
      }));
    } catch (error) {
      console.error("Error checking permissions:", error);
    }
  };
  
  useEffect(() => {
    checkPermissions();
  }, []);
  
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      streamRef.current = mediaStream;
      setPermissions(prev => ({
        ...prev,
        camera: true,
        microphone: true,
      }));
      
      toast({
        title: "Camera and microphone access granted",
        description: "You're ready to start the interview!",
      });
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast({
        title: "Permission denied",
        description: "Please allow camera and microphone access to use this feature.",
        variant: "destructive",
      });
    }
  };
  
  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      
      // Combine screen and camera streams
      if (streamRef.current) {
        const tracks = [...streamRef.current.getTracks(), ...screenStream.getTracks()];
        streamRef.current = new MediaStream(tracks);
      } else {
        streamRef.current = screenStream;
      }
      
      setPermissions(prev => ({
        ...prev,
        screen: true,
      }));
      
      toast({
        title: "Screen sharing started",
        description: "Your screen is now being shared.",
      });
    } catch (error) {
      console.error("Error sharing screen:", error);
      toast({
        title: "Screen sharing denied",
        description: "Please allow screen sharing to use this feature.",
        variant: "destructive",
      });
    }
  };
  
  const startRecording = () => {
    if (!streamRef.current) {
      toast({
        title: "No media stream available",
        description: "Please enable camera and microphone first.",
        variant: "destructive",
      });
      return;
    }
    
    const mediaRecorder = new MediaRecorder(streamRef.current);
    const chunks: BlobPart[] = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `behavioral-interview-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    };
    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    
    // Start the first question
    speakQuestion();
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      setIsRecording(false);
      setPermissions({
        camera: false,
        microphone: false,
        screen: false,
      });
      
      toast({
        title: "Recording saved",
        description: "Your interview recording has been saved.",
      });
    }
  };
  
  const speakQuestion = () => {
    const questions = INTERVIEW_QUESTIONS.find(cat => cat.category === selectedCategory)?.questions || [];
    const question = questions[currentQuestionIndex];
    
    if (!question) return;
    
    // Use SpeechSynthesis to ask the question
    const speech = new SpeechSynthesisUtterance(question);
    
    // Set a professional voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => voice.lang === 'en-US' && voice.name.includes('Google'));
    if (preferredVoice) {
      speech.voice = preferredVoice;
    }
    
    speech.rate = 0.9; // Slightly slower rate for clarity
    speech.pitch = 1; // Normal pitch
    
    window.speechSynthesis.speak(speech);
  };
  
  const nextQuestion = () => {
    const questions = INTERVIEW_QUESTIONS.find(cat => cat.category === selectedCategory)?.questions || [];
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      speakQuestion();
    } else {
      toast({
        title: "Interview complete",
        description: "You've completed all questions in this category.",
      });
    }
  };
  
  const prepareInterview = () => {
    setIsPreparing(true);
  };
  
  const startInterview = async () => {
    await startCamera();
    setIsPreparing(false);
    startRecording();
  };
  
  // Get current question
  const currentQuestion = INTERVIEW_QUESTIONS.find(
    cat => cat.category === selectedCategory
  )?.questions[currentQuestionIndex] || "No question available";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Behavioral Interview Practice</CardTitle>
          <CardDescription>
            Practice answering common behavioral interview questions with AI assistance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Interview Category</label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                  disabled={isRecording}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERVIEW_QUESTIONS.map((category) => (
                      <SelectItem key={category.category} value={category.category}>
                        {category.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="border rounded-md p-4 bg-muted/30">
                <h3 className="font-medium mb-2">Current Question:</h3>
                <p className="text-muted-foreground">{currentQuestion}</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">Your Notes</label>
                <Textarea
                  id="notes"
                  placeholder="Take notes during your interview..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="border rounded-md overflow-hidden bg-black aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                ></video>
                {!isRecording && !permissions.camera && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-white text-sm">Camera preview will appear here</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startCamera}
                  disabled={isRecording || permissions.camera}
                  className="flex-1"
                >
                  <VideoIcon className="mr-2 h-4 w-4" />
                  Enable Camera
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareScreen}
                  disabled={isRecording || permissions.screen}
                  className="flex-1"
                >
                  <MonitorIcon className="mr-2 h-4 w-4" />
                  Share Screen
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {!isRecording ? (
            <Button
              onClick={prepareInterview}
              className="bg-[#F97316] hover:bg-[#F97316]/90 text-white"
            >
              <PlayIcon className="mr-2 h-4 w-4" />
              Begin Interview
            </Button>
          ) : (
            <>
              <Button onClick={nextQuestion} variant="outline">
                Next Question
              </Button>
              <Button onClick={stopRecording} variant="destructive">
                <StopCircleIcon className="mr-2 h-4 w-4" />
                End Interview
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
      
      {/* Preparation Dialog */}
      <Dialog open={isPreparing} onOpenChange={setIsPreparing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prepare for Your Interview</DialogTitle>
            <DialogDescription>
              We'll need access to your camera, microphone, and screen to simulate a real interview environment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-full ${permissions.camera ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                <VideoIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">Camera Access</h4>
                <p className="text-sm text-muted-foreground">
                  {permissions.camera ? 'Granted' : 'Required to see yourself during the interview'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-full ${permissions.microphone ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                <MicIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">Microphone Access</h4>
                <p className="text-sm text-muted-foreground">
                  {permissions.microphone ? 'Granted' : 'Required to record your answers'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-full ${permissions.screen ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                <MonitorIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">Screen Sharing (Optional)</h4>
                <p className="text-sm text-muted-foreground">
                  {permissions.screen ? 'Granted' : 'Useful for sharing presentations or notes'}
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreparing(false)}>
              Cancel
            </Button>
            <Button onClick={startInterview} className="bg-[#F97316] hover:bg-[#F97316]/90 text-white">
              Start Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BehavioralInterview;

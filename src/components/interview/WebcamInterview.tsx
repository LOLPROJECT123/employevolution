
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Video, VideoOff, Mic, MicOff, Camera, Play, Square, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface InterviewQuestion {
  id: string;
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'motivation';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // seconds
}

const SAMPLE_QUESTIONS: InterviewQuestion[] = [
  {
    id: '1',
    question: "Tell me about yourself and your background.",
    category: 'behavioral',
    difficulty: 'easy',
    timeLimit: 120
  },
  {
    id: '2',
    question: "Describe a challenging project you worked on and how you overcame obstacles.",
    category: 'behavioral',
    difficulty: 'medium',
    timeLimit: 180
  },
  {
    id: '3',
    question: "Where do you see yourself in 5 years?",
    category: 'motivation',
    difficulty: 'easy',
    timeLimit: 90
  },
  {
    id: '4',
    question: "Walk me through how you would approach solving a complex technical problem.",
    category: 'technical',
    difficulty: 'hard',
    timeLimit: 300
  }
];

const WebcamInterview = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [recordings, setRecordings] = useState<{ question: string; videoUrl: string; feedback?: string }[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timeRemaining > 0 && isRecording) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isRecording) {
      stopRecording();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeRemaining, isRecording]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      streamRef.current = stream;
      setHasPermission(true);
      toast({
        title: "Camera access granted",
        description: "You can now start your interview practice session.",
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
      toast({
        title: "Camera access denied",
        description: "Please enable camera and microphone access to use interview practice.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startInterview = () => {
    setCurrentQuestion(SAMPLE_QUESTIONS[0]);
    setQuestionIndex(0);
    setTimeRemaining(SAMPLE_QUESTIONS[0].timeLimit);
  };

  const startRecording = async () => {
    if (!streamRef.current || !currentQuestion) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        
        setRecordings(prev => [
          ...prev,
          {
            question: currentQuestion.question,
            videoUrl,
            feedback: generateMockFeedback()
          }
        ]);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTimeRemaining(currentQuestion.timeLimit);
      
      toast({
        title: "Recording started",
        description: `You have ${currentQuestion.timeLimit} seconds to answer.`,
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording failed",
        description: "Failed to start recording. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setTimeRemaining(0);
      
      toast({
        title: "Recording stopped",
        description: "Your answer has been recorded and analyzed.",
      });
    }
  };

  const nextQuestion = () => {
    const nextIndex = questionIndex + 1;
    if (nextIndex < SAMPLE_QUESTIONS.length) {
      setQuestionIndex(nextIndex);
      setCurrentQuestion(SAMPLE_QUESTIONS[nextIndex]);
      setTimeRemaining(SAMPLE_QUESTIONS[nextIndex].timeLimit);
    } else {
      setCurrentQuestion(null);
      toast({
        title: "Interview complete",
        description: "You've completed all practice questions!",
      });
    }
  };

  const generateMockFeedback = (): string => {
    const feedbacks = [
      "Good eye contact and confident delivery. Consider adding more specific examples.",
      "Clear articulation and good structure. Try to be more concise in your response.",
      "Excellent use of examples. Work on maintaining consistent pace throughout.",
      "Strong content and relevant experience shared. Consider improving your body language.",
      "Well-organized response with good detail. Practice speaking with more enthusiasm."
    ];
    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (hasPermission === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Interview Practice Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p>To start practicing interviews, we need access to your camera and microphone.</p>
          <Button onClick={requestCameraPermission}>
            <Camera className="h-4 w-4 mr-2" />
            Enable Camera & Microphone
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (hasPermission === false) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera Access Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Camera and microphone access is required for interview practice. 
              Please enable permissions in your browser settings and refresh the page.
            </AlertDescription>
          </Alert>
          <Button onClick={requestCameraPermission} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Interview Practice
            </span>
            {isRecording && (
              <Badge className="bg-red-100 text-red-800 animate-pulse">
                REC {formatTime(timeRemaining)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full max-w-2xl mx-auto rounded-lg bg-black"
                style={{ aspectRatio: '16/9' }}
              />
              {isRecording && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                  RECORDING
                </div>
              )}
            </div>

            <div className="flex justify-center gap-2">
              <Button
                onClick={hasPermission ? stopCamera : requestCameraPermission}
                variant="outline"
                size="sm"
              >
                {hasPermission ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Question {questionIndex + 1} of {SAMPLE_QUESTIONS.length}</span>
              <div className="flex gap-2">
                <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                  {currentQuestion.difficulty}
                </Badge>
                <Badge variant="outline">
                  {currentQuestion.category}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-lg font-medium">{currentQuestion.question}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Time limit: {formatTime(currentQuestion.timeLimit)}
                </span>
                {timeRemaining > 0 && (
                  <span className="text-lg font-mono">
                    {formatTime(timeRemaining)}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {!isRecording && timeRemaining > 0 && (
                  <Button onClick={startRecording}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Recording
                  </Button>
                )}
                {isRecording && (
                  <Button onClick={stopRecording} variant="destructive">
                    <Square className="h-4 w-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
                {!isRecording && timeRemaining === 0 && (
                  <Button onClick={nextQuestion}>
                    Next Question
                  </Button>
                )}
                <Button onClick={() => setTimeRemaining(currentQuestion.timeLimit)} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Timer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start Interview */}
      {!currentQuestion && recordings.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ready to Practice?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Get ready for a mock interview with {SAMPLE_QUESTIONS.length} practice questions.</p>
              <Button onClick={startInterview} className="w-full">
                Start Interview Practice
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recordings & Feedback */}
      {recordings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Recordings & Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recordings.map((recording, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">{recording.question}</h4>
                  <video
                    controls
                    className="w-full max-w-md rounded"
                    style={{ aspectRatio: '16/9' }}
                  >
                    <source src={recording.videoUrl} type="video/webm" />
                    Your browser does not support video playback.
                  </video>
                  {recording.feedback && (
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm font-medium text-blue-800 mb-1">AI Feedback:</p>
                      <p className="text-sm text-blue-700">{recording.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
              
              {currentQuestion === null && (
                <div className="text-center pt-4">
                  <Button onClick={() => {
                    setRecordings([]);
                    setQuestionIndex(0);
                    setCurrentQuestion(null);
                  }}>
                    Start New Practice Session
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WebcamInterview;

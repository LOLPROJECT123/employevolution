
import React, { useState, useEffect } from "react";
import { 
  Card,
  CardContent,
  CardDescription,
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
import { Camera, MonitorSmartphone, Play, Square, RotateCcw } from "lucide-react";

const CodingInterview = () => {
  const [selectedCategory, setSelectedCategory] = useState("arrays");
  const [selectedProblem, setSelectedProblem] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [code, setCode] = useState("");

  const problems = {
    arrays: [
      { id: "two-sum", name: "Two Sum", difficulty: "Easy" },
      { id: "three-sum", name: "3Sum", difficulty: "Medium" },
      { id: "container-water", name: "Container With Most Water", difficulty: "Medium" }
    ],
    strings: [
      { id: "valid-parentheses", name: "Valid Parentheses", difficulty: "Easy" },
      { id: "longest-substring", name: "Longest Substring Without Repeating Characters", difficulty: "Medium" }
    ],
    trees: [
      { id: "binary-tree-inorder", name: "Binary Tree Inorder Traversal", difficulty: "Easy" },
      { id: "validate-bst", name: "Validate Binary Search Tree", difficulty: "Medium" }
    ],
    "dynamic-programming": [
      { id: "climbing-stairs", name: "Climbing Stairs", difficulty: "Easy" },
      { id: "coin-change", name: "Coin Change", difficulty: "Medium" }
    ]
  };

  const problemDescriptions = {
    "two-sum": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "three-sum": "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setTimeElapsed(time => time + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecording = () => {
    if (!isRecording) {
      setTimeElapsed(0);
    }
    setIsRecording(!isRecording);
  };

  const resetTimer = () => {
    setTimeElapsed(0);
  };

  const currentProblems = problems[selectedCategory as keyof typeof problems] || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Coding Interview Practice</CardTitle>
          <CardDescription>
            Practice coding problems with live coding environment and timer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arrays">Arrays & Hashing</SelectItem>
                  <SelectItem value="strings">Strings</SelectItem>
                  <SelectItem value="trees">Trees</SelectItem>
                  <SelectItem value="dynamic-programming">Dynamic Programming</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Problem</label>
              <Select value={selectedProblem} onValueChange={setSelectedProblem}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a problem" />
                </SelectTrigger>
                <SelectContent>
                  {currentProblems.map((problem) => (
                    <SelectItem key={problem.id} value={problem.id}>
                      {problem.name} ({problem.difficulty})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedProblem && (
            <div>
              <label className="text-sm font-medium mb-2 block">Problem Description:</label>
              <div className="p-4 bg-muted/50 rounded-md border">
                <p className="text-sm">
                  {problemDescriptions[selectedProblem as keyof typeof problemDescriptions] || 
                   "Problem description would appear here based on the selected problem."}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-black text-white rounded-md">
            <div className="flex items-center gap-4">
              <span className="text-sm">Timer:</span>
              <span className="font-mono text-lg">{formatTime(timeElapsed)}</span>
              <Button
                onClick={resetTimer}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-700"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-black">
                <Camera className="w-4 h-4 mr-2" />
                Enable Camera
              </Button>
              <Button variant="outline" size="sm" className="text-black">
                <MonitorSmartphone className="w-4 h-4 mr-2" />
                Share Screen
              </Button>
              <Button 
                onClick={handleRecording}
                className={`${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                size="sm"
              >
                {isRecording ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Begin Interview
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Code Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="// Write your solution here
function twoSum(nums, target) {
    // Your code here
}

// Example:
// Input: nums = [2,7,11,15], target = 9
// Output: [0,1]"
            className="min-h-[300px] font-mono text-sm bg-gray-900 text-green-400 border-gray-600"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-muted-foreground">
              {isRecording && <span className="text-red-500 animate-pulse">● Recording</span>}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Run Code
              </Button>
              <Button variant="outline" size="sm">
                Submit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodingInterview;

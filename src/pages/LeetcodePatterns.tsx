
import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Star, 
  TrendingUp,
  Code,
  Target,
  Lightbulb
} from 'lucide-react';

interface Pattern {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  problems: number;
  completed: number;
  category: string;
  timeToComplete: string;
  keyTechniques: string[];
  commonProblems: string[];
}

const patterns: Pattern[] = [
  {
    id: '1',
    name: 'Two Pointers',
    description: 'Use two pointers moving toward each other or in the same direction',
    difficulty: 'Easy',
    problems: 25,
    completed: 12,
    category: 'Array & String',
    timeToComplete: '2-3 weeks',
    keyTechniques: ['Start/End pointers', 'Fast/Slow pointers', 'Sliding window'],
    commonProblems: ['Two Sum II', 'Container With Most Water', 'Remove Duplicates']
  },
  {
    id: '2',
    name: 'Sliding Window',
    description: 'Maintain a window of elements and slide it through the array',
    difficulty: 'Medium',
    problems: 20,
    completed: 8,
    category: 'Array & String',
    timeToComplete: '2-3 weeks',
    keyTechniques: ['Fixed window', 'Variable window', 'Max/Min window'],
    commonProblems: ['Longest Substring Without Repeating', 'Minimum Window Substring']
  },
  {
    id: '3',
    name: 'Binary Search',
    description: 'Efficiently search in sorted arrays and search spaces',
    difficulty: 'Medium',
    problems: 30,
    completed: 15,
    category: 'Search',
    timeToComplete: '3-4 weeks',
    keyTechniques: ['Classic binary search', 'Search in rotated array', 'Search space'],
    commonProblems: ['Search in Rotated Sorted Array', 'Find Peak Element']
  },
  {
    id: '4',
    name: 'Dynamic Programming',
    description: 'Break down problems into smaller subproblems',
    difficulty: 'Hard',
    problems: 50,
    completed: 5,
    category: 'Optimization',
    timeToComplete: '6-8 weeks',
    keyTechniques: ['Memoization', 'Tabulation', 'State transitions'],
    commonProblems: ['Climbing Stairs', 'Coin Change', 'Longest Common Subsequence']
  },
  {
    id: '5',
    name: 'Tree Traversal',
    description: 'Navigate through tree structures efficiently',
    difficulty: 'Medium',
    problems: 35,
    completed: 20,
    category: 'Trees',
    timeToComplete: '3-4 weeks',
    keyTechniques: ['DFS', 'BFS', 'Recursive', 'Iterative'],
    commonProblems: ['Binary Tree Inorder', 'Level Order Traversal', 'Path Sum']
  },
  {
    id: '6',
    name: 'Graph Algorithms',
    description: 'Solve problems involving graphs and networks',
    difficulty: 'Hard',
    problems: 40,
    completed: 3,
    category: 'Graph',
    timeToComplete: '4-6 weeks',
    keyTechniques: ['DFS', 'BFS', 'Union-Find', 'Topological Sort'],
    commonProblems: ['Number of Islands', 'Course Schedule', 'Clone Graph']
  }
];

const LeetcodePatterns = () => {
  const isMobile = useMobile();
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompletionPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  const totalProblems = patterns.reduce((sum, pattern) => sum + pattern.problems, 0);
  const totalCompleted = patterns.reduce((sum, pattern) => sum + pattern.completed, 0);
  const overallProgress = getCompletionPercentage(totalCompleted, totalProblems);

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader title="LeetCode Patterns" />}
      
      <div className="bg-blue-600 dark:bg-blue-900 py-4 px-4 md:py-6 md:px-6">
        <div className="container mx-auto max-w-screen-xl">
          <h1 className="text-xl md:text-3xl font-bold text-white">
            LeetCode Patterns
          </h1>
          <p className="text-blue-100 mt-2">
            Master common patterns for solving technical interview problems
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-screen-xl py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Overall Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Overall Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Problems Solved</span>
                    <span className="text-sm text-muted-foreground">
                      {totalCompleted} / {totalProblems}
                    </span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {overallProgress}% complete across all patterns
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pattern Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patterns.map((pattern) => (
                <Card key={pattern.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedPattern(pattern)}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{pattern.name}</CardTitle>
                      <Badge className={getDifficultyColor(pattern.difficulty)}>
                        {pattern.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{pattern.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{pattern.completed}/{pattern.problems}</span>
                      </div>
                      <Progress 
                        value={getCompletionPercentage(pattern.completed, pattern.problems)} 
                        className="h-2" 
                      />
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{pattern.timeToComplete}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Study Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recommended Study Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Beginner (0-3 months)</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Two Pointers (2-3 weeks)</li>
                        <li>• Sliding Window (2-3 weeks)</li>
                        <li>• Binary Search (3-4 weeks)</li>
                        <li>• Tree Traversal (3-4 weeks)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Advanced (3-6 months)</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Dynamic Programming (6-8 weeks)</li>
                        <li>• Graph Algorithms (4-6 weeks)</li>
                        <li>• Advanced Tree Problems</li>
                        <li>• System Design Basics</li>
                      </ul>
                    </div>
                  </div>
                  <Button className="w-full md:w-auto">
                    Start Study Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6 mt-6">
            <div className="grid gap-6">
              {patterns.map((pattern) => (
                <Card key={pattern.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Code className="h-5 w-5" />
                          {pattern.name}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1">{pattern.description}</p>
                      </div>
                      <Badge className={getDifficultyColor(pattern.difficulty)}>
                        {pattern.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Key Techniques
                        </h4>
                        <ul className="space-y-1">
                          {pattern.keyTechniques.map((technique, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              • {technique}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Common Problems
                        </h4>
                        <ul className="space-y-1">
                          {pattern.commonProblems.map((problem, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              • {problem}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="font-medium">{pattern.completed}</span>
                          <span className="text-muted-foreground">/{pattern.problems} completed</span>
                        </div>
                        <Progress 
                          value={getCompletionPercentage(pattern.completed, pattern.problems)} 
                          className="w-32 h-2" 
                        />
                      </div>
                      <Button variant="outline">
                        Start Pattern
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Problems solved this week</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Daily average</span>
                      <span className="font-semibold">1.7</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Streak</span>
                      <span className="font-semibold">5 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Difficulty Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        Easy
                      </span>
                      <span className="font-semibold">45%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        Medium
                      </span>
                      <span className="font-semibold">40%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        Hard
                      </span>
                      <span className="font-semibold">15%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievement Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-sm font-medium">First Pattern</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium">Week Streak</p>
                    <p className="text-xs text-muted-foreground">5 days</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                      <Star className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium">100 Problems</p>
                    <p className="text-xs text-muted-foreground">Locked</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                      <Target className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium">Pattern Master</p>
                    <p className="text-xs text-muted-foreground">Locked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LeetcodePatterns;

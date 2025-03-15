
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { SearchIcon, BookIcon, CheckCircleIcon, ActivityIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

// Types for LeetCode problems data
interface LeetcodeProblem {
  id: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  url: string;
  companies: string[];
  pattern: string;
  completed: boolean;
}

interface PatternData {
  name: string;
  count: number;
  mastery: number;
  description: string;
}

// Sample data
const leetcodePatterns: PatternData[] = [
  { 
    name: "Sliding Window", 
    count: 12, 
    mastery: 75,
    description: "Involves creating a window which can either be an array or number from one position to another."
  },
  { 
    name: "Two Pointers", 
    count: 15, 
    mastery: 60,
    description: "Using two different pointers to solve a problem, usually in a sorted array or linked list."
  },
  { 
    name: "Binary Search", 
    count: 20, 
    mastery: 85,
    description: "Divide and conquer algorithm used in a sorted array by repeatedly dividing the search interval in half."
  },
  { 
    name: "Dynamic Programming", 
    count: 25, 
    mastery: 45,
    description: "Breaking down a problem into simpler sub-problems and using the solutions to solve the original problem."
  },
  { 
    name: "Backtracking", 
    count: 18, 
    mastery: 30,
    description: "Algorithm for finding all solutions by incrementally building candidates to the solutions."
  },
  { 
    name: "Graph Traversal", 
    count: 14, 
    mastery: 50,
    description: "Visiting all the nodes in a graph, such as breadth-first or depth-first search."
  }
];

const sampleProblems: LeetcodeProblem[] = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    url: "https://leetcode.com/problems/two-sum/",
    companies: ["Amazon", "Google", "Facebook"],
    pattern: "Hash Table",
    completed: true
  },
  {
    id: 121,
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    tags: ["Array", "Dynamic Programming"],
    url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    companies: ["Amazon", "Microsoft", "Facebook"],
    pattern: "Sliding Window",
    completed: true
  },
  {
    id: 20,
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["String", "Stack"],
    url: "https://leetcode.com/problems/valid-parentheses/",
    companies: ["Google", "Microsoft", "Amazon"],
    pattern: "Stack",
    completed: false
  },
  {
    id: 42,
    title: "Trapping Rain Water",
    difficulty: "Hard",
    tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack"],
    url: "https://leetcode.com/problems/trapping-rain-water/",
    companies: ["Amazon", "Google", "Microsoft"],
    pattern: "Two Pointers",
    completed: false
  },
  {
    id: 3,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    tags: ["Hash Table", "String", "Sliding Window"],
    url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    companies: ["Amazon", "Facebook", "Microsoft"],
    pattern: "Sliding Window",
    completed: true
  }
];

// Chart Data
const companyFrequency = [
  { name: "Amazon", count: 63 },
  { name: "Google", count: 55 },
  { name: "Microsoft", count: 45 },
  { name: "Facebook", count: 40 },
  { name: "Apple", count: 25 },
  { name: "Twitter", count: 15 }
];

const LeetcodePatterns = () => {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProblems = sampleProblems.filter(
    problem => 
      (selectedPattern ? problem.pattern === selectedPattern : true) &&
      (searchQuery ? 
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        problem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        problem.companies.some(company => company.toLowerCase().includes(searchQuery.toLowerCase()))
        : true
      )
  );

  const completedCount = sampleProblems.filter(p => p.completed).length;
  const completionPercentage = Math.round((completedCount / sampleProblems.length) * 100);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 flex-1">
        <h1 className="text-3xl font-bold mb-6 text-center">LeetCode Patterns</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-3xl mx-auto">
          Learn and master common patterns in coding interview questions. Categorized by solution approach to help you recognize patterns and solve problems more effectively.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Overall Completion</span>
                  <span className="text-sm font-medium">{completedCount}/{sampleProblems.length}</span>
                </div>
                <Progress value={completionPercentage} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Most Common Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-[120px]" config={{
                amazon: { color: "#FF9900" },
                google: { color: "#4285F4" },
                microsoft: { color: "#00A4EF" },
                facebook: { color: "#1877F2" },
                apple: { color: "#A2AAAD" },
                twitter: { color: "#1DA1F2" }
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={companyFrequency}>
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Bar dataKey="count" fill="currentColor" className="fill-primary" />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Search Problems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, tag, or company"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-xl font-semibold mb-4">Pattern Categories</h2>
            {leetcodePatterns.map((pattern) => (
              <Card 
                key={pattern.name}
                className={`cursor-pointer hover:border-primary transition-colors ${selectedPattern === pattern.name ? 'border-primary bg-accent/50' : ''}`}
                onClick={() => setSelectedPattern(selectedPattern === pattern.name ? null : pattern.name)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between">
                    <span>{pattern.name}</span>
                    <Badge variant="outline">{pattern.count} problems</Badge>
                  </CardTitle>
                  <CardDescription>{pattern.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Mastery Level</span>
                      <span className="text-sm font-medium">{pattern.mastery}%</span>
                    </div>
                    <Progress 
                      value={pattern.mastery} 
                      className={`${
                        pattern.mastery >= 70 ? 'bg-secondary text-secondary-foreground' : 
                        pattern.mastery >= 40 ? 'bg-amber-100 dark:bg-amber-900' : 
                        'bg-red-100 dark:bg-red-900'
                      }`}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>
                    {selectedPattern ? `${selectedPattern} Problems` : "All LeetCode Problems"}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setSelectedPattern(null)}>
                    {selectedPattern ? "Clear Filter" : "View All"}
                  </Button>
                </CardTitle>
                <CardDescription>
                  {selectedPattern 
                    ? `Problems that use the ${selectedPattern} pattern to solve efficiently.` 
                    : "All problems categorized by their solution patterns."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Companies</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProblems.map((problem) => (
                      <TableRow key={problem.id}>
                        <TableCell>{problem.id}</TableCell>
                        <TableCell>
                          <a 
                            href={problem.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {problem.title}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            problem.difficulty === "Easy" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" :
                            problem.difficulty === "Medium" ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100" :
                            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                          }>
                            {problem.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {problem.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {problem.companies.map((company) => (
                              <Badge key={company} variant="outline" className="text-xs">
                                {company}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {problem.completed ? (
                            <CheckCircleIcon className="ml-auto h-5 w-5 text-green-500" />
                          ) : (
                            <ActivityIcon className="ml-auto h-5 w-5 text-muted-foreground" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeetcodePatterns;

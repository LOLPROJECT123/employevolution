
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

// Sample data with comprehensive DSA coverage
const leetcodePatterns: PatternData[] = [
  { 
    name: "Arrays & Hashing", 
    count: 15, 
    mastery: 60,
    description: "Techniques for array manipulation, hash tables for efficient lookups, and in-place operations."
  },
  { 
    name: "Two Pointers", 
    count: 12, 
    mastery: 75,
    description: "Using two different pointers to solve problems efficiently, often with sorted arrays or linked lists."
  },
  { 
    name: "Sliding Window", 
    count: 10, 
    mastery: 55,
    description: "A fixed or dynamic window that slides through array/string to efficiently process subarrays."
  },
  { 
    name: "Stack", 
    count: 12, 
    mastery: 70,
    description: "Using stacks for problems involving matching, nesting, or backtracking scenarios."
  },
  { 
    name: "Binary Search", 
    count: 14, 
    mastery: 80,
    description: "Using divide and conquer approach on sorted arrays to achieve O(log n) time complexity."
  },
  { 
    name: "Linked List", 
    count: 16, 
    mastery: 65,
    description: "Techniques for manipulating linked lists including reversal, finding cycles, and merging."
  },
  { 
    name: "Trees", 
    count: 18, 
    mastery: 60,
    description: "Binary trees, BST operations, traversals, and tree construction problems."
  },
  { 
    name: "Tries", 
    count: 8, 
    mastery: 45,
    description: "Efficient retrieval of strings, particularly useful for prefix matching problems."
  },
  { 
    name: "Heap / Priority Queue", 
    count: 12, 
    mastery: 50,
    description: "Managing elements by priority, particularly useful for top-k problems."
  },
  { 
    name: "Graphs", 
    count: 20, 
    mastery: 40,
    description: "DFS, BFS, topological sort, shortest paths, and connected components problems."
  },
  { 
    name: "Dynamic Programming", 
    count: 25, 
    mastery: 35,
    description: "Breaking down complex problems into simpler subproblems, then combining their solutions."
  },
  { 
    name: "Greedy", 
    count: 14, 
    mastery: 60,
    description: "Making locally optimal choices with the hope of finding a global optimum."
  },
  { 
    name: "Backtracking", 
    count: 15, 
    mastery: 40,
    description: "Systematic exploration of all possible solutions by incrementally building candidates."
  },
  { 
    name: "Bit Manipulation", 
    count: 10, 
    mastery: 45,
    description: "Manipulating binary representations of data to solve problems more efficiently."
  },
  { 
    name: "Math & Geometry", 
    count: 13, 
    mastery: 55,
    description: "Mathematical tricks and geometrical concepts used to solve computational problems."
  }
];

const sampleProblems: LeetcodeProblem[] = [
  // Arrays & Hashing
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    url: "https://leetcode.com/problems/two-sum/",
    companies: ["Amazon", "Google", "Facebook", "Microsoft"],
    pattern: "Arrays & Hashing",
    completed: true
  },
  {
    id: 217,
    title: "Contains Duplicate",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    url: "https://leetcode.com/problems/contains-duplicate/",
    companies: ["Amazon", "Microsoft", "Apple"],
    pattern: "Arrays & Hashing",
    completed: true
  },
  {
    id: 49,
    title: "Group Anagrams",
    difficulty: "Medium",
    tags: ["Array", "Hash Table", "String", "Sorting"],
    url: "https://leetcode.com/problems/group-anagrams/",
    companies: ["Amazon", "Microsoft", "Facebook"],
    pattern: "Arrays & Hashing",
    completed: false
  },
  
  // Two Pointers
  {
    id: 125,
    title: "Valid Palindrome",
    difficulty: "Easy",
    tags: ["Two Pointers", "String"],
    url: "https://leetcode.com/problems/valid-palindrome/",
    companies: ["Facebook", "Microsoft", "Amazon"],
    pattern: "Two Pointers",
    completed: true
  },
  {
    id: 15,
    title: "3Sum",
    difficulty: "Medium",
    tags: ["Array", "Two Pointers", "Sorting"],
    url: "https://leetcode.com/problems/3sum/",
    companies: ["Facebook", "Amazon", "Google"],
    pattern: "Two Pointers",
    completed: false
  },
  
  // Sliding Window
  {
    id: 121,
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    tags: ["Array", "Dynamic Programming", "Sliding Window"],
    url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    companies: ["Amazon", "Microsoft", "Facebook"],
    pattern: "Sliding Window",
    completed: true
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
  },
  
  // Stack
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
    id: 84,
    title: "Largest Rectangle in Histogram",
    difficulty: "Hard",
    tags: ["Array", "Stack", "Monotonic Stack"],
    url: "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    companies: ["Amazon", "Google", "Microsoft"],
    pattern: "Stack",
    completed: false
  },
  
  // Binary Search
  {
    id: 704,
    title: "Binary Search",
    difficulty: "Easy",
    tags: ["Array", "Binary Search"],
    url: "https://leetcode.com/problems/binary-search/",
    companies: ["Facebook", "Amazon", "Microsoft"],
    pattern: "Binary Search",
    completed: true
  },
  {
    id: 33,
    title: "Search in Rotated Sorted Array",
    difficulty: "Medium",
    tags: ["Array", "Binary Search"],
    url: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    companies: ["Facebook", "Amazon", "Microsoft", "Google"],
    pattern: "Binary Search",
    completed: false
  },
  
  // Linked List
  {
    id: 206,
    title: "Reverse Linked List",
    difficulty: "Easy",
    tags: ["Linked List", "Recursion"],
    url: "https://leetcode.com/problems/reverse-linked-list/",
    companies: ["Amazon", "Microsoft", "Apple", "Google", "Facebook"],
    pattern: "Linked List",
    completed: true
  },
  {
    id: 21,
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    tags: ["Linked List", "Recursion"],
    url: "https://leetcode.com/problems/merge-two-sorted-lists/",
    companies: ["Amazon", "Google", "Apple"],
    pattern: "Linked List",
    completed: false
  },
  {
    id: 23,
    title: "Merge k Sorted Lists",
    difficulty: "Hard",
    tags: ["Linked List", "Divide and Conquer", "Heap"],
    url: "https://leetcode.com/problems/merge-k-sorted-lists/",
    companies: ["Amazon", "Facebook", "Google"],
    pattern: "Linked List",
    completed: false
  },
  
  // Trees
  {
    id: 104,
    title: "Maximum Depth of Binary Tree",
    difficulty: "Easy",
    tags: ["Tree", "DFS", "BFS", "Binary Tree"],
    url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    companies: ["Amazon", "Apple", "Google"],
    pattern: "Trees",
    completed: true
  },
  {
    id: 98,
    title: "Validate Binary Search Tree",
    difficulty: "Medium",
    tags: ["Tree", "DFS", "Binary Search Tree", "Binary Tree"],
    url: "https://leetcode.com/problems/validate-binary-search-tree/",
    companies: ["Facebook", "Microsoft", "Amazon"],
    pattern: "Trees",
    completed: false
  },
  
  // Tries
  {
    id: 208,
    title: "Implement Trie (Prefix Tree)",
    difficulty: "Medium",
    tags: ["Hash Table", "String", "Design", "Trie"],
    url: "https://leetcode.com/problems/implement-trie-prefix-tree/",
    companies: ["Google", "Amazon", "Microsoft"],
    pattern: "Tries",
    completed: false
  },
  
  // Heap / Priority Queue
  {
    id: 347,
    title: "Top K Frequent Elements",
    difficulty: "Medium",
    tags: ["Array", "Hash Table", "Sorting", "Heap", "Bucket Sort"],
    url: "https://leetcode.com/problems/top-k-frequent-elements/",
    companies: ["Facebook", "Amazon", "Google", "Microsoft"],
    pattern: "Heap / Priority Queue",
    completed: false
  },
  
  // Graphs
  {
    id: 200,
    title: "Number of Islands",
    difficulty: "Medium",
    tags: ["Array", "DFS", "BFS", "Union Find", "Matrix"],
    url: "https://leetcode.com/problems/number-of-islands/",
    companies: ["Amazon", "Google", "Facebook", "Microsoft"],
    pattern: "Graphs",
    completed: false
  },
  {
    id: 207,
    title: "Course Schedule",
    difficulty: "Medium",
    tags: ["DFS", "BFS", "Graph", "Topological Sort"],
    url: "https://leetcode.com/problems/course-schedule/",
    companies: ["Google", "Facebook", "Amazon"],
    pattern: "Graphs",
    completed: false
  },
  
  // Dynamic Programming
  {
    id: 70,
    title: "Climbing Stairs",
    difficulty: "Easy",
    tags: ["Math", "Dynamic Programming", "Memoization"],
    url: "https://leetcode.com/problems/climbing-stairs/",
    companies: ["Amazon", "Google", "Apple"],
    pattern: "Dynamic Programming",
    completed: true
  },
  {
    id: 322,
    title: "Coin Change",
    difficulty: "Medium",
    tags: ["Array", "Dynamic Programming", "BFS"],
    url: "https://leetcode.com/problems/coin-change/",
    companies: ["Amazon", "Microsoft", "Google"],
    pattern: "Dynamic Programming",
    completed: false
  },
  {
    id: 42,
    title: "Trapping Rain Water",
    difficulty: "Hard",
    tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack"],
    url: "https://leetcode.com/problems/trapping-rain-water/",
    companies: ["Amazon", "Google", "Microsoft"],
    pattern: "Dynamic Programming",
    completed: false
  },
  
  // Greedy
  {
    id: 53,
    title: "Maximum Subarray",
    difficulty: "Easy",
    tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
    url: "https://leetcode.com/problems/maximum-subarray/",
    companies: ["Amazon", "Microsoft", "Apple"],
    pattern: "Greedy",
    completed: true
  },
  {
    id: 55,
    title: "Jump Game",
    difficulty: "Medium",
    tags: ["Array", "Greedy", "Dynamic Programming"],
    url: "https://leetcode.com/problems/jump-game/",
    companies: ["Amazon", "Google", "Facebook"],
    pattern: "Greedy",
    completed: false
  },
  
  // Backtracking
  {
    id: 78,
    title: "Subsets",
    difficulty: "Medium",
    tags: ["Array", "Backtracking", "Bit Manipulation"],
    url: "https://leetcode.com/problems/subsets/",
    companies: ["Facebook", "Amazon", "Google"],
    pattern: "Backtracking",
    completed: false
  },
  {
    id: 46,
    title: "Permutations",
    difficulty: "Medium",
    tags: ["Array", "Backtracking"],
    url: "https://leetcode.com/problems/permutations/",
    companies: ["Microsoft", "Amazon", "Facebook"],
    pattern: "Backtracking",
    completed: false
  },
  
  // Bit Manipulation
  {
    id: 191,
    title: "Number of 1 Bits",
    difficulty: "Easy",
    tags: ["Bit Manipulation"],
    url: "https://leetcode.com/problems/number-of-1-bits/",
    companies: ["Amazon", "Microsoft", "Facebook"],
    pattern: "Bit Manipulation",
    completed: false
  },
  {
    id: 338,
    title: "Counting Bits",
    difficulty: "Easy",
    tags: ["Dynamic Programming", "Bit Manipulation"],
    url: "https://leetcode.com/problems/counting-bits/",
    companies: ["Google", "Amazon", "Microsoft"],
    pattern: "Bit Manipulation",
    completed: false
  },
  
  // Math & Geometry
  {
    id: 48,
    title: "Rotate Image",
    difficulty: "Medium",
    tags: ["Array", "Math", "Matrix"],
    url: "https://leetcode.com/problems/rotate-image/",
    companies: ["Amazon", "Microsoft", "Apple"],
    pattern: "Math & Geometry",
    completed: false
  },
  {
    id: 54,
    title: "Spiral Matrix",
    difficulty: "Medium",
    tags: ["Array", "Matrix", "Simulation"],
    url: "https://leetcode.com/problems/spiral-matrix/",
    companies: ["Microsoft", "Amazon", "Google"],
    pattern: "Math & Geometry",
    completed: false
  }
];

// Chart Data
const companyFrequency = [
  { name: "Amazon", count: 75 },
  { name: "Google", count: 65 },
  { name: "Microsoft", count: 60 },
  { name: "Facebook", count: 55 },
  { name: "Apple", count: 30 },
  { name: "Twitter", count: 20 }
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

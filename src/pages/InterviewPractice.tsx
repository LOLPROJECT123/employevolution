
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BehavioralInterview from "@/components/interview/BehavioralInterview";
import CodingInterview from "@/components/interview/CodingInterview";
import Navbar from "@/components/Navbar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const amazonPrinciples = [
  {
    name: "Customer Obsession",
    description: "Leaders start with the customer and work backwards. They work vigorously to earn and keep customer trust.",
    questions: [
      "Tell me about a time when you went above and beyond for a customer.",
      "Describe a situation where you had to make a difficult decision that impacted customers.",
      "How do you ensure that customers' needs are at the center of your work?"
    ]
  },
  {
    name: "Ownership",
    description: "Leaders are owners. They think long term and don't sacrifice long-term value for short-term results.",
    questions: [
      "Tell me about a time when you took on a problem outside your scope of responsibility.",
      "Describe a project that you led from start to finish.",
      "How do you balance short-term gains with long-term objectives?"
    ]
  },
  {
    name: "Invent and Simplify",
    description: "Leaders expect and require innovation and invention from their teams and always find ways to simplify.",
    questions: [
      "Tell me about a time when you innovated to solve a problem.",
      "Describe how you simplified a complex process.",
      "How do you encourage creative thinking within your team?"
    ]
  },
  {
    name: "Learn and Be Curious",
    description: "Leaders are never done learning and always seek to improve themselves.",
    questions: [
      "Tell me about something you learned that helped you do your job better.",
      "How do you stay current in your field?",
      "Describe a time when you sought out a new perspective to solve a problem."
    ]
  },
  {
    name: "Dive Deep",
    description: "Leaders operate at all levels, stay connected to the details, and audit frequently.",
    questions: [
      "Tell me about a time when you discovered an issue by digging into the details.",
      "How do you ensure quality in your work?",
      "Describe a situation where your attention to detail made a difference."
    ]
  },
  {
    name: "Have Backbone; Disagree and Commit",
    description: "Leaders are obligated to respectfully challenge decisions when they disagree, even when doing so is uncomfortable or exhausting.",
    questions: [
      "Tell me about a time when you had to disagree with your team or manager.",
      "Describe a situation where you had to stand up for what you believed was right.",
      "How do you handle situations when you disagree with leadership decisions?"
    ]
  },
  {
    name: "Deliver Results",
    description: "Leaders focus on the key inputs for their business and deliver them with the right quality and in a timely fashion.",
    questions: [
      "Tell me about a time when you had to deliver results under pressure or with tight deadlines.",
      "Describe a situation where you had to overcome obstacles to achieve a goal.",
      "How do you prioritize and ensure you meet your commitments?"
    ]
  }
];

const googleValues = [
  {
    name: "Innovation",
    description: "Google values innovative thinking and creative problem-solving.",
    questions: [
      "Tell me about a time when you came up with a novel solution to a problem.",
      "How have you applied creative thinking in a previous role?",
      "Describe a project where you implemented something new or innovative."
    ]
  },
  {
    name: "Data-Driven Decision Making",
    description: "Google emphasizes making decisions based on data rather than intuition.",
    questions: [
      "Tell me about a time when you used data to make a decision.",
      "How do you validate your assumptions when solving problems?",
      "Describe a situation where data changed your opinion or approach."
    ]
  },
  {
    name: "User Focus",
    description: "Google prioritizes the needs and experiences of users in all their products.",
    questions: [
      "Tell me about a time when you advocated for the user's perspective.",
      "How do you ensure your work meets user needs?",
      "Describe a situation where you improved a user experience."
    ]
  },
];

const microsoftFramework = [
  {
    name: "Growth Mindset",
    description: "Microsoft values individuals who are constantly learning and improving.",
    questions: [
      "Tell me about a time when you learned something difficult.",
      "How do you seek out opportunities to grow professionally?",
      "Describe a situation where you had to adapt to new information or technology."
    ]
  },
  {
    name: "Customer Focus",
    description: "Microsoft prioritizes customer needs and satisfaction.",
    questions: [
      "Tell me about a time when you improved customer satisfaction.",
      "How do you gather and incorporate customer feedback?",
      "Describe a situation where you went above and beyond for a customer."
    ]
  },
  {
    name: "Diversity and Inclusion",
    description: "Microsoft values diversity of thought, experience, and background.",
    questions: [
      "Tell me about a time when diversity of perspective improved a project outcome.",
      "How do you ensure everyone's voice is heard in a team setting?",
      "Describe a situation where you had to work effectively with someone from a different background."
    ]
  }
];

const commonBehavioralQuestions = [
  "Tell me about yourself.",
  "Why do you want to work for our company?",
  "Describe a time when you faced a challenge and how you overcame it.",
  "Give an example of a goal you reached and how you achieved it.",
  "Tell me about a time you had to work with a difficult coworker or client.",
  "Describe a situation where you had to make a decision with incomplete information.",
  "Tell me about a time you failed and what you learned from it.",
  "How do you handle stress and pressure?",
  "Give an example of a time you showed leadership.",
  "How do you prioritize your work?",
  "Tell me about a time you went above and beyond.",
  "Describe a situation where you had to influence someone to see your perspective.",
  "How do you handle disagreements with your manager?",
  "Tell me about a time when you had to adapt to a significant change.",
  "Describe a project that you're particularly proud of."
];

const situationalQuestions = [
  "How would you handle a situation where a project is falling behind schedule?",
  "What would you do if you disagreed with your manager's approach to a problem?",
  "How would you handle a team member who isn't contributing their fair share?",
  "What would you do if you were assigned a task you've never done before?",
  "How would you prioritize if you were given multiple urgent tasks with the same deadline?",
  "What would you do if a client or stakeholder was unhappy with your team's work?",
  "How would you approach a situation where you need to deliver bad news to your team?",
  "What would you do if you identified a significant issue just before a product launch?",
  "How would you handle conflicting feedback from different stakeholders?",
  "What would you do if you realized your approach to a problem was fundamentally flawed midway through?"
];

const teamworkQuestions = [
  "Tell me about a time when you had to work closely with someone whose personality was very different from yours.",
  "Give me an example of a time you faced a conflict with a colleague. How did you handle it?",
  "Describe a time when you had to step up and take on a leadership role.",
  "Tell me about a time when you had to get buy-in from a team on an unpopular decision.",
  "Give an example of how you've contributed to team culture.",
  "Describe your experience working in a diverse team environment.",
  "Tell me about a time when you had to motivate others to achieve a goal.",
  "How do you handle situations when team members have different working styles?",
  "Give an example of successful collaboration with cross-functional teams.",
  "Describe a situation where you had to give constructive feedback to a colleague."
];

const leetcodeProblems = [
  {
    category: "Arrays & Hashing",
    problems: [
      "Two Sum", "Contains Duplicate", "Valid Anagram", "Group Anagrams", 
      "Top K Frequent Elements", "Product of Array Except Self", "Valid Sudoku",
      "Encode and Decode Strings", "Longest Consecutive Sequence"
    ]
  },
  {
    category: "Two Pointers",
    problems: [
      "Valid Palindrome", "Two Sum II", "3Sum", "Container With Most Water", 
      "Trapping Rain Water"
    ]
  },
  {
    category: "Sliding Window",
    problems: [
      "Best Time to Buy and Sell Stock", "Longest Substring Without Repeating Characters", 
      "Longest Repeating Character Replacement", "Permutation in String", 
      "Minimum Window Substring", "Sliding Window Maximum"
    ]
  },
  {
    category: "Stack",
    problems: [
      "Valid Parentheses", "Min Stack", "Evaluate Reverse Polish Notation", 
      "Generate Parentheses", "Daily Temperatures", "Car Fleet", 
      "Largest Rectangle in Histogram"
    ]
  },
  {
    category: "Binary Search",
    problems: [
      "Binary Search", "Search a 2D Matrix", "Koko Eating Bananas", 
      "Find Minimum in Rotated Sorted Array", "Search in Rotated Sorted Array", 
      "Time Based Key-Value Store", "Median of Two Sorted Arrays"
    ]
  },
  {
    category: "Linked Lists",
    problems: [
      "Reverse Linked List", "Merge Two Sorted Lists", "Reorder List", 
      "Remove Nth Node From End of List", "Copy List with Random Pointer", 
      "Add Two Numbers", "Linked List Cycle", "Find the Duplicate Number", 
      "LRU Cache", "Merge k Sorted Lists"
    ]
  },
  {
    category: "Trees",
    problems: [
      "Invert Binary Tree", "Maximum Depth of Binary Tree", "Same Tree", 
      "Subtree of Another Tree", "Lowest Common Ancestor of a BST", 
      "Binary Tree Level Order Traversal", "Validate Binary Search Tree", 
      "Kth Smallest Element in a BST", "Construct Binary Tree from Preorder and Inorder Traversal", 
      "Binary Tree Maximum Path Sum", "Serialize and Deserialize Binary Tree"
    ]
  },
  {
    category: "Tries",
    problems: [
      "Implement Trie (Prefix Tree)", "Design Add and Search Words Data Structure", 
      "Word Search II"
    ]
  },
  {
    category: "Heap / Priority Queue",
    problems: [
      "Kth Largest Element in an Array", "Last Stone Weight", "K Closest Points to Origin", 
      "Task Scheduler", "Design Twitter", "Find Median from Data Stream"
    ]
  },
  {
    category: "Backtracking",
    problems: [
      "Subsets", "Combination Sum", "Permutations", "Subsets II", 
      "Combination Sum II", "Word Search", "Palindrome Partitioning", 
      "Letter Combinations of a Phone Number", "N-Queens"
    ]
  },
  {
    category: "Graphs",
    problems: [
      "Number of Islands", "Clone Graph", "Pacific Atlantic Water Flow", 
      "Course Schedule", "Number of Connected Components in an Undirected Graph", 
      "Graph Valid Tree", "Word Ladder", "Reconstruct Itinerary", "Min Cost to Connect All Points", 
      "Network Delay Time", "Swim in Rising Water", "Alien Dictionary", 
      "Cheapest Flights Within K Stops"
    ]
  },
  {
    category: "Dynamic Programming",
    problems: [
      "Climbing Stairs", "Min Cost Climbing Stairs", "House Robber", "House Robber II", 
      "Longest Palindromic Substring", "Palindromic Substrings", "Decode Ways", 
      "Coin Change", "Maximum Product Subarray", "Word Break", "Longest Increasing Subsequence", 
      "Partition Equal Subset Sum", "Unique Paths", "Longest Common Subsequence", 
      "Best Time to Buy and Sell Stock with Cooldown", "Coin Change 2", 
      "Target Sum", "Interleaving String", "Longest Increasing Path in a Matrix", 
      "Distinct Subsequences", "Edit Distance", "Burst Balloons", "Regular Expression Matching"
    ]
  },
  {
    category: "Greedy",
    problems: [
      "Maximum Subarray", "Jump Game", "Jump Game II", "Gas Station", 
      "Hand of Straights", "Merge Triplets to Form Target Triplet", "Partition Labels", 
      "Valid Parenthesis String"
    ]
  },
  {
    category: "Intervals",
    problems: [
      "Insert Interval", "Merge Intervals", "Non-overlapping Intervals", 
      "Meeting Rooms", "Meeting Rooms II", "Minimum Interval to Include Each Query"
    ]
  },
  {
    category: "Math & Geometry",
    problems: [
      "Rotate Image", "Spiral Matrix", "Set Matrix Zeroes", "Happy Number", 
      "Plus One", "Pow(x, n)", "Multiply Strings", "Detect Squares"
    ]
  },
  {
    category: "Bit Manipulation",
    problems: [
      "Single Number", "Number of 1 Bits", "Counting Bits", "Reverse Bits", 
      "Missing Number", "Sum of Two Integers", "Reverse Integer"
    ]
  }
];

const InterviewPractice = () => {
  const [activeTab, setActiveTab] = useState<string>("behavioral");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 flex-1">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Interview Practice</h1>
          
          <p className="text-muted-foreground mb-8 text-center">
            Practice both behavioral and coding interviews with AI assistance. Use your camera, 
            microphone, and screen sharing to simulate a real interview environment.
          </p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
              <TabsTrigger value="behavioral">Behavioral Interview</TabsTrigger>
              <TabsTrigger value="coding">Coding Interview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="behavioral" className="space-y-6">
              <BehavioralInterview />
              
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Common Behavioral Questions</CardTitle>
                  <CardDescription>
                    Prepare for these frequently asked behavioral questions from top companies and recruiters.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="general">
                      <AccordionTrigger>General Questions</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2 ml-6 list-disc">
                          {commonBehavioralQuestions.map((question, index) => (
                            <li key={index} className="text-muted-foreground">{question}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="situational">
                      <AccordionTrigger>Situational Questions</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2 ml-6 list-disc">
                          {situationalQuestions.map((question, index) => (
                            <li key={index} className="text-muted-foreground">{question}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="teamwork">
                      <AccordionTrigger>Teamwork Questions</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2 ml-6 list-disc">
                          {teamworkQuestions.map((question, index) => (
                            <li key={index} className="text-muted-foreground">{question}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="amazon">
                      <AccordionTrigger>Amazon Leadership Principles</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">
                            Amazon evaluates candidates based on these leadership principles. Prepare STAR-format answers for each.
                          </p>
                          
                          <Accordion type="single" collapsible className="w-full">
                            {amazonPrinciples.map((principle, index) => (
                              <AccordionItem key={index} value={`principle-${index}`}>
                                <AccordionTrigger className="text-left">
                                  {principle.name}
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-2">
                                    <p className="text-muted-foreground">{principle.description}</p>
                                    <div className="mt-2">
                                      <h4 className="font-medium">Sample Questions:</h4>
                                      <ul className="space-y-1 ml-6 list-disc">
                                        {principle.questions.map((question, qIndex) => (
                                          <li key={qIndex} className="text-muted-foreground">{question}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="google">
                      <AccordionTrigger>Google Interview Values</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">
                            Google evaluates candidates based on these core values. Prepare examples that demonstrate these qualities.
                          </p>
                          
                          <Accordion type="single" collapsible className="w-full">
                            {googleValues.map((value, index) => (
                              <AccordionItem key={index} value={`google-${index}`}>
                                <AccordionTrigger className="text-left">
                                  {value.name}
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-2">
                                    <p className="text-muted-foreground">{value.description}</p>
                                    <div className="mt-2">
                                      <h4 className="font-medium">Sample Questions:</h4>
                                      <ul className="space-y-1 ml-6 list-disc">
                                        {value.questions.map((question, qIndex) => (
                                          <li key={qIndex} className="text-muted-foreground">{question}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="microsoft">
                      <AccordionTrigger>Microsoft Interview Framework</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">
                            Microsoft looks for these qualities in candidates. Prepare examples from your experience that showcase these attributes.
                          </p>
                          
                          <Accordion type="single" collapsible className="w-full">
                            {microsoftFramework.map((item, index) => (
                              <AccordionItem key={index} value={`microsoft-${index}`}>
                                <AccordionTrigger className="text-left">
                                  {item.name}
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-2">
                                    <p className="text-muted-foreground">{item.description}</p>
                                    <div className="mt-2">
                                      <h4 className="font-medium">Sample Questions:</h4>
                                      <ul className="space-y-1 ml-6 list-disc">
                                        {item.questions.map((question, qIndex) => (
                                          <li key={qIndex} className="text-muted-foreground">{question}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="coding" className="space-y-6">
              <CodingInterview />
              
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Comprehensive LeetCode & NeetCode Problems</CardTitle>
                  <CardDescription>
                    Common coding problems by category asked in technical interviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {leetcodeProblems.map((category, index) => (
                      <AccordionItem key={index} value={`category-${index}`}>
                        <AccordionTrigger className="text-left">
                          {category.category}
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6 list-disc">
                            {category.problems.map((problem, pIndex) => (
                              <li key={pIndex} className="text-muted-foreground">{problem}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default InterviewPractice;

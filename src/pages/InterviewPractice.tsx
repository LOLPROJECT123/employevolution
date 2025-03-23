
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

const leetcodeProblems = [
  {
    category: "Arrays & Strings",
    problems: [
      "Two Sum", "Valid Anagram", "Valid Palindrome", "Container With Most Water",
      "3Sum", "Product of Array Except Self", "Maximum Subarray", "Trapping Rain Water"
    ]
  },
  {
    category: "Linked Lists",
    problems: [
      "Reverse Linked List", "Merge Two Sorted Lists", "Linked List Cycle", 
      "Remove Nth Node From End of List", "LRU Cache", "Merge k Sorted Lists"
    ]
  },
  {
    category: "Trees & Graphs",
    problems: [
      "Maximum Depth of Binary Tree", "Same Tree", "Invert Binary Tree",
      "Binary Tree Level Order Traversal", "Validate BST", "Number of Islands", 
      "Course Schedule", "Word Ladder"
    ]
  },
  {
    category: "Dynamic Programming",
    problems: [
      "Climbing Stairs", "Coin Change", "Longest Increasing Subsequence",
      "Longest Common Subsequence", "House Robber", "Maximum Product Subarray", 
      "Word Break", "Unique Paths"
    ]
  },
  {
    category: "System Design",
    problems: [
      "Design a URL Shortener", "Design Twitter", "Design a Key-Value Store",
      "Design a Rate Limiter", "Design a Chat Application", "Design Instagram",
      "Design Netflix", "Design a Distributed File System"
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
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">General Questions</h3>
                      <ul className="space-y-2 ml-6 list-disc">
                        {commonBehavioralQuestions.map((question, index) => (
                          <li key={index} className="text-muted-foreground">{question}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Amazon Leadership Principles</h3>
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="coding" className="space-y-6">
              <CodingInterview />
              
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Popular LeetCode & NeetCode Problems</CardTitle>
                  <CardDescription>
                    Common coding problems asked in technical interviews
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

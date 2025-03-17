
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DollarSign, BookOpen, LineChart, MessageSquare, Briefcase, ArrowRight } from "lucide-react";

const NegotiationGuides = () => {
  const guides = [
    {
      title: "Research & Preparation",
      icon: <BookOpen className="h-5 w-5" />,
      description: "How to research salary ranges and prepare for negotiation conversations",
      content: (
        <div className="space-y-4">
          <p>Effective salary negotiation starts with thorough research. Here's how to prepare:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Research salary ranges on sites like Glassdoor, Levels.fyi, and Payscale</li>
            <li>Consider your experience, skills, and the local job market</li>
            <li>Prepare specific examples of your achievements and value</li>
            <li>Practice your negotiation pitch with a friend or mentor</li>
          </ul>
          <p className="font-medium mt-2">Key Resources:</p>
          <ul className="list-disc pl-5">
            <li>Levels.fyi for tech industry compensation data</li>
            <li>Glassdoor's "Know Your Worth" tool</li>
            <li>Bureau of Labor Statistics for industry averages</li>
          </ul>
        </div>
      )
    },
    {
      title: "Timing Your Negotiation",
      icon: <LineChart className="h-5 w-5" />,
      description: "When to negotiate and how to choose the right moment",
      content: (
        <div className="space-y-4">
          <p>The timing of your negotiation can significantly impact the outcome:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Wait until you have a formal offer before discussing compensation</li>
            <li>If asked about salary expectations earlier, provide a range based on research</li>
            <li>Consider negotiating after demonstrating your value in the interview process</li>
            <li>Annual performance reviews are also good opportunities to discuss raises</li>
          </ul>
          <p className="text-muted-foreground italic mt-2">
            "The best time to negotiate is after they've decided they want you, but before they've made the formal offer."
          </p>
        </div>
      )
    },
    {
      title: "Communication Techniques",
      icon: <MessageSquare className="h-5 w-5" />,
      description: "Effective language and responses during negotiations",
      content: (
        <div className="space-y-4">
          <p>How you communicate during negotiation is crucial:</p>
          <ul className="list-disc pl-5 space-y-3">
            <li>
              <strong>Use silence effectively</strong> - After stating your request, resist the urge to fill awkward silences
            </li>
            <li>
              <strong>Frame requests collaboratively</strong> - "How can we work together to reach a compensation package that reflects my value to the company?"
            </li>
            <li>
              <strong>Focus on value, not needs</strong> - Emphasize the value you bring rather than personal financial needs
            </li>
            <li>
              <strong>Express enthusiasm</strong> - Always convey your excitement about the role and company
            </li>
          </ul>
        </div>
      )
    },
    {
      title: "Beyond Base Salary",
      icon: <Briefcase className="h-5 w-5" />,
      description: "Negotiating the complete compensation package",
      content: (
        <div className="space-y-4">
          <p>Remember that compensation extends beyond base salary:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Signing bonuses and performance bonuses</li>
            <li>Equity compensation (RSUs, stock options)</li>
            <li>Flexible working arrangements and remote work options</li>
            <li>Professional development budgets</li>
            <li>Additional vacation time</li>
            <li>Relocation assistance</li>
            <li>Health benefits and retirement plans</li>
          </ul>
          <p className="font-medium mt-2">Prioritize which elements matter most to you before negotiating.</p>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-600" />
            <CardTitle>Salary Negotiation Essentials</CardTitle>
          </div>
          <CardDescription>
            Learn proven strategies to negotiate your worth and secure better compensation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {guides.map((guide, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    {guide.icon}
                    <span>{guide.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  {guide.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Head to the forum to discuss these strategies with peers
          </p>
          <Button variant="outline" size="sm">
            Advanced Guides
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NegotiationGuides;

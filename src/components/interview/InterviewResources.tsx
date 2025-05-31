
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, MessageSquare, Building, Lightbulb, Clock, CheckCircle } from 'lucide-react';

const InterviewResources = () => {
  const questionBanks = [
    { category: 'Behavioral', count: '50+', description: 'STAR method questions covering leadership, teamwork, and problem-solving' },
    { category: 'Technical', count: '100+', description: 'Role-specific technical questions and coding challenges' },
    { category: 'Situational', count: '30+', description: 'Hypothetical scenarios and case study questions' },
    { category: 'Industry-Specific', count: '40+', description: 'Questions tailored to your target industry' }
  ];

  const interviewTips = {
    before: [
      'Research the company thoroughly - mission, values, recent news',
      'Prepare 5-7 STAR examples covering different competencies',
      'Practice your elevator pitch and key talking points',
      'Prepare thoughtful questions about the role and company',
      'Test your technology setup for virtual interviews'
    ],
    during: [
      'Arrive 10-15 minutes early for in-person or join 5 minutes early for virtual',
      'Maintain good eye contact and positive body language',
      'Listen carefully to questions and ask for clarification if needed',
      'Use specific examples and quantify your achievements',
      'Show enthusiasm for the role and company'
    ],
    after: [
      'Send a thank-you email within 24 hours',
      'Reflect on the interview and note areas for improvement',
      'Follow up appropriately if you haven\'t heard back',
      'Keep applying to other opportunities while waiting',
      'Update your interview tracking and notes'
    ]
  };

  const commonQuestions = [
    'Tell me about yourself',
    'Why are you interested in this role?',
    'What are your greatest strengths and weaknesses?',
    'Describe a challenging situation and how you handled it',
    'Where do you see yourself in 5 years?',
    'Why are you leaving your current position?',
    'What questions do you have for us?'
  ];

  return (
    <div className="space-y-6">
      {/* Question Banks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Question Banks
          </CardTitle>
          <CardDescription>
            Comprehensive collections of interview questions by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questionBanks.map((bank, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{bank.category}</h4>
                  <Badge variant="secondary">{bank.count}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{bank.description}</p>
                <Button size="sm" variant="outline" className="w-full">
                  Practice Questions
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interview Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Interview Tips & Best Practices
          </CardTitle>
          <CardDescription>
            Expert guidance for every stage of the interview process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="before">
              <AccordionTrigger className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Before the Interview
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {interviewTips.before.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="during">
              <AccordionTrigger className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                During the Interview
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {interviewTips.during.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="after">
              <AccordionTrigger className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                After the Interview
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {interviewTips.after.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Common Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Most Common Interview Questions
          </CardTitle>
          <CardDescription>
            Essential questions you should be prepared to answer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {commonQuestions.map((question, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">{question}</span>
                <Button size="sm" variant="ghost">
                  Practice
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Industry Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Tech Industry Trends
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Finance Sector Guide
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Healthcare Interview Tips
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Startup Culture Guide
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salary Negotiation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Research Market Rates
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Negotiation Scripts
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Benefits Evaluation
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Counter-Offer Strategies
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InterviewResources;


import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const JobAutomationPanel = () => {
  const handleDownloadExtension = () => {
    // In a real implementation, this would link to the Chrome Web Store
    window.open("https://chrome.google.com/webstore/detail/streamline-extension", "_blank");
  };

  return (
    <Card className="w-full border-0 shadow-none">
      <CardContent className="space-y-6 pt-4">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            Extension
          </Badge>
          <h3 className="text-lg font-medium">Job Application Automation</h3>
        </div>
        
        <Alert className="bg-gray-50 border border-gray-200">
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-2">Application Automation is now available in our browser extension</p>
            <p className="text-sm">
              We've moved our application automation features to our browser extension for better performance and security.
              The extension can access job websites directly, fill out applications, and track your progress.
            </p>
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium mb-2">Extension Features</h4>
            <ul className="text-sm space-y-2">
              <li className="flex items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2"></div>
                Automatically fill job applications with your resume data
              </li>
              <li className="flex items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2"></div>
                Generate customized cover letters with AI
              </li>
              <li className="flex items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2"></div>
                Track application status across multiple platforms
              </li>
              <li className="flex items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2"></div>
                Apply to jobs with a single click
              </li>
            </ul>
          </div>
          
          <Button onClick={handleDownloadExtension} className="gap-2">
            <Download className="h-4 w-4" />
            Download Chrome Extension
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobAutomationPanel;

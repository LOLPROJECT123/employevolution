
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Search, ExternalLink } from "lucide-react";
import { validateJobUrl } from "@/utils/jobValidationUtils";
import { toast } from "sonner";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Check if this was a job URL that might have expired
    const isJobUrl = location.pathname.includes('/job/') || location.state?.fromJobApplication;
    if (isJobUrl && location.state?.originalJobUrl) {
      checkJobUrl(location.state.originalJobUrl);
    }
  }, [location.pathname, location.state]);

  // Check if the original job URL is still valid
  const checkJobUrl = async (url: string) => {
    if (!url) return;
    
    try {
      const isValid = await validateJobUrl(url);
      if (isValid) {
        toast.info(
          "The original job posting appears to be available on the employer's website",
          {
            duration: 8000,
            action: {
              label: "Visit",
              onClick: () => window.open(url, '_blank')
            }
          }
        );
      } else {
        toast.warning(
          "The job posting might have been removed or the URL has changed",
          { duration: 5000 }
        );
      }
    } catch (error) {
      console.error("Error checking job URL:", error);
    }
  };

  // Extract the URL to display to the user
  const attemptedUrl = location.pathname;
  const isJobUrl = attemptedUrl.includes('/job/') || location.state?.fromJobApplication;
  const jobId = location.state?.jobId;
  const originalJobUrl = location.state?.originalJobUrl;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {isJobUrl 
              ? "The job posting you're trying to access might have been removed or is temporarily unavailable."
              : `The page "${attemptedUrl}" doesn't exist or has been moved.`}
          </p>
        </div>
        
        <div className="space-y-3">
          {isJobUrl && (
            <>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Jobs
              </Button>
              
              {originalJobUrl && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(originalJobUrl, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Original Job Post
                </Button>
              )}
            </>
          )}
          
          <Link to="/jobs" className="block">
            <Button variant="outline" className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Browse All Jobs
            </Button>
          </Link>
          
          <Link to="/" className="block">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

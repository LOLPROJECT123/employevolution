
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Extract the URL to display to the user
  const attemptedUrl = location.pathname;
  const isJobUrl = attemptedUrl.includes('/job/') || location.state?.fromJobApplication;

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
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Jobs
            </Button>
          )}
          
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

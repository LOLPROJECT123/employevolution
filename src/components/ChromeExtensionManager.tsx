
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, AlertCircle, Check, X } from "lucide-react";
import { toast } from "sonner";

interface ExtensionStatus {
  installed: boolean;
  version?: string;
  permissions?: string[];
}

const EXTENSION_ID = "demo-extension-id"; // Replace with actual extension ID in production
const EXTENSION_URL = "https://chrome.google.com/webstore/detail/job-application-assistant/demo-extension-id";

const ChromeExtensionManager = () => {
  const [extensionStatus, setExtensionStatus] = useState<ExtensionStatus>({
    installed: false
  });
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkExtensionInstalled();
  }, []);

  const checkExtensionInstalled = () => {
    setIsChecking(true);

    try {
      // Attempt to message the extension
      if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(
          EXTENSION_ID,
          { action: "getStatus" },
          function(response) {
            const isInstalled = !!response && !chrome.runtime.lastError;
            
            setExtensionStatus({
              installed: isInstalled,
              version: response?.version,
              permissions: response?.permissions
            });
            
            setIsChecking(false);
          }
        );
      } else {
        // No chrome runtime available
        setExtensionStatus({ installed: false });
        setIsChecking(false);
      }
    } catch (error) {
      console.error("Error checking extension:", error);
      setExtensionStatus({ installed: false });
      setIsChecking(false);
    }
    
    // Fallback in case the message doesn't get a response
    setTimeout(() => {
      setIsChecking(false);
    }, 1000);
  };

  const handleInstallExtension = () => {
    try {
      window.open(EXTENSION_URL, "_blank");
      toast.success("Opening extension page", {
        description: "Please follow the instructions to install the extension"
      });
    } catch (error) {
      console.error("Error opening extension page:", error);
      toast.error("Failed to open extension page");
    }
  };

  const testExtension = () => {
    if (!extensionStatus.installed) {
      toast.error("Extension not installed");
      return;
    }

    toast.loading("Testing connection to extension...", {
      duration: 2000
    });

    try {
      if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(
          EXTENSION_ID,
          { action: "test" },
          function(response) {
            if (response && response.success) {
              toast.success("Extension is working correctly!");
            } else {
              toast.error("Extension test failed");
            }
          }
        );
      } else {
        toast.error("Chrome runtime not available");
      }
    } catch (error) {
      console.error("Error testing extension:", error);
      toast.error("Failed to test extension");
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Job Application Assistant</CardTitle>
        <CardDescription>
          Chrome Extension for automated job applications
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Extension Status</div>
          <div className="flex items-center">
            {isChecking ? (
              <div className="text-sm text-muted-foreground">Checking...</div>
            ) : extensionStatus.installed ? (
              <div className="flex items-center text-green-600">
                <Check className="w-4 h-4 mr-1" />
                <span>Installed</span>
              </div>
            ) : (
              <div className="flex items-center text-red-500">
                <X className="w-4 h-4 mr-1" />
                <span>Not Installed</span>
              </div>
            )}
          </div>
        </div>

        {extensionStatus.installed && extensionStatus.version && (
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Version</div>
            <div className="text-sm">{extensionStatus.version}</div>
          </div>
        )}

        <Alert variant="default" className={extensionStatus.installed ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {extensionStatus.installed
              ? "The extension is installed and ready to use for automated job applications."
              : "Install the extension to enable automated job application features."}
          </AlertDescription>
        </Alert>
      </CardContent>

      <CardFooter>
        {extensionStatus.installed ? (
          <Button onClick={testExtension} variant="outline" className="w-full">
            Test Extension Connection
          </Button>
        ) : (
          <Button onClick={handleInstallExtension} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Install Extension
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ChromeExtensionManager;

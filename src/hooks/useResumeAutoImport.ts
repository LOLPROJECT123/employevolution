
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { resumeAutoImportService } from '@/services/resumeAutoImportService';
import { toast } from '@/hooks/use-toast';

export const useResumeAutoImport = () => {
  const { user } = useAuth();
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const importResumeToProfile = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to import your resume.",
        variant: "destructive",
      });
      return null;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      toast({
        title: "Starting Import",
        description: "Parsing your resume and extracting profile information...",
      });

      setImportProgress(25);

      const extractedData = await resumeAutoImportService.importFromFile(file);

      setImportProgress(50);

      await resumeAutoImportService.saveToProfile(user.id, extractedData);

      setImportProgress(75);

      toast({
        title: "Import Successful",
        description: "Your resume data has been automatically imported to your profile.",
      });

      setImportProgress(100);

      // Reset progress after a delay
      setTimeout(() => {
        setImportProgress(0);
      }, 2000);

      return extractedData;

    } catch (error) {
      console.error('Resume import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import resume data. Please try again or import manually.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importResumeToProfile,
    isImporting,
    importProgress
  };
};


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FileText, Star, Trash2, Upload, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { resumeVersionService, ResumeVersion } from '@/services/resumeVersionService';
import { toast } from 'sonner';

const ResumeVersionManager: React.FC = () => {
  const { user } = useAuth();
  const [resumeVersions, setResumeVersions] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadResumeVersions();
    }
  }, [user]);

  const loadResumeVersions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const versions = await resumeVersionService.getResumeVersions(user.id);
      setResumeVersions(versions);
    } catch (error) {
      console.error('Error loading resume versions:', error);
      toast.error('Failed to load resume versions');
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async (resumeId: string) => {
    if (!user) return;

    try {
      const success = await resumeVersionService.setActiveResume(user.id, resumeId);
      if (success) {
        toast.success('Resume set as active');
        loadResumeVersions();
      } else {
        toast.error('Failed to set active resume');
      }
    } catch (error) {
      console.error('Error setting active resume:', error);
      toast.error('Failed to set active resume');
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!user) return;

    try {
      const success = await resumeVersionService.deleteResumeVersion(user.id, resumeId);
      if (success) {
        toast.success('Resume version deleted');
        loadResumeVersions();
      } else {
        toast.error('Failed to delete resume version');
      }
    } catch (error) {
      console.error('Error deleting resume version:', error);
      toast.error('Failed to delete resume version');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Resume Versions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {resumeVersions.length > 0 ? (
          <div className="space-y-3">
            {resumeVersions.map((resume) => (
              <div key={resume.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{resume.name}</h4>
                    {resume.is_active && (
                      <Badge className="bg-green-100 text-green-800">
                        <Star className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                    <Badge variant="outline">
                      v{resume.version_number}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Created: {formatDate(resume.created_at)}
                  </p>
                  {resume.updated_at !== resume.created_at && (
                    <p className="text-sm text-muted-foreground">
                      Updated: {formatDate(resume.updated_at)}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetActive(resume.id)}
                    disabled={resume.is_active}
                  >
                    {resume.is_active ? (
                      <Star className="h-4 w-4" />
                    ) : (
                      'Set Active'
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Resume Version</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{resume.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(resume.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No resume versions uploaded yet</p>
            <p className="text-sm">Upload your first resume to get started</p>
            <Button className="mt-4" variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
          </div>
        )}
        
        {resumeVersions.length > 0 && (
          <div className="pt-4 border-t">
            <Button className="w-full" variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload New Version
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeVersionManager;

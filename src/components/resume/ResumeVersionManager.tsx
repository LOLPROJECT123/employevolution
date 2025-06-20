import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FileText, Star, Trash2, Upload, Eye, Download, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { resumeVersionService, ResumeVersion } from '@/services/resumeVersionService';
import { resumeProfileImportService } from '@/services/resumeProfileImportService';
import { toast } from 'sonner';
import ResumeUpload from './ResumeUpload';
import ResumePreview from './ResumePreview';

interface ResumeVersionManagerProps {
  onDataImported?: () => void;
}

const ResumeVersionManager: React.FC<ResumeVersionManagerProps> = ({ onDataImported }) => {
  const { user } = useAuth();
  const [resumeVersions, setResumeVersions] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [previewResume, setPreviewResume] = useState<ResumeVersion | null>(null);

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

  const handleImportToProfile = async (resume: ResumeVersion) => {
    if (!user || !resume.parsed_data) {
      toast.error('No parsed data available for import');
      return;
    }

    console.log('🔄 Importing resume data to profile:', resume.parsed_data);
    setImportingId(resume.id);
    
    try {
      const importResult = await resumeProfileImportService.importResumeToProfile(
        user.id, 
        resume.parsed_data, 
        { replaceExisting: false, mergeData: true }
      );

      console.log('📊 Import result:', importResult);

      if (importResult.success) {
        const importedItems = [];
        if (importResult.imported.personalInfo) importedItems.push('personal info');
        if (importResult.imported.workExperiences > 0) importedItems.push(`${importResult.imported.workExperiences} work experiences`);
        if (importResult.imported.education > 0) importedItems.push(`${importResult.imported.education} education entries`);
        if (importResult.imported.projects > 0) importedItems.push(`${importResult.imported.projects} projects`);
        if (importResult.imported.skills > 0) importedItems.push(`${importResult.imported.skills} skills`);
        if (importResult.imported.languages > 0) importedItems.push(`${importResult.imported.languages} languages`);
        
        if (importedItems.length > 0) {
          toast.success(`Successfully imported: ${importedItems.join(', ')}`);
          // Notify parent component that data was imported
          if (onDataImported) {
            onDataImported();
          }
        } else {
          toast.info('No new data to import - your profile is already up to date');
        }
      } else {
        toast.error(`Import failed: ${importResult.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error importing to profile:', error);
      toast.error('Failed to import resume data to profile');
    } finally {
      setImportingId(null);
    }
  };

  const handleUploadSuccess = (newResume: ResumeVersion) => {
    setResumeVersions(prev => [newResume, ...prev]);
    setShowUpload(false);
    toast.success('Resume uploaded successfully!');
    
    // Notify parent component that data might have been imported
    if (onDataImported) {
      onDataImported();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDataQualityBadge = (resume: ResumeVersion) => {
    if (!resume.parsed_data) {
      return <Badge variant="outline" className="text-gray-500">No data parsed</Badge>;
    }

    const data = resume.parsed_data;
    let score = 0;
    let total = 7;

    // Check each data category
    if (data.personalInfo?.name) score++;
    if (data.personalInfo?.email) score++;
    if (data.personalInfo?.phone) score++;
    if (data.workExperiences?.length > 0) score++;
    if (data.education?.length > 0) score++;
    if (data.skills?.length > 0) score++;
    if (data.socialLinks?.linkedin || data.socialLinks?.github) score++;

    const percentage = Math.round((score / total) * 100);
    
    if (percentage >= 70) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Good ({percentage}%)</Badge>;
    } else if (percentage >= 40) {
      return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Fair ({percentage}%)</Badge>;
    } else {
      return <Badge variant="outline" className="text-red-600"><AlertCircle className="h-3 w-3 mr-1" />Limited ({percentage}%)</Badge>;
    }
  };

  const getExtractedDataSummary = (resume: ResumeVersion) => {
    if (!resume.parsed_data) return "No data extracted";

    const data = resume.parsed_data;
    const items = [];
    
    if (data.personalInfo?.name) items.push("Contact info");
    if (data.workExperiences?.length) items.push(`${data.workExperiences.length} work exp.`);
    if (data.education?.length) items.push(`${data.education.length} education`);
    if (data.projects?.length) items.push(`${data.projects.length} projects`);
    if (data.skills?.length) items.push(`${data.skills.length} skills`);
    if (data.languages?.length) items.push(`${data.languages.length} languages`);
    if (data.socialLinks?.linkedin) items.push("LinkedIn");
    if (data.socialLinks?.github) items.push("GitHub");

    return items.length > 0 ? items.join(" • ") : "Limited data extracted";
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
    <>
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
                      {getDataQualityBadge(resume)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Created: {formatDate(resume.created_at)}
                    </p>
                    {resume.parsed_data && (
                      <p className="text-xs text-muted-foreground">
                        {getExtractedDataSummary(resume)}
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

                    {resume.parsed_data && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleImportToProfile(resume)}
                        disabled={importingId === resume.id}
                        title="Import data to profile"
                      >
                        {importingId === resume.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewResume(resume)}
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
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={() => setShowUpload(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Resume
              </Button>
            </div>
          )}
          
          {resumeVersions.length > 0 && (
            <div className="pt-4 border-t">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => setShowUpload(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload New Version
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUpload && (
        <ResumeUpload
          onSuccess={handleUploadSuccess}
          onCancel={() => setShowUpload(false)}
        />
      )}

      {/* Preview Modal */}
      <ResumePreview
        resume={previewResume}
        isOpen={!!previewResume}
        onClose={() => setPreviewResume(null)}
      />
    </>
  );
};

export default ResumeVersionManager;

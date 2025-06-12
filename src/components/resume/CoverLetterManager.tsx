
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FileText, Star, Trash2, Upload, Eye, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import CoverLetterUpload from './CoverLetterUpload';

interface CoverLetter {
  id: string;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_default: boolean;
  usage_count: number;
  user_id: string;
}

const CoverLetterManager: React.FC = () => {
  const { user } = useAuth();
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [previewLetter, setPreviewLetter] = useState<CoverLetter | null>(null);

  useEffect(() => {
    if (user) {
      loadCoverLetters();
    }
  }, [user]);

  const loadCoverLetters = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Mock data for now - in real implementation, this would fetch from Supabase
      const mockLetters: CoverLetter[] = [
        {
          id: '1',
          name: 'Software Engineer Cover Letter',
          content: 'Dear Hiring Manager,\n\nI am writing to express my interest in the Software Engineer position...',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_default: true,
          usage_count: 5,
          user_id: user.id
        }
      ];
      setCoverLetters(mockLetters);
    } catch (error) {
      console.error('Error loading cover letters:', error);
      toast.error('Failed to load cover letters');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (letterId: string) => {
    try {
      setCoverLetters(prev => prev.map(letter => ({
        ...letter,
        is_default: letter.id === letterId
      })));
      toast.success('Cover letter set as default');
    } catch (error) {
      console.error('Error setting default cover letter:', error);
      toast.error('Failed to set default cover letter');
    }
  };

  const handleDelete = async (letterId: string) => {
    try {
      setCoverLetters(prev => prev.filter(letter => letter.id !== letterId));
      toast.success('Cover letter deleted');
    } catch (error) {
      console.error('Error deleting cover letter:', error);
      toast.error('Failed to delete cover letter');
    }
  };

  const handleUploadSuccess = (newLetter: CoverLetter) => {
    setCoverLetters(prev => [newLetter, ...prev]);
    setShowUpload(false);
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Cover Letters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {coverLetters.length > 0 ? (
            <div className="space-y-3">
              {coverLetters.map((letter) => (
                <div key={letter.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{letter.name}</h4>
                      {letter.is_default && (
                        <Badge className="bg-green-100 text-green-800">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                      <Badge variant="outline">
                        Used {letter.usage_count} times
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created: {formatDate(letter.created_at)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {letter.content.length} characters
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(letter.id)}
                      disabled={letter.is_default}
                    >
                      {letter.is_default ? (
                        <Star className="h-4 w-4" />
                      ) : (
                        'Set Default'
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewLetter(letter)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                    >
                      <Edit className="h-4 w-4" />
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
                          <AlertDialogTitle>Delete Cover Letter</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{letter.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(letter.id)}
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
              <p>No cover letters created yet</p>
              <p className="text-sm">Create your first cover letter to get started</p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={() => setShowUpload(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Create Cover Letter
              </Button>
            </div>
          )}
          
          {coverLetters.length > 0 && (
            <div className="pt-4 border-t">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => setShowUpload(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Create New Cover Letter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUpload && (
        <CoverLetterUpload
          onSuccess={handleUploadSuccess}
          onCancel={() => setShowUpload(false)}
        />
      )}

      {/* Preview Modal */}
      {previewLetter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{previewLetter.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewLetter(null)}
              >
                ×
              </Button>
            </div>
            <div className="whitespace-pre-wrap text-sm">
              {previewLetter.content}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CoverLetterManager;

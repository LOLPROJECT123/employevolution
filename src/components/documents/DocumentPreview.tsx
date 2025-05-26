
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download, 
  Star, 
  Calendar, 
  HardDrive,
  Eye,
  Building,
  Briefcase,
  Clock
} from 'lucide-react';
import { UserDocument, DocumentUsage, documentService } from '@/services/documentService';
import { toast } from '@/hooks/use-toast';

interface DocumentPreviewProps {
  document: UserDocument;
  onClose: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, onClose }) => {
  const [usage, setUsage] = useState<DocumentUsage[]>([]);
  const [loadingUsage, setLoadingUsage] = useState(true);

  useEffect(() => {
    loadUsage();
  }, [document.id]);

  const loadUsage = async () => {
    try {
      setLoadingUsage(true);
      const usageData = await documentService.getDocumentUsage(document.id);
      setUsage(usageData);
    } catch (error) {
      console.error('Failed to load document usage:', error);
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleDownload = async () => {
    try {
      const url = await documentService.getDocumentUrl(document.file_path);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeColor = (type: string) => {
    const colors = {
      resume: 'bg-blue-100 text-blue-800',
      cover_letter: 'bg-green-100 text-green-800',
      portfolio: 'bg-purple-100 text-purple-800',
      certificate: 'bg-orange-100 text-orange-800',
      transcript: 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      resume: 'Resume',
      cover_letter: 'Cover Letter',
      portfolio: 'Portfolio',
      certificate: 'Certificate',
      transcript: 'Transcript'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Document Preview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{document.name}</h2>
                {document.is_default && (
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Badge className={getTypeColor(document.type)} variant="secondary">
                  {getTypeLabel(document.type)}
                </Badge>
                <span className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  {formatFileSize(document.file_size)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(document.created_at).toLocaleDateString()}
                </span>
                <span>Version {document.version}</span>
              </div>
            </div>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Document Details */}
          {document.description && (
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-muted-foreground">{document.description}</p>
            </div>
          )}

          {document.tags && document.tags.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Usage History */}
          <div>
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Usage History ({usage.length})
            </h3>
            
            {loadingUsage ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading usage history...</p>
              </div>
            ) : usage.length > 0 ? (
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {usage.map((use) => (
                    <div key={use.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{use.company_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{use.position_title}</span>
                          </div>
                          {use.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{use.notes}</p>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{new Date(use.used_at).toLocaleDateString()}</p>
                          <p>{new Date(use.used_at).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">This document hasn't been used in any applications yet.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreview;

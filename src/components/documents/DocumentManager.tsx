
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  Star, 
  Trash2, 
  Download, 
  Eye,
  Plus,
  Search
} from 'lucide-react';
import { documentService, UserDocument } from '@/services/documentService';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';
import DocumentPreview from './DocumentPreview';

const DocumentManager = () => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<UserDocument[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'resume' | 'cover_letter' | 'portfolio' | 'certificate'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<UserDocument | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, activeTab, searchQuery]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentService.getDocuments();
      setDocuments(docs);
    } catch (error) {
      toast({
        title: "Error loading documents",
        description: "Failed to load your documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (activeTab !== 'all') {
      filtered = filtered.filter(doc => doc.type === activeTab);
    }

    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredDocuments(filtered);
  };

  const handleUploadSuccess = (document: UserDocument) => {
    setDocuments(prev => [document, ...prev]);
    setShowUpload(false);
    toast({
      title: "Document uploaded",
      description: `${document.name} has been uploaded successfully.`,
    });
  };

  const handleDelete = async (document: UserDocument) => {
    try {
      await documentService.deleteDocument(document.id);
      setDocuments(prev => prev.filter(doc => doc.id !== document.id));
      toast({
        title: "Document deleted",
        description: `${document.name} has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error deleting document",
        description: "Failed to delete the document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (document: UserDocument) => {
    try {
      await documentService.setDefaultDocument(document.id, document.type);
      setDocuments(prev => 
        prev.map(doc => ({
          ...doc,
          is_default: doc.id === document.id && doc.type === document.type
        }))
      );
      toast({
        title: "Default document updated",
        description: `${document.name} is now your default ${document.type}.`,
      });
    } catch (error) {
      toast({
        title: "Error setting default",
        description: "Failed to set default document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDocumentCounts = () => {
    return {
      all: documents.length,
      resume: documents.filter(d => d.type === 'resume').length,
      cover_letter: documents.filter(d => d.type === 'cover_letter').length,
      portfolio: documents.filter(d => d.type === 'portfolio').length,
      certificate: documents.filter(d => d.type === 'certificate').length,
    };
  };

  const counts = getDocumentCounts();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading documents...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Manager
            </CardTitle>
            <Button onClick={() => setShowUpload(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Document Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
                <TabsTrigger value="resume">Resumes ({counts.resume})</TabsTrigger>
                <TabsTrigger value="cover_letter">Cover Letters ({counts.cover_letter})</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio ({counts.portfolio})</TabsTrigger>
                <TabsTrigger value="certificate">Certificates ({counts.certificate})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                <DocumentList 
                  documents={filteredDocuments}
                  onDelete={handleDelete}
                  onSetDefault={handleSetDefault}
                  onPreview={setSelectedDocument}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUpload && (
        <DocumentUpload
          onSuccess={handleUploadSuccess}
          onCancel={() => setShowUpload(false)}
        />
      )}

      {/* Preview Modal */}
      {selectedDocument && (
        <DocumentPreview
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
};

export default DocumentManager;

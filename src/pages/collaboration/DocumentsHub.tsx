
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CollaborativeEditor } from '@/components/collaboration/CollaborativeEditor';
import { Plus, FileText, Users, Search, Filter } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  type: 'resume' | 'cover_letter' | 'document';
  content: string;
  collaborators: string[];
  lastModified: Date;
  owner: string;
  isShared: boolean;
}

export const DocumentsHub: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'my' | 'shared'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Mock documents - in real app, load from Supabase
      const mockDocs: Document[] = [
        {
          id: '1',
          title: 'Senior Developer Resume',
          type: 'resume',
          content: 'Professional resume content...',
          collaborators: [user.id, 'collaborator1'],
          lastModified: new Date(),
          owner: user.id,
          isShared: true
        },
        {
          id: '2',
          title: 'Tech Company Cover Letter',
          type: 'cover_letter',
          content: 'Dear Hiring Manager...',
          collaborators: [user.id],
          lastModified: new Date(Date.now() - 86400000),
          owner: user.id,
          isShared: false
        }
      ];
      
      setDocuments(mockDocs);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewDocument = () => {
    const newDoc: Document = {
      id: Date.now().toString(),
      title: 'New Document',
      type: 'document',
      content: '',
      collaborators: [user?.id || ''],
      lastModified: new Date(),
      owner: user?.id || '',
      isShared: false
    };
    
    setDocuments(prev => [newDoc, ...prev]);
    setSelectedDocument(newDoc);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'my' && doc.owner === user?.id) ||
      (filter === 'shared' && doc.isShared && doc.owner !== user?.id);
    
    return matchesSearch && matchesFilter;
  });

  const saveDocument = (content: string) => {
    if (!selectedDocument) return;
    
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === selectedDocument.id
          ? { ...doc, content, lastModified: new Date() }
          : doc
      )
    );
    
    toast({
      title: "Document Saved",
      description: "Your changes have been saved successfully"
    });
  };

  if (selectedDocument) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => setSelectedDocument(null)}
          >
            ← Back to Documents
          </Button>
        </div>
        
        <CollaborativeEditor
          documentId={selectedDocument.id}
          initialContent={selectedDocument.content}
          onSave={saveDocument}
          title={selectedDocument.title}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Hub</h1>
          <p className="text-muted-foreground">Collaborate on resumes, cover letters, and documents</p>
        </div>
        
        <Button onClick={createNewDocument}>
          <Plus className="h-4 w-4 mr-2" />
          New Document
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'my' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('my')}
          >
            My Documents
          </Button>
          <Button
            variant={filter === 'shared' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('shared')}
          >
            Shared
          </Button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredDocuments.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No documents found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first document to get started'}
            </p>
            <Button onClick={createNewDocument}>
              <Plus className="h-4 w-4 mr-2" />
              Create Document
            </Button>
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <Card key={doc.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline">{doc.type.replace('_', ' ')}</Badge>
                      {doc.isShared && <Badge variant="secondary">Shared</Badge>}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Last modified: {doc.lastModified.toLocaleDateString()}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {doc.content || 'No content yet...'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {doc.collaborators.length} collaborator{doc.collaborators.length !== 1 ? 's' : ''}
                      </span>
                      <div className="flex -space-x-2 ml-2">
                        {doc.collaborators.slice(0, 3).map((collaboratorId, index) => (
                          <Avatar key={collaboratorId} className="h-6 w-6 border-2 border-background">
                            <AvatarFallback className="text-xs">
                              {index === 0 ? 'You' : `C${index}`}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      Open
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentsHub;

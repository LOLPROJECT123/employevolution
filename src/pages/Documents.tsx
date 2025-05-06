
"use client"

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, FileUp, Search, MoreHorizontal, Plus, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface DocumentItem {
  id: string;
  name: string;
  type: 'resume' | 'cover_letter' | 'other';
  createdAt: string;
  source: 'uploaded' | 'generated';
}

const Documents = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: '1',
      name: 'Software_Engineer_Resume.pdf',
      type: 'resume',
      createdAt: '2025-04-15T10:30:00Z',
      source: 'uploaded'
    },
    {
      id: '2',
      name: 'Frontend_Developer_Resume.pdf',
      type: 'resume',
      createdAt: '2025-04-10T14:22:00Z',
      source: 'generated'
    },
    {
      id: '3',
      name: 'Cover_Letter_TechCorp.pdf',
      type: 'cover_letter',
      createdAt: '2025-04-05T09:15:00Z',
      source: 'generated'
    }
  ]);

  const handleUpload = () => {
    toast.success('Upload feature coming soon!');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Documents</h1>
        <Button onClick={handleUpload} className="mt-4 sm:mt-0">
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="h-12 w-12 rounded-lg bg-[#E4F3FF] flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-1">Create Resume</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Build a professional resume with our easy-to-use templates.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="h-12 w-12 rounded-lg bg-[#F8E4FF] flex items-center justify-center mb-4">
              <FileUp className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="font-medium mb-1">Create Cover Letter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate customized cover letters for your job applications.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="h-12 w-12 rounded-lg bg-[#FFE4D6] flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="font-medium mb-1">Other Documents</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create portfolios, references, and other supporting materials.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-lg font-medium">My Documents</h2>
          <div className="flex gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search documents..."
                className="pl-9 pr-4 py-2 w-full border rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Type</th>
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">Source</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {documents.map(document => (
                <tr key={document.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/70">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-slate-400" />
                      <span>{document.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 capitalize">
                    {document.type.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4">
                    {formatDate(document.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="capitalize">
                      {document.source}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documents;

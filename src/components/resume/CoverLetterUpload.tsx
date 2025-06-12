
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

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

interface CoverLetterUploadProps {
  onSuccess: (coverLetter: CoverLetter) => void;
  onCancel: () => void;
}

const CoverLetterUpload: React.FC<CoverLetterUploadProps> = ({ onSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt')) {
        setFile(selectedFile);
        if (!name) {
          setName(selectedFile.name.replace('.txt', ''));
        }
        
        // Read file content
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setContent(text);
        };
        reader.readAsText(selectedFile);
      } else {
        toast.error('Please upload a text file (.txt)');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !content.trim()) {
      toast.error('Please provide both a name and content for the cover letter');
      return;
    }

    setUploading(true);
    
    try {
      // Create a mock cover letter object (in real implementation, this would call an API)
      const newCoverLetter: CoverLetter = {
        id: crypto.randomUUID(),
        name: name.trim(),
        content: content.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_default: false,
        usage_count: 0,
        user_id: 'current-user-id' // This should come from auth context
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess(newCoverLetter);
      toast.success('Cover letter saved successfully!');
    } catch (error) {
      console.error('Error saving cover letter:', error);
      toast.error('Failed to save cover letter');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Cover Letter</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Cover Letter Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Software Engineer Cover Letter"
              required
            />
          </div>

          <div>
            <Label htmlFor="file-upload">Upload Text File (Optional)</Label>
            <div className="mt-1">
              <input
                id="file-upload"
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {file ? file.name : 'Choose Text File'}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="content">Cover Letter Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your cover letter content here..."
              rows={12}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Saving...' : 'Save Cover Letter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CoverLetterUpload;

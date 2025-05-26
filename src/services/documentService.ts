
import { supabase } from '@/integrations/supabase/client';

export interface UserDocument {
  id: string;
  user_id: string;
  name: string;
  type: 'resume' | 'cover_letter' | 'portfolio' | 'certificate' | 'transcript';
  file_path: string;
  file_size: number;
  file_type: string;
  version: number;
  is_default: boolean;
  description?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface DocumentUsage {
  id: string;
  document_id: string;
  application_id?: string;
  company_name: string;
  position_title: string;
  used_at: string;
  notes?: string;
}

class DocumentService {
  async uploadDocument(
    file: File,
    type: UserDocument['type'],
    name?: string,
    description?: string,
    tags?: string[]
  ): Promise<UserDocument> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    
    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-documents')
      .upload(fileName, file);

    if (uploadError) throw new Error(`Failed to upload file: ${uploadError.message}`);

    // Create document record
    const { data, error } = await supabase
      .from('user_documents')
      .insert({
        user_id: user.id,
        name: name || file.name,
        type,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.type,
        description,
        tags
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to save document: ${error.message}`);
    return data as UserDocument;
  }

  async getDocuments(type?: UserDocument['type']): Promise<UserDocument[]> {
    let query = supabase
      .from('user_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch documents: ${error.message}`);
    return data as UserDocument[];
  }

  async deleteDocument(id: string): Promise<void> {
    const { data: document, error: fetchError } = await supabase
      .from('user_documents')
      .select('file_path')
      .eq('id', id)
      .single();

    if (fetchError) throw new Error(`Document not found: ${fetchError.message}`);

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('user-documents')
      .remove([document.file_path]);

    if (storageError) throw new Error(`Failed to delete file: ${storageError.message}`);

    // Delete from database
    const { error } = await supabase
      .from('user_documents')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete document: ${error.message}`);
  }

  async setDefaultDocument(id: string, type: UserDocument['type']): Promise<void> {
    // First, unset all defaults for this type
    await supabase
      .from('user_documents')
      .update({ is_default: false })
      .eq('type', type);

    // Set the new default
    const { error } = await supabase
      .from('user_documents')
      .update({ is_default: true })
      .eq('id', id);

    if (error) throw new Error(`Failed to set default document: ${error.message}`);
  }

  async getDocumentUrl(filePath: string): Promise<string> {
    const { data } = await supabase.storage
      .from('user-documents')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    return data?.signedUrl || '';
  }

  async trackDocumentUsage(
    documentId: string,
    companyName: string,
    positionTitle: string,
    applicationId?: string,
    notes?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('document_usage')
      .insert({
        document_id: documentId,
        application_id: applicationId,
        company_name: companyName,
        position_title: positionTitle,
        notes
      });

    if (error) throw new Error(`Failed to track document usage: ${error.message}`);
  }

  async getDocumentUsage(documentId: string): Promise<DocumentUsage[]> {
    const { data, error } = await supabase
      .from('document_usage')
      .select('*')
      .eq('document_id', documentId)
      .order('used_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch document usage: ${error.message}`);
    return data as DocumentUsage[];
  }
}

export const documentService = new DocumentService();


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { DataAnonymizationService } from '@/services/dataAnonymizationService';
import { Shield, Download, Trash2, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const PrivacyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleExportData = async (format: 'json' | 'csv' | 'xml') => {
    if (!user) return;

    setLoading(prev => ({ ...prev, [`export_${format}`]: true }));
    try {
      const result = await DataAnonymizationService.exportUserData(user.id, format);
      
      if (result.success && result.data) {
        // Create download
        const blob = new Blob(
          [format === 'json' ? JSON.stringify(result.data, null, 2) : result.data], 
          { type: format === 'json' ? 'application/json' : 'text/plain' }
        );
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.fileName;
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success(`Data exported successfully as ${format.toUpperCase()}`);
      } else {
        toast.error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    } finally {
      setLoading(prev => ({ ...prev, [`export_${format}`]: false }));
    }
  };

  const handleAnonymizeData = async () => {
    if (!user) return;

    setLoading(prev => ({ ...prev, anonymize: true }));
    try {
      const result = await DataAnonymizationService.anonymizeUserData(user.id);
      
      if (result.success) {
        toast.success(`Successfully anonymized ${result.anonymizedFields.length} fields`);
      } else {
        toast.error(result.error || 'Anonymization failed');
      }
    } catch (error) {
      console.error('Anonymization failed:', error);
      toast.error('Failed to anonymize data');
    } finally {
      setLoading(prev => ({ ...prev, anonymize: false }));
    }
  };

  const handleDeleteData = async () => {
    if (!user || !confirmDelete) return;

    setLoading(prev => ({ ...prev, delete: true }));
    try {
      const result = await DataAnonymizationService.deleteUserData(user.id, true);
      
      if (result.success) {
        toast.success('All data has been successfully deleted');
        // In a real app, you would log the user out and redirect
      } else {
        toast.error(result.error || 'Deletion failed');
      }
    } catch (error) {
      console.error('Deletion failed:', error);
      toast.error('Failed to delete data');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Privacy & Data Management</h1>
      </div>

      {/* GDPR Rights Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Data Rights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Eye className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h3 className="font-semibold">Right to Access</h3>
                <p className="text-sm text-gray-600">Export and review all your personal data</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h3 className="font-semibold">Right to Anonymization</h3>
                <p className="text-sm text-gray-600">Anonymize your personal information</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Trash2 className="h-5 w-5 text-red-500 mt-1" />
              <div>
                <h3 className="font-semibold">Right to be Forgotten</h3>
                <p className="text-sm text-gray-600">Permanently delete all your data</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-purple-500 mt-1" />
              <div>
                <h3 className="font-semibold">Data Portability</h3>
                <p className="text-sm text-gray-600">Export data in multiple formats</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export Your Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Download a copy of all your personal data in your preferred format.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleExportData('json')}
              disabled={loading.export_json}
              variant="outline"
            >
              {loading.export_json ? 'Exporting...' : 'Export as JSON'}
            </Button>
            
            <Button
              onClick={() => handleExportData('csv')}
              disabled={loading.export_csv}
              variant="outline"
            >
              {loading.export_csv ? 'Exporting...' : 'Export as CSV'}
            </Button>
            
            <Button
              onClick={() => handleExportData('xml')}
              disabled={loading.export_xml}
              variant="outline"
            >
              {loading.export_xml ? 'Exporting...' : 'Export as XML'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Anonymization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Anonymize Your Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Anonymization will replace your personal information with anonymous placeholders. 
              This action cannot be undone, but you can continue using the service.
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Anonymizes:</Badge>
            <span className="text-sm">Name, Email, Phone, Address</span>
          </div>
          
          <Button
            onClick={handleAnonymizeData}
            disabled={loading.anonymize}
            variant="secondary"
          >
            {loading.anonymize ? 'Anonymizing...' : 'Anonymize My Data'}
          </Button>
        </CardContent>
      </Card>

      {/* Data Deletion */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            <span>Delete All Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Warning:</strong> This will permanently delete all your data including profile, 
              applications, communications, and preferences. This action cannot be undone.
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="confirmDelete"
              checked={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.checked)}
            />
            <label htmlFor="confirmDelete" className="text-sm">
              I understand this action is permanent and cannot be undone
            </label>
          </div>
          
          <Button
            onClick={handleDeleteData}
            disabled={!confirmDelete || loading.delete}
            variant="destructive"
          >
            {loading.delete ? 'Deleting...' : 'Permanently Delete All Data'}
          </Button>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Data Protection Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-2">
            If you have questions about your data rights or need assistance:
          </p>
          <p className="text-sm">
            Email: <a href="mailto:privacy@employevolution.com" className="text-blue-600 hover:underline">
              privacy@employevolution.com
            </a>
          </p>
          <p className="text-sm">
            Data Protection Officer: <a href="mailto:dpo@employevolution.com" className="text-blue-600 hover:underline">
              dpo@employevolution.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyDashboard;

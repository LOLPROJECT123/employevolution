
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle,
  Copy,
  RotateCcw
} from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  service: string;
  masked_key: string;
  created_at: string;
  last_used?: string;
  is_active: boolean;
}

export const APIKeyManager: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKey, setNewKey] = useState({
    name: '',
    service: '',
    key: ''
  });

  const services = [
    { id: 'openai', name: 'OpenAI', description: 'AI-powered resume optimization and chat' },
    { id: 'linkedin', name: 'LinkedIn', description: 'Profile import and networking' },
    { id: 'sendgrid', name: 'SendGrid', description: 'Email automation and templates' },
    { id: 'greenhouse', name: 'Greenhouse', description: 'ATS integration for job tracking' },
    { id: 'lever', name: 'Lever', description: 'ATS integration for applications' },
    { id: 'google', name: 'Google Calendar', description: 'Interview scheduling and reminders' }
  ];

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    // Mock API keys data
    const mockKeys: APIKey[] = [
      {
        id: '1',
        name: 'Production OpenAI',
        service: 'openai',
        masked_key: 'sk-...abc123',
        created_at: '2024-01-15T10:00:00Z',
        last_used: '2024-01-20T15:30:00Z',
        is_active: true
      },
      {
        id: '2',
        name: 'SendGrid Main',
        service: 'sendgrid',
        masked_key: 'SG....xyz789',
        created_at: '2024-01-10T08:00:00Z',
        is_active: true
      }
    ];
    setApiKeys(mockKeys);
  };

  const handleAddKey = () => {
    if (!newKey.name || !newKey.service || !newKey.key) {
      toast.error('Please fill in all fields');
      return;
    }

    const maskedKey = `${newKey.key.substring(0, 3)}...${newKey.key.slice(-6)}`;
    const apiKey: APIKey = {
      id: Date.now().toString(),
      name: newKey.name,
      service: newKey.service,
      masked_key: maskedKey,
      created_at: new Date().toISOString(),
      is_active: true
    };

    setApiKeys(prev => [...prev, apiKey]);
    setNewKey({ name: '', service: '', key: '' });
    toast.success('API key added successfully');
  };

  const handleToggleVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
  };

  const handleToggleActive = (keyId: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === keyId ? { ...key, is_active: !key.is_active } : key
    ));
    toast.success('API key status updated');
  };

  const handleDeleteKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
    toast.success('API key deleted');
  };

  const getServiceInfo = (serviceId: string) => {
    return services.find(s => s.id === serviceId) || { name: serviceId, description: '' };
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">API Key Manager</h1>
        <p className="text-muted-foreground">Manage your external service API keys securely</p>
      </div>

      <Tabs defaultValue="keys" className="space-y-6">
        <TabsList>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="add">Add New Key</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          <div className="grid gap-4">
            {apiKeys.map((apiKey) => {
              const serviceInfo = getServiceInfo(apiKey.service);
              return (
                <Card key={apiKey.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <Key className="h-4 w-4" />
                          <span>{apiKey.name}</span>
                          <Badge variant={apiKey.is_active ? "default" : "secondary"}>
                            {apiKey.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{serviceInfo.name}</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleVisibility(apiKey.id)}
                        >
                          {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyKey(apiKey.masked_key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Label>Key:</Label>
                        <code className="px-2 py-1 bg-muted rounded text-sm">
                          {showKeys[apiKey.id] ? apiKey.masked_key : apiKey.masked_key}
                        </code>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>
                        {apiKey.last_used && (
                          <span>Last used: {new Date(apiKey.last_used).toLocaleDateString()}</span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(apiKey.id)}
                        >
                          {apiKey.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteKey(apiKey.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => {
              const hasKey = apiKeys.some(key => key.service === service.id && key.is_active);
              return (
                <Card key={service.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {service.name}
                      {hasKey ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={hasKey ? "default" : "secondary"}>
                      {hasKey ? "Configured" : "Not Configured"}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New API Key</CardTitle>
              <CardDescription>
                Add a new API key for external service integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  API keys are encrypted and stored securely. Never share your API keys.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="key-name">Key Name</Label>
                <Input
                  id="key-name"
                  placeholder="e.g., Production OpenAI"
                  value={newKey.name}
                  onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <select
                  id="service"
                  className="w-full p-2 border rounded-md"
                  value={newKey.service}
                  onChange={(e) => setNewKey(prev => ({ ...prev, service: e.target.value }))}
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your API key"
                  value={newKey.key}
                  onChange={(e) => setNewKey(prev => ({ ...prev, key: e.target.value }))}
                />
              </div>

              <Button onClick={handleAddKey} className="w-full">
                Add API Key
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

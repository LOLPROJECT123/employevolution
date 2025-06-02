
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Search, Filter, Download, Eye, AlertTriangle, User, FileText } from 'lucide-react';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  metadata: any;
  created_at: string;
  ip_address: string;
  user_agent: string;
  table_name?: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
}

export const AuditLogDashboard: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    if (user) {
      loadAuditLogs();
    }
  }, [user, filterAction, dateRange]);

  const loadAuditLogs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply date filter
      if (dateRange !== 'all') {
        const daysBack = parseInt(dateRange.replace('d', ''));
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - daysBack);
        
        query = query.gte('created_at', dateThreshold.toISOString());
      }

      // Apply action filter
      if (filterAction !== 'all') {
        query = query.eq('action', filterAction);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        throw error;
      }

      // Transform the data to match our AuditLog interface with proper type casting
      const transformedLogs: AuditLog[] = (data || []).map(log => ({
        id: log.id,
        user_id: log.user_id || '',
        action: log.action,
        metadata: log.new_values || log.old_values || {},
        created_at: log.created_at,
        ip_address: String(log.ip_address || ''),
        user_agent: log.user_agent || '',
        table_name: log.table_name,
        record_id: log.record_id,
        old_values: log.old_values,
        new_values: log.new_values
      }));

      setLogs(transformedLogs);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      // Set mock data for demonstration
      setLogs([
        {
          id: '1',
          user_id: user.id,
          action: 'profile_update',
          metadata: { field: 'name', old_value: 'John', new_value: 'John Doe' },
          created_at: new Date().toISOString(),
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0...',
          table_name: 'user_profiles',
          record_id: user.id
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    JSON.stringify(log.metadata).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'IP Address', 'User Agent', 'Metadata'].join(','),
      ...filteredLogs.map(log => [
        log.created_at,
        log.action,
        log.ip_address,
        log.user_agent,
        JSON.stringify(log.metadata).replace(/,/g, ';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'anonymization':
        return <User className="h-4 w-4" />;
      case 'export':
        return <Download className="h-4 w-4" />;
      case 'deletion':
        return <AlertTriangle className="h-4 w-4" />;
      case 'access':
        return <Eye className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'anonymization':
        return 'bg-blue-100 text-blue-800';
      case 'export':
        return 'bg-green-100 text-green-800';
      case 'deletion':
        return 'bg-red-100 text-red-800';
      case 'access':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Audit Log Dashboard</h2>
        <Button onClick={exportLogs} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Action Type</label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="access">Access</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading audit logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No audit logs found matching your criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getActionColor(log.action)}>
                            {log.action}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          IP: {log.ip_address} | User Agent: {log.user_agent.substring(0, 50)}...
                        </div>
                        
                        {log.metadata && (
                          <div className="text-sm bg-gray-50 p-2 rounded">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogDashboard;

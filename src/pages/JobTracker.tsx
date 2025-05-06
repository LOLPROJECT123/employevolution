
"use client"

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Download } from 'lucide-react';
import { JobApplication } from '@/types/dashboard';

const mockApplications: JobApplication[] = [
  {
    id: '1',
    title: 'Software Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    status: 'saved',
    date: '2025-04-18',
    logo: 'https://picsum.photos/id/1/30/30'
  },
  {
    id: '2',
    title: 'Frontend Developer',
    company: 'UX Solutions',
    location: 'Remote',
    status: 'applied',
    date: '2025-04-15',
    logo: 'https://picsum.photos/id/2/30/30'
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    company: 'Startup Inc.',
    location: 'Austin, TX',
    status: 'interviewing',
    date: '2025-04-10',
    logo: 'https://picsum.photos/id/3/30/30'
  },
  {
    id: '4',
    title: 'Senior React Developer',
    company: 'Enterprise Co.',
    location: 'New York, NY',
    status: 'offer',
    date: '2025-04-05',
    logo: 'https://picsum.photos/id/4/30/30'
  },
  {
    id: '5',
    title: 'Junior Developer',
    company: 'Small Agency',
    location: 'Chicago, IL',
    status: 'rejected',
    date: '2025-04-01',
    logo: 'https://picsum.photos/id/5/30/30'
  }
];

const statusColumns = [
  { key: 'saved', label: 'Saved' },
  { key: 'applied', label: 'Applied' },
  { key: 'interviewing', label: 'Interviewing' },
  { key: 'offer', label: 'Offer' },
  { key: 'rejected', label: 'Rejected' }
];

const JobTracker = () => {
  const [applications] = useState<JobApplication[]>(mockApplications);
  const [searchTerm, setSearchTerm] = useState('');

  const filterApplicationsByStatus = (status: string) => {
    return applications.filter(app => app.status === status);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-6">Job Application Tracker</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search applications..."
              className="pl-9 pr-4 py-2 w-full border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-6">
        {statusColumns.map((column) => (
          <div key={column.key} className="min-w-[250px]">
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-t-md font-medium flex items-center justify-between">
              <span>{column.label}</span>
              <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs">
                {filterApplicationsByStatus(column.key).length}
              </span>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-b-md h-[70vh] overflow-y-auto p-2">
              {filterApplicationsByStatus(column.key).length > 0 ? (
                filterApplicationsByStatus(column.key).map((application) => (
                  <Card key={application.id} className="mb-2 hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                          {application.logo ? (
                            <img src={application.logo} alt={application.company} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-500 font-bold">
                              {application.company.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{application.title}</h3>
                          <p className="text-sm text-muted-foreground">{application.company}</p>
                          <div className="text-xs text-muted-foreground mt-1">{application.location}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No applications
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default JobTracker;

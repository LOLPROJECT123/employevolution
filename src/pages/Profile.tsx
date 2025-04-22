
"use client"

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, FileText, BriefcaseIcon, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import ProfileDetails from '@/components/profile/ProfileDetails';

const Profile = () => {
  const [isPublic, setIsPublic] = useState(true);
  
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Profile Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xl">
                  J
                </div>
                <div>
                  <h3 className="font-medium">Jessica Chen</h3>
                  <p className="text-sm text-muted-foreground">jessica@example.com</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Public Profile</p>
                    <p className="text-xs text-muted-foreground">Allow employers to discover your profile</p>
                  </div>
                  <Switch 
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md">
                  <div className="flex gap-2 items-center text-sm font-medium mb-1">
                    <Check className="h-4 w-4 text-primary" />
                    Profile completion
                  </div>
                  <p className="text-xs text-muted-foreground">Your profile is 90% complete</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Career Hub</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="#">
                  <BriefcaseIcon className="h-4 w-4 mr-2" />
                  Career Goals
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="#">
                  <FileText className="h-4 w-4 mr-2" />
                  Resume Manager
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="#">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Profile
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-[#E4F3FF] flex items-center justify-center mb-3">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-1">Autofill Applications</h3>
                <p className="text-sm text-muted-foreground">
                  Apply to jobs quickly with saved profile information
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-[#F8E4FF] flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-medium mb-1">Tailored Materials</h3>
                <p className="text-sm text-muted-foreground">
                  Customize your resume and cover letters for each job
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle>Resume Preview</CardTitle>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <ProfileDetails />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;


import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import ProfileSettings from '@/components/ProfileSettings';

const Profile = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Profile Sidebar */}
          <Card className="w-full md:w-1/4">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-xl font-bold">John Doe</h2>
                  <p className="text-sm text-muted-foreground">Software Engineer</p>
                </div>
                <Button className="w-full">Edit Profile</Button>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <p className="text-sm flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>john.doe@example.com</span>
                </p>
                <p className="text-sm flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span>San Francisco, CA</span>
                </p>
                <p className="text-sm flex justify-between">
                  <span className="text-muted-foreground">Joined:</span>
                  <span>January 2023</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="flex-1">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="preferences">Job Preferences</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Overview</CardTitle>
                    <CardDescription>
                      View and manage your profile information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">About Me</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          Software engineer with 5+ years of experience in web development,
                          specializing in React and Node.js. Passionate about creating
                          user-friendly interfaces and solving complex problems.
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-medium">Experience</h3>
                        <div className="mt-2 space-y-3">
                          <div>
                            <p className="font-medium">Senior Developer at XYZ Corp</p>
                            <p className="text-sm text-muted-foreground">
                              2020 - Present
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Web Developer at ABC Inc</p>
                            <p className="text-sm text-muted-foreground">
                              2017 - 2020
                            </p>
                          </div>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-medium">Education</h3>
                        <div className="mt-2">
                          <p className="font-medium">B.S. Computer Science</p>
                          <p className="text-sm text-muted-foreground">
                            University of California, 2013 - 2017
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-medium">Date of Birth</h3>
                        <div className="mt-2">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="applications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Applications</CardTitle>
                    <CardDescription>
                      Track your job applications and their status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Sample job applications */}
                      <div className="rounded-lg border p-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">Senior Frontend Developer</h3>
                            <p className="text-sm text-muted-foreground">Google</p>
                          </div>
                          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                            In Review
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Applied on: May 15, 2023
                        </p>
                      </div>
                      
                      <div className="rounded-lg border p-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">Full Stack Engineer</h3>
                            <p className="text-sm text-muted-foreground">Microsoft</p>
                          </div>
                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            Interview Stage
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Applied on: April 28, 2023
                        </p>
                      </div>
                      
                      <div className="rounded-lg border p-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">React Developer</h3>
                            <p className="text-sm text-muted-foreground">Facebook</p>
                          </div>
                          <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                            Rejected
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Applied on: March 10, 2023
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="preferences" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Preferences</CardTitle>
                    <CardDescription>
                      Set your job search preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">Job Types</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            Full-time
                          </div>
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            Remote
                          </div>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-medium">Desired Roles</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                            Frontend Developer
                          </div>
                          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                            Full Stack Engineer
                          </div>
                          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                            UI/UX Developer
                          </div>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-medium">Locations</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            San Francisco, CA
                          </div>
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            New York, NY
                          </div>
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            Remote
                          </div>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-medium">Salary Range</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          $100,000 - $150,000 per year
                        </p>
                      </div>
                      <Separator />
                      <div className="flex justify-end">
                        <Button>Edit Preferences</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings">
                <ProfileSettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

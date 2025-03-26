
import React, { useState } from 'react';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import JobPreferences from '@/components/JobPreferences';

export default function Profile() {
  const [selectedTab, setSelectedTab] = useState("personal");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [dob, setDob] = useState<Date | undefined>(undefined);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      
      <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full md:w-[400px] grid-cols-3">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="preferences">Job Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and how we can reach you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" placeholder="Doe" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="john.doe@example.com" type="email" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="(123) 456-7890" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dob && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dob ? format(dob, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dob}
                      onSelect={setDob}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="San Francisco, CA" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="Tell us a bit about yourself" />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="notifications" />
                <Label htmlFor="notifications">Receive email notifications for new jobs</Label>
              </div>
              
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resume" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resume Information</CardTitle>
              <CardDescription>
                Update your professional details for job applications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Professional Title</Label>
                <Input id="title" placeholder="Senior Software Engineer" />
              </div>
              
              <div className="space-y-2">
                <Label>Experience</Label>
                <div className="border rounded-md p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" placeholder="Acme Inc." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" placeholder="Software Engineer" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-range">Date Range</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Describe your responsibilities and achievements" />
                  </div>
                  <Button variant="outline" size="sm">Add Another Experience</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Education</Label>
                <div className="border rounded-md p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution</Label>
                    <Input id="institution" placeholder="University of California" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="degree">Degree</Label>
                    <Input id="degree" placeholder="Bachelor of Science in Computer Science" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="graduation-date">Graduation Date</Label>
                    <Select>
                      <SelectTrigger id="graduation-date">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                        <SelectItem value="2021">2021</SelectItem>
                        <SelectItem value="2020">2020</SelectItem>
                        <SelectItem value="2019">2019</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" size="sm">Add Another Education</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="border rounded-md p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills</Label>
                    <Input id="skills" placeholder="JavaScript, React, Node.js" />
                    <p className="text-sm text-muted-foreground">Separate skills with commas</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="resume">Upload Resume</Label>
                <Input id="resume" type="file" />
                <p className="text-sm text-muted-foreground">PDF, Word, or plain text format</p>
              </div>
              
              <Button>Save Resume</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6">
          <JobPreferences />
        </TabsContent>
      </Tabs>
    </div>
  );
}

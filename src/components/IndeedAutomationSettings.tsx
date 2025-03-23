
import { useState } from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Control, UseFormReturn } from 'react-hook-form';
import { IndeedSettings } from '@/utils/automationUtils';

interface IndeedSettingsFormProps {
  form: UseFormReturn<any>;
  control: Control<any>;
}

export default function IndeedAutomationSettings({ form, control }: IndeedSettingsFormProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Indeed-Specific Settings</h3>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="application-settings">
          <AccordionTrigger>Application Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <FormField
                control={control}
                name="indeed.applicationSettings.loadDelay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Load Delay (seconds)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0.5" 
                        step="0.5" 
                        placeholder="1.5" 
                        {...field} 
                        value={field.value || 1.5}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Waiting time for page loading in seconds
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="indeed.applicationSettings.hasDBS"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Has DBS Certificate</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="indeed.applicationSettings.hasValidCertificate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Has Valid Certificate</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="personal-info">
          <AccordionTrigger>Personal Information</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal/Zip Code</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="githubUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/username" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/in/username" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="university"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>University/College</FormLabel>
                      <FormControl>
                        <Input placeholder="University name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="educationLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select education level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Other">Other</SelectItem>
                          <SelectItem value="Highschool">High School</SelectItem>
                          <SelectItem value="Associate">Associate</SelectItem>
                          <SelectItem value="Bachelor">Bachelor</SelectItem>
                          <SelectItem value="Master">Master</SelectItem>
                          <SelectItem value="Doctorate">Doctorate</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "Decline"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Decline">Decline to state</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="salaryExpectation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary Expectation</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 80k" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name="veteranStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Veteran Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "Decline"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                          <SelectItem value="Decline">Decline to state</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="disabilityStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disability Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "Decline"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                          <SelectItem value="Decline">Decline to state</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="preferredShift"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Shift</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "Day shift"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select shift" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Day shift">Day shift</SelectItem>
                          <SelectItem value="Night shift">Night shift</SelectItem>
                          <SelectItem value="Overnight shift">Overnight shift</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="hasCriminalRecord"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Has Criminal Record</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="canCommute"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Can Commute</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="needsSponsorship"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Needs Sponsorship</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="willingToRelocate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Willing to Relocate</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="workAuthorized"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Authorized to Work</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="isCitizen"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Is Citizen</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={control}
                name="availableForInterview"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available for Interview</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Immediately, except Tuesdays" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="experience">
          <AccordionTrigger>Experience Years</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <FormField
                control={control}
                name="indeed.experienceYears.default"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Experience Years</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="1" 
                        placeholder="0" 
                        {...field} 
                        value={field.value || 0}
                        onChange={e => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Default number of years to use for unspecified technologies
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name="indeed.experienceYears.python"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Python</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="1" 
                          placeholder="0" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="indeed.experienceYears.javascript"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>JavaScript</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="1" 
                          placeholder="0" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="indeed.experienceYears.java"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Java</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="1" 
                          placeholder="0" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name="indeed.experienceYears.react"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>React</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="1" 
                          placeholder="0" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="indeed.experienceYears.node"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Node.js</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="1" 
                          placeholder="0" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="indeed.experienceYears.angular"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Angular</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="1" 
                          placeholder="0" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name="indeed.experienceYears.aws"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AWS</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="1" 
                          placeholder="0" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="indeed.experienceYears.django"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Django</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="1" 
                          placeholder="0" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="indeed.experienceYears.php"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PHP</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="1" 
                          placeholder="0" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name="indeed.experienceYears.analysis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Analysis</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="1" 
                          placeholder="0" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="indeed.experienceYears.orm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ORM</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="1" 
                          placeholder="0" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="indeed.experienceYears.sdet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SDET</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="1" 
                          placeholder="0" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name="indeed.experienceYears.selenium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selenium</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="1" 
                          placeholder="0" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="indeed.experienceYears.testautomation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Automation</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="1" 
                          placeholder="0" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="indeed.experienceYears.webdev"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Web Development</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="1" 
                          placeholder="0" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="indeed.experienceYears.programming"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Programming</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="1" 
                          placeholder="0" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="indeed.experienceYears.teaching"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teaching</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="1" 
                          placeholder="0" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

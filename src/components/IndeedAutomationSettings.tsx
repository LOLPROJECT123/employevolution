
import React from 'react';
import { Control } from 'react-hook-form';
import { 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { IndeedSettings } from '@/utils/automationUtils';

interface IndeedAutomationSettingsProps {
  form: any; // Form context from parent
  control: Control<any>; // Control from react-hook-form
}

const IndeedAutomationSettings = ({ form, control }: IndeedAutomationSettingsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Indeed-Specific Settings</h3>
        <p className="text-sm text-gray-500 mb-4">
          Configure how the automation works specifically with Indeed job applications
        </p>
        
        <div className="space-y-4">
          <h4 className="text-md font-medium">Years of Experience</h4>
          <p className="text-sm text-gray-500">
            Define your experience levels for different skills that Indeed might ask about
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            <FormField
              control={control}
              name="indeed.experienceYears.java"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Java</FormLabel>
                  <FormControl>
                    <Input placeholder="Years" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="indeed.experienceYears.python"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Python</FormLabel>
                  <FormControl>
                    <Input placeholder="Years" {...field} />
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
                    <Input placeholder="Years" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="indeed.experienceYears.react"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>React</FormLabel>
                  <FormControl>
                    <Input placeholder="Years" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="indeed.experienceYears.aws"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AWS</FormLabel>
                  <FormControl>
                    <Input placeholder="Years" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="indeed.experienceYears.default"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default (Other Skills)</FormLabel>
                  <FormControl>
                    <Input placeholder="Years" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Used when a specific skill is not defined
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
          
          <Separator className="my-4" />
          
          <h4 className="text-md font-medium">Application Settings</h4>
          
          <div className="space-y-4">
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
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Delay between actions to prevent being detected as a bot
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="indeed.applicationSettings.hasDBS"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 p-3 border rounded-lg">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div>
                      <FormLabel>Has DBS Check</FormLabel>
                      <FormDescription className="text-xs">
                        For UK jobs requiring background checks
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="indeed.applicationSettings.hasValidCertificate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 p-3 border rounded-lg">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div>
                      <FormLabel>Has Valid Certificate</FormLabel>
                      <FormDescription className="text-xs">
                        For jobs requiring certification
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndeedAutomationSettings;

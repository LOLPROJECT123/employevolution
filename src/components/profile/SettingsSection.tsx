
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface EmailPreferences {
  jobAlerts: boolean;
  newsletters: boolean;
  accountUpdates: boolean;
}

interface SettingsSectionProps {
  email: string;
  emailPreferences: EmailPreferences;
  onUpdateEmail: (newEmail: string, password: string) => Promise<void>;
  onUpdatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  onUpdateEmailPreferences: (preferences: EmailPreferences) => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  email,
  emailPreferences,
  onUpdateEmail,
  onUpdatePassword,
  onUpdateEmailPreferences,
}) => {
  // Email states
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Email preferences
  const [preferences, setPreferences] = useState(emailPreferences);

  const handleEmailUpdate = async () => {
    setIsUpdatingEmail(true);
    try {
      await onUpdateEmail(newEmail, emailPassword);
      setNewEmail("");
      setEmailPassword("");
    } catch (error) {
      console.error("Failed to update email:", error);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      // Show error
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await onUpdatePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Failed to update password:", error);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handlePreferenceChange = (key: keyof EmailPreferences) => {
    const updatedPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(updatedPreferences);
    onUpdateEmailPreferences(updatedPreferences);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Email Preferences</h2>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Manage the emails you want to receive
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Job Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Get notified about new jobs matching your preferences
                </p>
              </div>
              <Switch 
                checked={preferences.jobAlerts} 
                onCheckedChange={() => handlePreferenceChange("jobAlerts")} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Newsletters</p>
                <p className="text-sm text-muted-foreground">
                  Receive our weekly newsletter with career tips
                </p>
              </div>
              <Switch 
                checked={preferences.newsletters} 
                onCheckedChange={() => handlePreferenceChange("newsletters")} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Account Updates</p>
                <p className="text-sm text-muted-foreground">
                  Get important updates about your account
                </p>
              </div>
              <Switch 
                checked={preferences.accountUpdates} 
                onCheckedChange={() => handlePreferenceChange("accountUpdates")} 
              />
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Change Password</h2>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Update your password to keep your account secure
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input 
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
              />
            </div>

            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
              />
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input 
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
              />
            </div>

            <Button 
              onClick={handlePasswordUpdate} 
              disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="w-full"
            >
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Change Email</h2>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Update your email address
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="current-email">Current Email</Label>
              <Input 
                id="current-email"
                type="email"
                value={email}
                readOnly
                disabled
              />
            </div>

            <div>
              <Label htmlFor="new-email">New Email</Label>
              <Input 
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter your new email address"
              />
            </div>

            <div>
              <Label htmlFor="email-password">Password</Label>
              <Input 
                id="email-password"
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder="Enter your password to confirm"
              />
            </div>

            <Button 
              onClick={handleEmailUpdate} 
              disabled={isUpdatingEmail || !newEmail || !emailPassword}
              className="w-full"
              variant="secondary"
            >
              {isUpdatingEmail ? "Updating..." : "Update Email"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsSection;

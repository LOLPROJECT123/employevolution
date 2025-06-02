
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import MobileHeader from '@/components/MobileHeader';
import { useMobile } from '@/hooks/use-mobile';
import { User, MapPin, Phone, Mail, Briefcase, GraduationCap, Plus, X } from 'lucide-react';
import MultiLanguageSelector from '@/components/profile/MultiLanguageSelector';
import ProfileCompletionWidget from '@/components/profile/ProfileCompletionWidget';
import ResumeVersionManager from '@/components/resume/ResumeVersionManager';

interface Language {
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Conversational' | 'Basic';
}

interface UserProfile {
  id?: string;
  user_id: string;
  name?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  other_url?: string;
  job_status?: string;
  languages?: Language[];
  primary_language?: string;
}

const Profile = () => {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    user_id: user?.id || '',
    name: '',
    phone: '',
    location: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    other_url: '',
    job_status: 'Actively looking',
    languages: [],
    primary_language: 'English'
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Properly handle the languages field conversion from Json to Language[]
        const languagesData = data.languages as any;
        const languages: Language[] = Array.isArray(languagesData) 
          ? languagesData.map((lang: any) => ({
              language: lang.language || '',
              proficiency: lang.proficiency || 'Conversational'
            }))
          : [];

        setProfile({
          ...data,
          languages,
          primary_language: data.primary_language || 'English'
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error loading profile",
        description: "Failed to load your profile information.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const profileData = {
        user_id: user.id,
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
        linkedin_url: profile.linkedin_url,
        github_url: profile.github_url,
        portfolio_url: profile.portfolio_url,
        other_url: profile.other_url,
        job_status: profile.job_status,
        languages: profile.languages || [] as any, // Cast to any to satisfy Json type
        primary_language: profile.primary_language || 'English'
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(profileData);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLanguagesChange = (languages: Language[]) => {
    setProfile(prev => ({ ...prev, languages }));
  };

  const handlePrimaryLanguageChange = (primaryLanguage: string) => {
    setProfile(prev => ({ ...prev, primary_language: primaryLanguage }));
  };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader title="Profile" />}
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Completion Widget */}
          <div className="lg:col-span-1">
            <ProfileCompletionWidget />
          </div>
          
          {/* Main Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile.phone || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, State/Country"
                    />
                  </div>

                  <div>
                    <Label htmlFor="job_status">Job Search Status</Label>
                    <select
                      id="job_status"
                      className="w-full p-2 border rounded-md"
                      value={profile.job_status || 'Actively looking'}
                      onChange={(e) => setProfile(prev => ({ ...prev, job_status: e.target.value }))}
                    >
                      <option value="Actively looking">Actively looking</option>
                      <option value="Open to opportunities">Open to opportunities</option>
                      <option value="Not looking">Not looking</option>
                      <option value="Employed">Currently employed</option>
                    </select>
                  </div>

                  {/* Social Links */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Social Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                        <Input
                          id="linkedin_url"
                          value={profile.linkedin_url || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, linkedin_url: e.target.value }))}
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                      <div>
                        <Label htmlFor="github_url">GitHub URL</Label>
                        <Input
                          id="github_url"
                          value={profile.github_url || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, github_url: e.target.value }))}
                          placeholder="https://github.com/yourusername"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="portfolio_url">Portfolio URL</Label>
                        <Input
                          id="portfolio_url"
                          value={profile.portfolio_url || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, portfolio_url: e.target.value }))}
                          placeholder="https://yourportfolio.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="other_url">Other URL</Label>
                        <Input
                          id="other_url"
                          value={profile.other_url || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, other_url: e.target.value }))}
                          placeholder="Any other relevant URL"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Language Selector */}
        <div className="mt-6">
          <MultiLanguageSelector
            languages={profile.languages || []}
            onLanguagesChange={handleLanguagesChange}
            primaryLanguage={profile.primary_language}
            onPrimaryLanguageChange={handlePrimaryLanguageChange}
          />
        </div>

        {/* Resume Version Manager */}
        <div className="mt-6">
          <ResumeVersionManager />
        </div>
      </div>
    </div>
  );
};

export default Profile;

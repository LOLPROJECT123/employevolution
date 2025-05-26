
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { auditService } from '@/services/auditService';
import { securityService } from '@/services/securityService';
import { gdprService } from '@/services/gdprService';

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<void>;
  // Add aliases for backward compatibility
  login: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  register: (email: string, password: string, userData?: any) => Promise<{ user: User | null; error: any }>;
  logout: () => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadUserProfile(session.user.id);
        
        // Log successful login
        if (event === 'SIGNED_IN') {
          await auditService.logLogin();
          securityService.clearFailedLoginAttempts(session.user.email || '');
        }
      } else {
        setUserProfile(null);
        
        // Log logout
        if (event === 'SIGNED_OUT') {
          await auditService.logLogout();
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error);
        return;
      }

      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Check for previous failed attempts
      const shouldBlock = await securityService.recordFailedLogin(email);
      if (shouldBlock) {
        return {
          user: null,
          error: { message: 'Account temporarily locked due to multiple failed attempts' }
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Record failed login attempt
        await securityService.recordFailedLogin(email);
        return { user: null, error };
      }

      // Clear failed login attempts on successful login
      securityService.clearFailedLoginAttempts(email);

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error };
    }
  };

  const signUp = async (email: string, password: string, userData: any = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        return { user: null, error };
      }

      // Record required consents for new users
      if (data.user) {
        await gdprService.recordConsent('terms', true);
        await gdprService.recordConsent('privacy', true);
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Log profile update
      await auditService.logUpdate('profiles', user.id, userProfile, updates);

      // Reload profile
      await loadUserProfile(user.id);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      // Try to sign in with a dummy password to check if email exists
      // This is a simple approach - in production you might want a dedicated endpoint
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy-password-that-will-fail'
      });

      // If we get an "Invalid login credentials" error, it means the email exists
      // If we get "User not found" or similar, the email doesn't exist
      if (error?.message?.includes('Invalid login credentials')) {
        return true;
      }
      
      // For any other error or no error, assume email doesn't exist
      // This ensures new users can always sign up
      return false;
    } catch (error) {
      console.error('Error checking email existence:', error);
      // If there's an error, default to allowing signup
      return false;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    // Aliases for backward compatibility
    login: signIn,
    register: signUp,
    logout: signOut,
    updateProfile,
    checkEmailExists,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

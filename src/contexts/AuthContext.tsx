import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isLoggingOut: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName?: string) => Promise<any>;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, data?: { full_name?: string }) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [authListenerReady, setAuthListenerReady] = useState(false);
  const [initialSessionChecked, setInitialSessionChecked] = useState(false);

  const ensureUserProfile = async (userId: string, userEmail: string, fullName?: string) => {
    try {
      console.log('🔄 Ensuring user profile exists for:', userId);
      
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingProfile) {
        console.log('📝 Creating new user profile...');
        
        const { data: newProfile, error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            name: fullName || userEmail?.split('@')[0] || '',
            job_status: 'Actively looking'
          })
          .select()
          .single();

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        } else {
          console.log('✅ User profile created successfully:', newProfile);
        }

        // Create profiles table entry for backwards compatibility
        const { error: legacyProfileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: userEmail,
            full_name: fullName || userEmail?.split('@')[0] || ''
          });

        if (legacyProfileError) {
          console.error('Error creating legacy profile:', legacyProfileError);
        }

        // Initialize onboarding status
        const { error: onboardingError } = await supabase
          .from('user_onboarding')
          .upsert({
            user_id: userId,
            resume_uploaded: false,
            profile_completed: false,
            onboarding_completed: false
          });

        if (onboardingError) {
          console.error('Error creating onboarding status:', onboardingError);
        }

        // Initialize profile completion tracking
        const { error: completionError } = await supabase
          .from('profile_completion_tracking')
          .upsert({
            user_id: userId,
            completion_percentage: 0,
            missing_fields: ['basic_info', 'work_experience', 'education', 'skills']
          });

        if (completionError) {
          console.error('Error creating completion tracking:', completionError);
        }

        // Create notification preferences
        const { error: notificationError } = await supabase
          .from('notification_preferences')
          .upsert({
            user_id: userId,
            email_notifications: true,
            push_notifications: true,
            job_match_alerts: true,
            application_updates: true,
            interview_reminders: true,
            profile_completion_reminders: true
          });

        if (notificationError) {
          console.error('Error creating notification preferences:', notificationError);
        }

        // Create initial job preferences
        const { error: jobPrefError } = await supabase
          .from('job_preferences')
          .upsert({
            user_id: userId,
            work_model: 'remote',
            experience_level: 'entry'
          });

        if (jobPrefError) {
          console.error('Error creating job preferences:', jobPrefError);
        }

      } else {
        console.log('✅ User profile already exists:', existingProfile);
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
    }
  };

  useEffect(() => {
    console.log('🔐 AuthContext: Setting up auth listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, session?.user?.id);
        
        // If we're logging out, don't process the session change
        if (isLoggingOut && event === 'SIGNED_OUT') {
          console.log('🔐 Logout completed, clearing state...');
          setSession(null);
          setUser(null);
          setUserProfile(null);
          setIsLoggingOut(false);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && !isLoggingOut) {
          setTimeout(async () => {
            try {
              await ensureUserProfile(
                session.user.id, 
                session.user.email || '', 
                session.user.user_metadata?.full_name
              );
              
              const { data: profile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle();
              
              console.log('👤 User profile loaded:', profile);
              setUserProfile(profile);
            } catch (error) {
              console.error('Error loading user profile:', error);
            }
          }, 0);
        } else if (!session?.user) {
          setUserProfile(null);
        }
        
        if (!authListenerReady) {
          setAuthListenerReady(true);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setInitialSessionChecked(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isLoggingOut]);

  useEffect(() => {
    if (authListenerReady && initialSessionChecked) {
      console.log('🔐 Auth initialization complete, setting loading to false');
      setLoading(false);
    }
  }, [authListenerReady, initialSessionChecked]);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }
    
    console.log('🔐 Sign in successful');
    return data;
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log('🔐 Attempting sign up for:', email, 'with name:', fullName);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (error) {
      console.error('Sign up error:', error);
      throw error;
    }
    
    console.log('🔐 Sign up successful');
    return data;
  };

  const signOut = async () => {
    try {
      console.log('🔐 Starting logout process...');
      setIsLoggingOut(true);
      
      // Clear state immediately
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      console.log('🔐 Sign out successful, redirecting...');
      
      // Use a small delay to ensure state is cleared, then redirect
      setTimeout(() => {
        window.location.href = '/auth';
      }, 100);
      
    } catch (error) {
      console.error('Error during sign out:', error);
      // Even if there's an error, clear local state and redirect
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setIsLoggingOut(false);
      window.location.href = '/auth';
    }
  };

  const login = signIn;
  const register = async (email: string, password: string, data?: { full_name?: string }) => {
    return signUp(email, password, data?.full_name);
  };
  const logout = signOut;

  const value = {
    user,
    session,
    userProfile,
    loading,
    isLoggingOut,
    signIn,
    signUp,
    signOut,
    login,
    register,
    logout,
  };

  console.log('🔐 AuthContext render - loading:', loading, 'user:', user?.id, 'session:', session?.user?.id, 'isLoggingOut:', isLoggingOut);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

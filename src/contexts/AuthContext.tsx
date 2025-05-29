
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
  // Add other profile fields as needed
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
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

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile loading to avoid blocking auth state
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
              
              setUserProfile(profile);
            } catch (error) {
              console.error('Error loading user profile:', error);
            }
          }, 0);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }
    
    return data;
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
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
    
    return data;
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      
      // Clear local state first
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      console.log('Sign out successful');
      
      // Force redirect to auth page
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error during sign out:', error);
      // Even if there's an error, clear the state and redirect
      setUser(null);
      setSession(null);
      setUserProfile(null);
      window.location.href = '/auth';
    }
  };

  // Add aliases for backward compatibility
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
    signIn,
    signUp,
    signOut,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

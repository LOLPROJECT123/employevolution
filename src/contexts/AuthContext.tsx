
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate login process
    const mockUser: User = {
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0],
      profile: {
        skills: ['JavaScript', 'React', 'TypeScript'],
        experience: 'mid',
        location: 'San Francisco, CA',
        salary_range: { min: 80000, max: 120000 },
        preferences: {
          remote: true,
          job_types: ['full-time'],
          industries: ['technology']
        }
      },
      created_at: new Date().toISOString()
    };

    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const register = async (email: string, password: string, name: string) => {
    const mockUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      profile: {
        skills: [],
        experience: 'entry',
        location: '',
        salary_range: { min: 50000, max: 80000 },
        preferences: {
          remote: false,
          job_types: ['full-time'],
          industries: []
        }
      },
      created_at: new Date().toISOString()
    };

    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

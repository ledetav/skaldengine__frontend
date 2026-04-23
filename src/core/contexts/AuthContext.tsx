import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '@/core/api/auth';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { logger } from '@/core/utils/logger';

interface User {
  full_name?: string;
  login?: string;
  username?: string;
  avatar_url?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  setUser: (user: any | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));

  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      if (!token) {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        if (isMounted) {
          setIsLoading(false);
          setUser(null);
        }
        return;
      }

      try {
        const data = await authApi.getMe();
        if (isMounted) {
          setUser(data);
        }
      } catch (err: unknown) {
        logger.error('Failed to fetch user:', err);
        if (isMounted) {
          // Fallback if token is invalid or request fails
          setUser(null);
          // We could potentially remove the token here, but let's be careful
          // in case it's just a network error.
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    setIsLoading(true);
    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const logout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-change'));
    // Do not navigate here, allow components using the context to handle navigation
  };

  if (isLoading) {
    return <LoadingScreen fullScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, logout, setUser }}>
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

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '@/core/api/auth';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { logger } from '@/core/utils/logger';
import { useToast } from '@/components/ui/useToast';

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
  const { error: showError } = useToast();
  // Ref to avoid showing the toast multiple times during a single expiry event
  const sessionExpiredShown = useRef(false);

  // ── Handle token changes (storage sync across tabs + same-tab logout) ──
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

  // ── Handle session expiry (401 from any API call) ──────────────────────
  useEffect(() => {
    const handleSessionExpired = () => {
      if (!sessionExpiredShown.current) {
        sessionExpiredShown.current = true;
        showError('Сессия истекла. Пожалуйста, войдите снова.');
      }
      setIsAuthenticated(false);
      setUser(null);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [showError]);

  // Reset dedup flag when user logs in again
  useEffect(() => {
    if (isAuthenticated) {
      sessionExpiredShown.current = false;
    }
  }, [isAuthenticated]);

  // ── Fetch user profile when authenticated ─────────────────────────────
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
          setUser(null);
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

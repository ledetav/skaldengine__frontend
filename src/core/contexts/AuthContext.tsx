/**
 * @fileoverview Провайдер и контекст глобальной аутентификации пользователя.
 * Управляет состоянием входа, хранением токена доступа, получением данных учетной записи,
 * межвкладочной синхронизацией сессии и реакцией на истечение авторизации (401).
 */

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '@/core/api/auth';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { logger } from '@/core/utils/logger';
import { useToast } from '@/components/ui/useToast';

/**
 * Модель пользователя, полученная из сервиса авторизации.
 */
interface User {
  full_name?: string;
  login?: string;
  username?: string;
  avatar_url?: string;
  role: string;
}

/**
 * Интерфейс контекста аутентификации.
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  setUser: (user: any | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Провайдер контекста аутентификации.
 * Управляет состоянием авторизации, токеном сессии в localStorage,
 * автоматической синхронизацией между вкладками и обработкой истечения сессии.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const { error: showError } = useToast();
  // Ссылка для предотвращения повторного вызова уведомления при одном событии истечения сессии
  const sessionExpiredShown = useRef(false);

  // ── Синхронизация изменения токена (между вкладками браузера и при выходе) ──
  useEffect(() => {
    /**
     * Обработчик событий смены токена в локальном хранилище.
     * Синхронизирует статус аутентификации между вкладками и очищает состояние при выходе.
     */
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

  // ── Обработка истечения срока действия сессии (401 от любого запроса к API) ──
  useEffect(() => {
    /**
     * Обрабатывает глобальное системное событие истечения срока сессии (401 Unauthorized).
     * Дедуплицирует вывод тоста об ошибке и сбрасывает состояние пользователя.
     */
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

  // Сброс флага дедупликации уведомлений при повторном входе
  useEffect(() => {
    if (isAuthenticated) {
      sessionExpiredShown.current = false;
    }
  }, [isAuthenticated]);

  // ── Загрузка профиля пользователя при наличии авторизации ──
  useEffect(() => {
    let isMounted = true;

    /**
     * Загружает данные авторизованного профиля пользователя с бэкенда.
     * Если токен отсутствует, мгновенно сбрасывает индикатор загрузки.
     */
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
        logger.error('Не удалось загрузить данные пользователя:', err);
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

  /**
   * Завершение пользовательской сессии: удаление токена и оповещение системы.
   */
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

/**
 * Хук для доступа к контексту аутентификации.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

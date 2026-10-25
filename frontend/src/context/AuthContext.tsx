import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { loginApi, registerApi, getMeApi, getMyTripsApi, googleAuthApi, GoogleAuthPayload } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  loginWithGoogle: (payload: GoogleAuthPayload) => Promise<void>;
  quickLoginDemo: (role: 'admin' | 'traveler') => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isMyTripsOpen: boolean;
  setIsMyTripsOpen: (open: boolean) => void;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  savedTripsCount: number;
  refreshMyTripsCount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'hanoi_webgis_auth_token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isMyTripsOpen, setIsMyTripsOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [savedTripsCount, setSavedTripsCount] = useState<number>(0);

  // Khôi phục phiên đăng nhập khi load trang
  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await getMeApi(token);
        setUser(profile);
        // Tải số lượng chuyến đi
        try {
          const trips = await getMyTripsApi(token);
          setSavedTripsCount(trips.length);
        } catch {
          // Bỏ qua lỗi phụ nếu mạng lag
        }
      } catch (err) {
        console.warn('Phiên đăng nhập đã hết hạn:', err);
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [token]);

  const refreshMyTripsCount = async () => {
    if (!token) {
      setSavedTripsCount(0);
      return;
    }
    try {
      const trips = await getMyTripsApi(token);
      setSavedTripsCount(trips.length);
    } catch {
      // Ignored
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await loginApi(email, password);
      localStorage.setItem(TOKEN_KEY, data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      setIsAuthModalOpen(false);
      // Nạp số lượng chuyến đi
      try {
        const trips = await getMyTripsApi(data.access_token);
        setSavedTripsCount(trips.length);
      } catch {
        // Ignored
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const data = await registerApi(email, password, fullName);
      localStorage.setItem(TOKEN_KEY, data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      setIsAuthModalOpen(false);
      setSavedTripsCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (payload: GoogleAuthPayload) => {
    setIsLoading(true);
    try {
      const data = await googleAuthApi(payload);
      localStorage.setItem(TOKEN_KEY, data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      setIsAuthModalOpen(false);
      try {
        const trips = await getMyTripsApi(data.access_token);
        setSavedTripsCount(trips.length);
      } catch {
        // Ignored
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setSavedTripsCount(0);
    setIsMyTripsOpen(false);
    setIsAdminModalOpen(false);
  };

  const quickLoginDemo = async (role: 'admin' | 'traveler') => {
    if (role === 'admin') {
      await login('admin@hanoitravel.vn', 'admin123');
    } else {
      await login('tourist@hanoitravel.vn', 'tourist123');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
    login,
    register,
    loginWithGoogle,
    logout,
    quickLoginDemo,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isMyTripsOpen,
    setIsMyTripsOpen,
    isAdminModalOpen,
    setIsAdminModalOpen,
    savedTripsCount,
    refreshMyTripsCount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

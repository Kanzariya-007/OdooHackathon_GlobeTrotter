import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/trip';
import { getMe, login as apiLogin, register as apiSignup, logout as apiLogout } from '../services/tripApi';

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('globetrotter_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const activeUser = await getMe();
      setCurrentUser(activeUser);
      setToken(localStorage.getItem('globetrotter_token'));
    } catch (error) {
      console.error('[AuthContext] Session verification failed:', error);
      setCurrentUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const user = await apiLogin(email, password);
      setCurrentUser(user);
      setToken(user.token || localStorage.getItem('globetrotter_token'));
      return user;
    } catch (error) {
      setCurrentUser(null);
      setToken(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const user = await apiSignup(name, email, password);
      setCurrentUser(user);
      setToken(user.token || localStorage.getItem('globetrotter_token'));
      return user;
    } catch (error) {
      setCurrentUser(null);
      setToken(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setCurrentUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, token, loading, login, signup, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

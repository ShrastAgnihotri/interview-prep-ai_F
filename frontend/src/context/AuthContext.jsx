import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getMe = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    // Store token in localStorage for cross-domain support
    if (data.data?.token) {
      localStorage.setItem('token', data.data.token);
    }
    setUser(data.data);
    setIsAuthenticated(true);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    // Store token in localStorage for cross-domain support
    if (data.data?.token) {
      localStorage.setItem('token', data.data.token);
    }
    setUser(data.data);
    setIsAuthenticated(true);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Check auth on mount
  useEffect(() => { getMe(); }, [getMe]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

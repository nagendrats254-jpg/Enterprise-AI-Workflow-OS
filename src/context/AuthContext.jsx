import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';
import { DEMO_USERS } from '../data/demoData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    // Attempt real backend call, fallback to stored user if demo mode
    authApi.me()
      .then(data => {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      })
      .catch((err) => {
        // If we have a stored user and no real backend, just keep them logged in for UI preview
        if (localStorage.getItem('demo_mode') === 'true') {
          console.log('Using demo session');
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      // Try real backend first
      const data = await authApi.login({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('demo_mode', 'false');
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.log('Backend login failed, falling back to demo check');
      
      // DEMO FALLBACK
      const demoUser = DEMO_USERS.find(u => 
        (email === 'admin@enterprise.ai' && u.role === 'admin') ||
        (email === 'manager@enterprise.ai' && u.role === 'manager') ||
        (email === 'employee@enterprise.ai' && u.role === 'employee')
      );
      
      if (demoUser) {
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('demo_mode', 'true');
        setUser(demoUser);
        return demoUser;
      }
      
      const msg = err.message || 'Login failed. Try admin@enterprise.ai / admin123 for demo.';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch (_) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('demo_mode');
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;

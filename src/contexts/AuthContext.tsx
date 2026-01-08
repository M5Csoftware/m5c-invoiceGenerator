import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (user: User) => void;
  logout: () => void;
  setSessionRunNumber: (runNumber: string) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    // Try to restore from localStorage on load
    const savedUser = localStorage.getItem('auth_user');
    const savedRunNumber = localStorage.getItem('auth_run_number');
    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      runNumber: savedRunNumber || null,
      isAuthenticated: !!savedUser,
    };
  });

  const login = (user: User) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
    setState(prev => ({ ...prev, user, isAuthenticated: true }));
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_run_number');
    setState({ user: null, runNumber: null, isAuthenticated: false });
  };

  const setSessionRunNumber = (runNumber: string) => {
    localStorage.setItem('auth_run_number', runNumber);
    setState(prev => ({ ...prev, runNumber }));
  };

  const clearSession = () => {
    localStorage.removeItem('auth_run_number');
    setState(prev => ({ ...prev, runNumber: null }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setSessionRunNumber, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

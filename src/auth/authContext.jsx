// src/auth/authContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../pages/login/js/firebase';

const AuthContext = createContext(); // ✅ defined statically

// ✅ Custom hook defined at top-level (static)
export const useAuth = () => useContext(AuthContext);

// ✅ Component function defined at top-level
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (tokenValue, userData) => {
    setToken(tokenValue);
    setUser(userData);
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

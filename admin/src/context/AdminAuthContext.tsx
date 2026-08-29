import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin } from '../services/adminApi';

interface AdminUser {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('bapat_admin_token'));
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('bapat_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await loginAdmin(email, pass);
      if (data.role !== 'ADMIN' && data.role !== 'OPTOMETRIST') {
        throw new Error('Access denied. Administrator or Optometrist role required.');
      }
      setToken(data.access_token);
      const userData: AdminUser = {
        user_id: data.user_id,
        email: data.email,
        full_name: data.full_name,
        role: data.role
      };
      setUser(userData);
      localStorage.setItem('bapat_admin_token', data.access_token);
      localStorage.setItem('bapat_admin_user', JSON.stringify(userData));
      showToast(`Welcome, ${userData.full_name}`);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Login failed';
      showToast(`Error: ${msg}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('bapat_admin_token');
    localStorage.removeItem('bapat_admin_user');
    showToast('Logged out of Bapat Optics CRM');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        toastMessage,
        showToast
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999] flex items-center gap-3 bg-[#1A1A1A] text-white border border-[#C6A15B]/50 px-5 py-3.5 rounded-lg shadow-2xl backdrop-blur-md animate-bounce">
          <span className="h-2 w-2 rounded-full bg-[#C6A15B]" />
          <p className="text-xs font-medium tracking-wide">{toastMessage}</p>
        </div>
      )}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
};

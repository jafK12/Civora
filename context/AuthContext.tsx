'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/lib/types';
import { DEMO_USERS } from '@/lib/data/demoUsers';

interface AuthContextType {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  isAdmin: boolean;
  currentOfficeId?: string;
  demoUsers: UserProfile[];
  switchUser: (userId: string) => void;
  signInWithPhone: (phone: string, country?: string | null) => Promise<UserProfile>;
  signInWithGoogle: (
    payload: { email: string; name: string; locale?: string },
    country?: string | null
  ) => Promise<UserProfile>;
  updateUserCountry: (country: string) => Promise<void>;
  resetDatabase: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [demoUsers, setDemoUsers] = useState<UserProfile[]>(DEMO_USERS);
  const [user, setUser] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUserData = localStorage.getItem('civora_active_user_data');
        if (savedUserData) {
          const parsed = JSON.parse(savedUserData);
          if (parsed && parsed.id) return parsed;
        }

        const savedUserId = localStorage.getItem('civora_active_user_id');
        if (savedUserId) {
          const found = DEMO_USERS.find((u) => u.id === savedUserId);
          if (found) return found;
        }
      } catch {
        // Ignore
      }
    }
    return DEMO_USERS[0]; // Default: citizen
  });

  useEffect(() => {
    // Fetch live demo users from backend if available
    let mounted = true;
    fetch('/api/auth/demo-users')
      .then((res) => res.json())
      .then((json) => {
        if (mounted && json.success && json.data) {
          setDemoUsers(json.data);
        }
      })
      .catch(() => {
        // Fallback to local DEMO_USERS
      });
    return () => {
      mounted = false;
    };
  }, []);

  const switchUser = (userId: string) => {
    const selected = demoUsers.find((u) => u.id === userId);
    if (selected) {
      setUser(selected);
      try {
        localStorage.setItem('civora_active_user_id', selected.id);
        localStorage.setItem('civora_active_user_data', JSON.stringify(selected));
      } catch {
        // Ignore
      }
    }
  };

  const updateUserCountry = async (country: string) => {
    const updated = { ...user, country };
    setUser(updated);
    try {
      localStorage.setItem('civora_active_user_data', JSON.stringify(updated));
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, country }),
      });
    } catch {
      // Offline fallback
    }
  };

  const signInWithPhone = async (phone: string, country?: string | null): Promise<UserProfile> => {
    const cleanPhone = phone.replace(/[\s()-]/g, '');
    const phoneUserId = `usr-ph-${cleanPhone.replace('+', '')}`;
    const newUser: UserProfile = {
      id: phoneUserId,
      email: `${cleanPhone}@phone.civora.org`,
      fullName: `Citizen (${phone})`,
      role: 'citizen',
      country: country || null,
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    try {
      localStorage.setItem('civora_active_user_id', newUser.id);
      localStorage.setItem('civora_active_user_data', JSON.stringify(newUser));
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: newUser.id,
          fullName: newUser.fullName,
          country: country || null,
        }),
      });
    } catch {
      // Offline fallback
    }
    return newUser;
  };

  const signInWithGoogle = async (
    payload: { email: string; name: string; locale?: string },
    country?: string | null
  ): Promise<UserProfile> => {
    const cleanEmail = payload.email.trim().toLowerCase();
    const googleUserId = `usr-goog-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const newUser: UserProfile = {
      id: googleUserId,
      email: cleanEmail,
      fullName: payload.name || cleanEmail.split('@')[0],
      role: 'citizen',
      country: country || null,
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    try {
      localStorage.setItem('civora_active_user_id', newUser.id);
      localStorage.setItem('civora_active_user_data', JSON.stringify(newUser));
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: newUser.id,
          fullName: newUser.fullName,
          country: country || null,
        }),
      });
    } catch {
      // Offline fallback
    }
    return newUser;
  };

  const resetDatabase = async () => {
    try {
      await fetch('/api/seed', { method: 'POST' });
    } catch (err) {
      console.warn('Reset seed failed:', err);
    }
  };

  const isAdmin = user.role === 'office_admin';
  const currentOfficeId = user.officeId;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAdmin,
        currentOfficeId,
        demoUsers,
        switchUser,
        signInWithPhone,
        signInWithGoogle,
        updateUserCountry,
        resetDatabase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


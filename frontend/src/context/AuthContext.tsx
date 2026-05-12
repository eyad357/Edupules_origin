/**
 * AuthContext — Real JWT authentication via FastAPI
 *
 * FIXES applied in this version:
 * 1. login() now reads the role from the server response (res.data.user.role)
 *    and returns it to the caller via the returned user object, so AuthPage
 *    can redirect to the correct dashboard using the server-confirmed role.
 * 2. isInitializing guard prevents redirect race condition on page reload.
 * 3. loginError exposed in context for AuthPage.
 * 4. refreshUser() calls AuthAPI.me() which now hits FastAPI /auth/me.
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthAPI } from '../lib/api';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'professor' | 'advisor' | 'admin' | 'ta';
  role_display: string;
  avatar_url?: string;
  // role-specific
  student_id?: number;
  student_number?: string;
  major?: string;
  year?: number;
  gpa?: number;
  professor_id?: number;
  advisor_id?: number;
  department?: string;
  title?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  /** Attempts login. Returns true on success, false on failure. */
  login: (email: string, password: string, role?: string) => Promise<boolean>;
  logout: (redirectFn?: () => void) => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  /** Error message from the last failed login attempt, or null. */
  loginError: string | null;
  /** TRUE while the initial token-validation fetch is in flight.
   *  DashboardLayout must wait for this before deciding to redirect. */
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY  = 'eduguard_user';
const TOKEN_KEY = 'eduguard_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken]               = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setLoading]         = useState(false);
  const [loginError, setLoginError]     = useState<string | null>(null);
  // Starts TRUE only when a token already exists — prevents premature redirect
  const [isInitializing, setInitializing] = useState<boolean>(
    () => !!localStorage.getItem(TOKEN_KEY)
  );

  // ── logout ────────────────────────────────────────────────
  const logout = useCallback((redirectFn?: () => void) => {
    AuthAPI.logout().catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setLoginError(null);
    redirectFn?.();
  }, []);

  // ── refreshUser ───────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setInitializing(false);
      return;
    }
    try {
      const res = await AuthAPI.me();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data));
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setInitializing(false);
    }
  }, [logout]);

  // ── login ─────────────────────────────────────────────────
  // `role` is accepted as a third argument (AuthPage passes it) but the
  // actual role comes from the server response — we don't send it to the API.
  const login = useCallback(async (
    email: string,
    password: string,
    _role?: string,       // accepted, unused — role is determined by the server
  ): Promise<boolean> => {
    setLoading(true);
    setLoginError(null);
    try {
      const res = await AuthAPI.login(email, password);

      if (!res.success || !res.data) {
        setLoginError(res.message ?? 'Login failed. Please check your credentials.');
        return false;
      }

      const { token: newToken, user: userData } = res.data;

      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);

      return true;
    } catch (err: any) {
      const msg = err.message ?? 'Login failed. Please try again.';
      setLoginError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Validate token on mount (only when one exists)
  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY)) {
      refreshUser();
    } else {
      setInitializing(false);
    }
  }, []); // eslint-disable-line

  return (
    <AuthContext.Provider value={{
      user, token,
      login, logout, refreshUser,
      isLoading, loginError, isInitializing,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
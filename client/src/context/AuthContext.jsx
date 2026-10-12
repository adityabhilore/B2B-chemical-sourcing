import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAccessToken } from '../lib/api';

const AuthContext = createContext(null);
let refreshInFlight = null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const refreshSession = useCallback(async () => {
    if (refreshInFlight) return refreshInFlight;
    refreshInFlight = (async () => {
    try {
      const { data } = await api.post('/auth/refresh');
      setAccessToken(data.data.accessToken);
      setUser(data.data.user);
      return data.data.user;
    } catch {
      setAccessToken(null);
      setUser(null);
      return null;
    }
    })();
    try { return await refreshInFlight; } finally { refreshInFlight = null; }
  }, []);

  useEffect(() => { refreshSession().finally(() => setReady(true)); }, [refreshSession]);

  const login = useCallback(async (credentials, admin = false) => {
    const { data } = await api.post(admin ? '/auth/admin/login' : '/auth/login', credentials);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const register = useCallback(async (details) => {
    const { data } = await api.post('/auth/register', details);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } finally { setAccessToken(null); setUser(null); }
  }, []);

  const value = useMemo(() => ({ user, ready, login, register, logout, refreshSession }), [user, ready, login, register, logout, refreshSession]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}

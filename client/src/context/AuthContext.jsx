import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import axios from 'axios';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [adminMode, setAdminModeState] = useState(() => {
    return localStorage.getItem('adminMode') === 'true';
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('adminUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const setAdminMode = (val) => {
    setAdminModeState(val);
    if (val) {
      localStorage.setItem('adminMode', 'true');
    } else {
      localStorage.removeItem('adminMode');
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
      } else {
        if (!localStorage.getItem('adminUser')) {
          setUser(null);
          setSession(null);
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password, asAdmin = false) => {
    if (asAdmin) {
      setAdminMode(true);
    }
    try {
      const res = await axios.post('http://localhost:5000/api/client/login', { email, password });
      if (res.data.session) {
        setSession(res.data.session);
        setUser(res.data.user);
        localStorage.setItem('adminUser', JSON.stringify(res.data.user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.session.access_token}`;
      }
      return res.data;
    } catch (err) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(err.response?.data?.error || error.message);
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
      }
      return data;
    }
  };

  const loginAsSuperAdmin = async () => {
    const adminUser = {
      id: 'super-admin-id',
      email: 'admin@gmail.com',
      user_metadata: { role: 'admin' },
    };
    setAdminMode(true);
    setUser(adminUser);
    localStorage.setItem('adminUser', JSON.stringify(adminUser));
  };

  const register = async (email, password, companyName) => {
    try {
      const res = await axios.post('http://localhost:5000/api/client/register', {
        email,
        password,
        company_name: companyName,
      });

      if (res.data.session) {
        setSession(res.data.session);
        setUser(res.data.user);
        localStorage.setItem('adminUser', JSON.stringify(res.data.user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.session.access_token}`;
      } else if (res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('adminUser', JSON.stringify(res.data.user));
      }
      return res.data;
    } catch (err) {
      console.error('Registration API error:', err);
      throw new Error(err.response?.data?.error || err.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
    setUser(null);
    setSession(null);
    setAdminMode(false);
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminMode');
    delete axios.defaults.headers.common['Authorization'];
  };

  const isAdmin = Boolean(
    adminMode ||
      (user &&
        (user.user_metadata?.role === 'admin' ||
          user.app_metadata?.role === 'admin' ||
          user.email?.toLowerCase().includes('admin')))
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        loginAsSuperAdmin,
        register,
        logout,
        isAdmin,
        setAdminMode,
        accessToken: session?.access_token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

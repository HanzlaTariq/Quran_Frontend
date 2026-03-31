import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const envInactivityMinutes = Number(import.meta.env.VITE_AUTO_LOGOUT_MINUTES);
  const inactivityMinutes = Number.isFinite(envInactivityMinutes) && envInactivityMinutes > 0
    ? envInactivityMinutes
    : 10;
  const INACTIVITY_TIMEOUT_MS = inactivityMinutes * 60 * 1000;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const inactivityTimerRef = useRef(null);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user on initial render
  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const { data } = await axios.get('/api/auth/profile');
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (error) {
      console.error('Error loading user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // frontend/src/context/AuthContext.jsx - Update login function

const login = async (email, password) => {
  try {
    const { data } = await axios.post('/api/auth/login', { email, password });
    
    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }

    // Store token
    localStorage.setItem('token', data.token);
    setToken(data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    
    // Store user data
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Show success message
    toast.success(data.message || 'Login successful!');
    
    return { success: true, user: data.user };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Login failed';
    toast.error(errorMessage);
    return { success: false, error: errorMessage };
  }
};

  const register = async (userData) => {
    try {
      const { data } = await axios.post('/api/auth/register', userData);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      await loadUser();
      toast.success('Registration successful!');
      return { success: true, role: data.role };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false };
    }
  };

  const logout = (options = {}) => {
    const { message = 'Logged out successfully', showToast = true } = options;

    clearInactivityTimer();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];

    if (showToast && message) {
      toast.success(message);
    }
  };

  const resetInactivityTimer = useCallback(() => {
    if (!token) return;

    clearInactivityTimer();
    inactivityTimerRef.current = setTimeout(() => {
      logout({ message: 'Session expired due to inactivity', showToast: true });
      window.location.href = '/login';
    }, INACTIVITY_TIMEOUT_MS);
  }, [token, clearInactivityTimer]);

  useEffect(() => {
    if (!token) {
      clearInactivityTimer();
      return;
    }

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    resetInactivityTimer();
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      clearInactivityTimer();
    };
  }, [token, resetInactivityTimer, clearInactivityTimer]);

  const updateProfile = async (profileData) => {
    try {
      const { data } = await axios.put('/api/auth/profile', profileData);
      setUser(data);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
      return { success: false };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
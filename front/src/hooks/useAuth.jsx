// hooks/useAuth.jsx - ВЕРСИЯ БЕЗ ЛОГИРОВАНИЯ
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Проверяем авторизацию при загрузке приложения
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('beautycrm_token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      // Устанавливаем токен для API
      api.setToken(token);

      try {
        const userData = await api.get('/api/auth/me');

        if (userData && userData.email) {
          setUser(userData);
        } else {
          throw new Error('Invalid user data received');
        }
      } catch (err) {
        localStorage.removeItem('beautycrm_token');
        api.setToken(null);
        setUser(null);
      }
    } catch (err) {
      localStorage.removeItem('beautycrm_token');
      api.setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post('/api/auth/login', credentials);

      if (response.token && response.user) {
        // Сохраняем токен
        localStorage.setItem('beautycrm_token', response.token);
        api.setToken(response.token);

        // Устанавливаем пользователя
        setUser(response.user);

        return response;
      } else {
        throw new Error('Неверный ответ от сервера');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Ошибка при входе в систему';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post('/api/auth/register', userData);

      if (response.token && response.user) {
        // Сохраняем токен
        localStorage.setItem('beautycrm_token', response.token);
        api.setToken(response.token);

        // Устанавливаем пользователя
        setUser(response.user);

        return response;
      } else {
        throw new Error('Неверный ответ от сервера');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Ошибка при регистрации';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('beautycrm_token');
      api.setToken(null);
      setUser(null);
      setError(null);
    } catch (err) {
      // Без логирования ошибки
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isClient: user?.role === 'client',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

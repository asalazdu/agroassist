import React, {createContext, useContext, useState, useEffect} from 'react';
import {authService} from './api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si el usuario está logueado al iniciar la app
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const result = await authService.isLoggedIn();
      if (result.success) {
        setIsAuthenticated(true);
        setUser(result.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const result = await authService.login(credentials);
      if (result.success) {
        setIsAuthenticated(true);
        setUser(result.data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.error 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Error de conexión' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: 'Error de conexión' 
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Error al cerrar sesión' 
      };
    }
  };

  const recoverPassword = async (email) => {
    try {
      const result = await authService.recoverPassword(email);
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: 'Error de conexión' 
      };
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    recoverPassword,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

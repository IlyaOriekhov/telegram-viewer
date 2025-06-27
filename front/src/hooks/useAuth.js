import { useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";
import {
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../utils/constants.js";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await authAPI.getProfile();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error(error);
      // Token is invalid, clear it

      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      setError(ERROR_MESSAGES.UNAUTHORIZED);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(credentials);

      // Store token
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.access_token);

      // Get user profile
      const userData = await authAPI.getProfile();
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, message: SUCCESS_MESSAGES.LOGIN_SUCCESS };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.register(userData);

      // Store token
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.access_token);

      // Get user profile
      const userProfile = await authAPI.getProfile();
      setUser(userProfile);
      setIsAuthenticated(true);

      return { success: true, message: SUCCESS_MESSAGES.REGISTER_SUCCESS };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);

    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    checkAuthStatus,
  };
};

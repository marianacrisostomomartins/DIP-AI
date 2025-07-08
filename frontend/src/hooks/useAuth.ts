import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { apiClient } from '../services/api';

export const useAuth = () => {
  const navigate = useNavigate();

  const logout = useCallback(() => {
    apiClient.logout();
    navigate('/login', { replace: true });
  }, [navigate]);

  const isAuthenticated = useCallback(() => {
    return apiClient.isAuthenticated();
  }, []);

  const getCurrentUserEmail = useCallback(() => {
    return apiClient.getCurrentUserEmail();
  }, []);

  return {
    logout,
    isAuthenticated,
    getCurrentUserEmail
  };
};

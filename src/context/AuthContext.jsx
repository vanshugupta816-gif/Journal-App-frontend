import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const storedUserName = localStorage.getItem('userName') || 'User';
      setUser({ authenticated: true, userName: storedUserName });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = async (userName, password) => {
    try {
      const response = await api.login({ userName, password });
      const jwtToken = response.data; 
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('userName', userName);
      setToken(jwtToken);
      setUser({ authenticated: true, userName });
      const hasProfile = !!localStorage.getItem(`profile_${userName}`);
      return { success: true, requireProfileSetup: !hasProfile };
    } catch (error) {
      console.error('Login failed', error);
      
      let errorMessage = 'Login failed. Please check your credentials.';
      if (!error.response) {
          errorMessage = 'Unable to connect to the server. Please check if the backend is running.';
      } else if (error.response.status === 502 || error.response.status === 504) {
          errorMessage = 'The backend server is currently offline or crashed. Please start it up.';
      } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
      }

      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const signup = async (userData) => {
    try {
      await api.signup(userData);
      return { success: true };
    } catch (error) {
      console.error('Signup failed', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const googleLoginWithCode = async (code) => {
    try {
      const response = await api.googleLogin(code);
      const jwtToken = response.data.Token;
      
      if (jwtToken) {
        // Decode JWT to get username (sub)
        const payload = JSON.parse(atob(jwtToken.split('.')[1]));
        const userName = payload.sub;

        localStorage.setItem('token', jwtToken);
        localStorage.setItem('userName', userName);
        setToken(jwtToken);
        setUser({ authenticated: true, userName });
        
        const hasProfile = !!localStorage.getItem(`profile_${userName}`);
        return { success: true, requireProfileSetup: !hasProfile };
      }
      return { success: false, error: 'Invalid token received from Google' };
    } catch (error) {
      console.error('Google login failed', error);
      return { success: false, error: 'Google login failed. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, googleLoginWithCode, logout }}>
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

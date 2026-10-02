import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NewEntry from './pages/NewEntry';
import EditEntry from './pages/EditEntry';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

import SetupProfile from './pages/SetupProfile';
import Profile from './pages/Profile';
import MyJournals from './pages/MyJournals';
import Settings from './pages/Settings';
import Trash from './pages/Trash';
import HelpSupport from './pages/HelpSupport';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [accentColor, setAccentColor] = useState(localStorage.getItem('accentColor') || '#4F46E5');

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '665891871321-8emklkau10u3nnla1kk84vif90b6d4vn.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/setup-profile" element={<SetupProfile />} />
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout theme={theme} toggleTheme={toggleTheme} setTheme={setTheme} accentColor={accentColor} setAccentColor={setAccentColor} />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="journals" element={<MyJournals />} />
            <Route path="new-entry" element={<NewEntry />} />
            <Route path="edit-entry/:id" element={<EditEntry />} />
            <Route path="trash" element={<Trash />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<HelpSupport />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

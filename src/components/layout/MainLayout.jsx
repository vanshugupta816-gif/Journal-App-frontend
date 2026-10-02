import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './MainLayout.module.css';

const MainLayout = ({ theme, toggleTheme, setTheme, accentColor, setAccentColor }) => {
  return (
    <div className="app-container">
      <Sidebar theme={theme} toggleTheme={toggleTheme} />
      <div className="main-content">
        <Header />
        <div className="page-content">
          <Outlet context={{ theme, setTheme, accentColor, setAccentColor }} />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;

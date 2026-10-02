import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus } from 'lucide-react';
import styles from './Header.module.css';

const Header = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.header}>
      <div className={styles.searchContainer}>
        <Search size={18} className={styles.searchIcon} />
        <input 
          type="text" 
          className={styles.searchInput} 
          placeholder="Search your entries, tags, mood..." 
        />
        <div className={styles.shortcutKey}>⌘K</div>
      </div>

      <div className={styles.actions}>
        <div className={styles.notification}>
          <Bell size={20} />
          <span className={styles.notificationDot}></span>
        </div>
        <button className={styles.newEntryBtn} onClick={() => navigate('/new-entry')}>
          <Plus size={18} />
          <span>New Entry</span>
        </button>
      </div>
    </div>
  );
};

export default Header;

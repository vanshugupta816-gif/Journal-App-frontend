import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  LayoutDashboard, 
  PenTool, 
  Calendar, 
  BarChart2, 
  Smile, 
  Cloud, 
  Tag, 
  Star, 
  Trash2, 
  Settings, 
  HelpCircle,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  User
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ theme, toggleTheme }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState(null);

  React.useEffect(() => {
    if (user?.userName) {
      const stored = localStorage.getItem(`profile_${user.userName}`);
      if (stored) {
        try {
          setProfile(JSON.parse(stored));
        } catch(e) {}
      }
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <BookOpen size={20} />
        </div>
        <div className={styles.logoText}>JournalFlow</div>
      </div>

      <nav className={styles.navList}>
        <NavLink to="/" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/journals" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <BookOpen size={18} />
          <span>My Journals</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <User size={18} />
          <span>Profile</span>
        </NavLink>
        <NavLink to="/new-entry" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <PenTool size={18} />
          <span>New Entry</span>
        </NavLink>

        <NavLink to="/trash" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <Trash2 size={18} />
          <span>Trash</span>
        </NavLink>
        

        <NavLink to="/settings" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
        <NavLink to="/help" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <HelpCircle size={18} />
          <span>Help & Support</span>
        </NavLink>
        {/* Logout Button */}
        <div className={styles.navItem} onClick={handleLogout} style={{ color: '#EF4444' }}>
          <LogOut size={18} />
          <span>Logout</span>
        </div>
      </nav>

      <div className={styles.bottomSection}>
        <div className={styles.userProfile}>
          {profile?.profilePic ? (
            <img 
              src={profile.profilePic} 
              alt="Profile" 
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} 
            />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--accent-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {(profile?.fullName || user?.userName || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div className={styles.userInfo}>
            <span className={styles.userName}>{profile?.fullName || user?.userName || 'User'}</span>
            <span className={styles.userEmail}>My Journal</span>
          </div>
          <ChevronDown size={16} style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }} />
        </div>

        <div className={styles.themeToggle} onClick={toggleTheme}>
          <div className={styles.themeToggleLabel}>
            {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === 'light' ? 'Light' : 'Dark'}</span>
          </div>
          <div className={styles.toggleSwitch}>
            <div className={styles.toggleCircle}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Settings.module.css';
import { 
  User, 
  Palette, 
  BookOpen, 
  Bell, 
  Lock, 
  Clock, 
  Cloud, 
  Info,
  Camera,
  Sun,
  Moon,
  Monitor,
  Check,
  Smile,
  Download,
  Trash2,
  Book
} from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const context = useOutletContext() || {};
  const { 
    theme = 'light', 
    setTheme = () => {}, 
    accentColor = '#6366F1', 
    setAccentColor = () => {} 
  } = context;
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ fullName: '', email: '' });

  // Mock settings state for UI presentation
  const [wordCount, setWordCount] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [achievements, setAchievements] = useState(true);
  const [biometric, setBiometric] = useState(true);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcode, setPasscode] = useState('');

  useEffect(() => {
    if (user?.userName) {
      const stored = localStorage.getItem(`profile_${user.userName}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setProfile({
            fullName: parsed.fullName || '',
            email: parsed.email || `${user.userName}@email.com`,
            profilePic: parsed.profilePic || ''
          });
        } catch(e) {}
      } else {
        setProfile({
          fullName: user.userName,
          email: `${user.userName}@email.com`,
          profilePic: ''
        });
      }
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    if (user?.userName) {
      localStorage.setItem(`profile_${user.userName}`, JSON.stringify(profile));
      alert('Profile saved successfully!');
    }
  };

  const handleExportData = async () => {
    try {
      const response = await api.getAllJournals();
      if (response.data) {
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'my-journal-export.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      alert('Failed to export data: ' + error.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you ABSOLUTELY sure you want to delete your account? This action cannot be undone and will permanently delete all your journals.")) {
      try {
        await api.deleteAccount();
        logout();
        navigate('/login');
      } catch (error) {
        alert('Failed to delete account: ' + error.message);
      }
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Lock },
    { id: 'reminders', label: 'Reminders', icon: Clock },
    { id: 'backup', label: 'Backup & Export', icon: Cloud },
    { id: 'about', label: 'About', icon: Info },
  ];

  const colors = ['#6366F1', '#EC4899', '#F97316', '#10B981', '#06B6D4', '#3B82F6', '#6B7280'];

  const Toggle = ({ checked, onChange }) => (
    <div className={`${styles.toggleSwitch} ${checked ? styles.on : ''}`} onClick={() => onChange(!checked)}>
      <div className={styles.toggleHandle}></div>
    </div>
  );

  const handleSavePasscode = () => {
    if (passcode.length < 4) {
      alert('Passcode must be at least 4 characters');
      return;
    }
    alert('Passcode saved successfully!');
    setShowPasscodeModal(false);
    setPasscode('');
  };

  return (
    <div className={styles.container}>
      
      {/* Left Navigation */}
      <div className={styles.leftSidebar}>
        <h1 className={styles.pageTitle}>Settings</h1>
        <p className={styles.pageSubtitle}>Manage your preferences and account settings.</p>

        <div className={styles.navMenu}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <div 
                key={tab.id}
                className={`${styles.navItem} ${activeTab === tab.id ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        
        {/* Profile Section */}
        {(activeTab === 'profile' || activeTab === 'all') && (
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Profile Information</h3>
            <div className={styles.profileLayout}>
              <div className={styles.avatarSection}>
                {profile.profilePic ? (
                  <img src={profile.profilePic} alt="Avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <span className={styles.avatarInitial}>
                    {(profile.fullName || user?.userName || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
                <div className={styles.cameraIcon}>
                  <Camera size={14} />
                </div>
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    name="fullName"
                    value={profile.fullName} 
                    onChange={handleProfileChange}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={profile.email} 
                    onChange={handleProfileChange}
                    placeholder="Enter your email"
                  />
                </div>
                <button className={styles.saveBtn} onClick={handleSaveProfile}>Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {/* Appearance Section */}
        {(activeTab === 'appearance' || activeTab === 'all') && (
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Appearance</h3>
            
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <h4>Theme</h4>
                <p>Choose your preferred theme for the application.</p>
              </div>
              <div className={styles.themeOptions}>
                <div className={`${styles.themeCard} ${theme === 'light' ? styles.active : ''}`} onClick={() => setTheme('light')}>
                  <Sun size={24} />
                  <span>Light</span>
                </div>
                <div className={`${styles.themeCard} ${theme === 'dark' ? styles.active : ''}`} onClick={() => setTheme('dark')}>
                  <Moon size={24} />
                  <span>Dark</span>
                </div>
                <div className={`${styles.themeCard} ${theme === 'system' ? styles.active : ''}`} onClick={() => setTheme('system')}>
                  <Monitor size={24} />
                  <span>System</span>
                </div>
              </div>
            </div>

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <h4>Accent Color</h4>
                <p>Choose the accent color for your journal.</p>
              </div>
              <div className={styles.colorSwatches}>
                {colors.map(color => (
                  <div 
                    key={color} 
                    className={styles.colorSwatch} 
                    style={{ backgroundColor: color }}
                    onClick={() => setAccentColor(color)}
                  >
                    {accentColor === color && <Check size={14} color="white" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Journal Settings */}
        {(activeTab === 'journal' || activeTab === 'all') && (
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Journal Settings</h3>
            
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <h4>Default Mood</h4>
                <p>Set the default mood for new entries.</p>
              </div>
              <select className={styles.selectControl}>
                <option>😊 Happy</option>
                <option>😐 Neutral</option>
                <option>😔 Sad</option>
              </select>
            </div>

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <h4>Default Tags</h4>
                <p>Choose default tags for new entries.</p>
              </div>
              <select className={styles.selectControl}>
                <option>Personal, Thoughts</option>
                <option>Work</option>
                <option>Ideas</option>
              </select>
            </div>

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <h4>Show Word Count</h4>
                <p>Display the word count while writing.</p>
              </div>
              <Toggle checked={wordCount} onChange={setWordCount} />
            </div>

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <h4>Auto-save Entries</h4>
                <p>Automatically save your entries as you write.</p>
              </div>
              <Toggle checked={autoSave} onChange={setAutoSave} />
            </div>
          </div>
        )}

        {/* Notifications */}
        {(activeTab === 'notifications' || activeTab === 'all') && (
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Notifications</h3>
            
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <h4>Daily Reminder</h4>
                <p>Get a daily reminder to write in your journal.</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <select className={styles.selectControl} style={{ minWidth: '100px' }}>
                  <option>09:00 PM</option>
                  <option>08:00 AM</option>
                </select>
                <Toggle checked={dailyReminder} onChange={setDailyReminder} />
              </div>
            </div>

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <h4>Weekly Summary</h4>
                <p>Receive a weekly summary of your journal.</p>
              </div>
              <Toggle checked={weeklySummary} onChange={setWeeklySummary} />
            </div>

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <h4>Achievements</h4>
                <p>Notify me about new achievements.</p>
              </div>
              <Toggle checked={achievements} onChange={setAchievements} />
            </div>
          </div>
        )}

        {/* Privacy & Security */}
        {(activeTab === 'privacy' || activeTab === 'all') && (
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Privacy & Security</h3>
            
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <h4>Passcode Lock</h4>
                <p>Lock the app with a passcode.</p>
              </div>
              <button className={styles.secondaryBtn} onClick={() => setShowPasscodeModal(true)}>Set Passcode</button>
            </div>

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <h4>Biometric Lock</h4>
                <p>Unlock the app using fingerprint or face ID.</p>
              </div>
              <Toggle checked={biometric} onChange={(val) => { setBiometric(val); alert("Biometric setting saved!"); }} />
            </div>

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <h4>Export Data</h4>
                <p>Download all your journal data.</p>
              </div>
              <button className={styles.secondaryBtn} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleExportData}>
                <Download size={14} /> Export
              </button>
            </div>

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <h4>Delete Account</h4>
                <p>Permanently delete your account and all data.</p>
              </div>
              <button className={styles.dangerBtn} onClick={handleDeleteAccount}>
                <Trash2 size={14} /> Delete Account
              </button>
            </div>
          </div>
        )}

        {/* About */}
        {(activeTab === 'about' || activeTab === 'all') && (
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>About Journal.</h3>
            
            <div className={styles.settingRow}>
              <div className={styles.aboutCard}>
                <div className={styles.aboutIcon}>
                  <Book size={24} />
                </div>
                <div className={styles.aboutInfo}>
                  <h4>Journal v1.0.0</h4>
                  <p>Your thoughts, your story, your journal.</p>
                </div>
              </div>
              <button className={styles.secondaryBtn}>Check for Updates</button>
            </div>

            <div className={styles.aboutLinks}>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Support</span>
            </div>
          </div>
        )}

      </div>

      {/* Passcode Modal */}
      {showPasscodeModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPasscodeModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Set Passcode</h3>
            <div className={styles.formGroup}>
              <label>Enter new passcode</label>
              <input 
                type="password" 
                placeholder="****" 
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                maxLength={6}
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.secondaryBtn} onClick={() => setShowPasscodeModal(false)}>Cancel</button>
              <button className={styles.primaryBtn} onClick={handleSavePasscode}>Save Passcode</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Signup.module.css'; // Reusing signup styles

const SetupProfile = () => {
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    if (user?.userName) {
      const stored = localStorage.getItem(`profile_${user.userName}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setFullName(parsed.fullName || '');
          setLocation(parsed.location || '');
          setBio(parsed.bio || '');
          setJoinDate(parsed.joinDate || '');
        } catch(e) {}
      }
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!user?.userName) {
      alert("Please login first");
      navigate('/login');
      return;
    }

    const profileData = { fullName, location, bio, joinDate };
    localStorage.setItem(`profile_${user.userName}`, JSON.stringify(profileData));
    
    // Navigate to profile dashboard instead of home
    navigate('/profile');
    setLoading(false);
  };

  const isUpdate = !!localStorage.getItem(`profile_${user?.userName}`);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>{isUpdate ? 'Update Your Profile 🛠️' : 'Complete Your Profile 🛠️'}</h2>
        <p className={styles.subtitle}>{isUpdate ? 'Update your personal details below.' : 'Tell us a bit about yourself to get started.'}</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="fullName" className={styles.label}>Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={styles.input}
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="location" className={styles.label}>Location (City)</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={styles.input}
              placeholder="e.g. London, UK"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="bio" className={styles.label}>Bio / Interests</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={styles.input}
              style={{ minHeight: '80px', resize: 'vertical' }}
              placeholder="What do you like to write about?"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="joinDate" className={styles.label}>Join Date</label>
            <input
              id="joinDate"
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Saving...' : (isUpdate ? 'Update Profile' : 'Save & Continue')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupProfile;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Edit2, MapPin, Calendar as CalendarIcon, BookOpen, CalendarDays, Smile, Heart, Star, Shield, Award, CheckCircle, X } from 'lucide-react';
import styles from './Profile.module.css';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [journals, setJournals] = useState([]);
  
  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editJoinDate, setEditJoinDate] = useState('');
  const [editProfilePic, setEditProfilePic] = useState('');

  useEffect(() => {
    if (user?.userName) {
      const stored = localStorage.getItem(`profile_${user.userName}`);
      if (stored) {
        try {
          setProfile(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }

    const fetchJournals = async () => {
      try {
        const response = await api.getAllJournals();
        setJournals(response.data || []);
      } catch (err) {
        console.error('Failed to fetch journals', err);
      }
    };
    fetchJournals();
  }, [user]);

  const handleEditProfile = () => {
    setEditFullName(profile?.fullName || user?.userName || '');
    setEditLocation(profile?.location || '');
    setEditBio(profile?.bio || '');
    setEditJoinDate(profile?.joinDate || '');
    setEditProfilePic(profile?.profilePic || '');
    setIsEditing(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!user?.userName) return;

    const profileData = { 
      fullName: editFullName, 
      location: editLocation, 
      bio: editBio, 
      joinDate: editJoinDate,
      profilePic: editProfilePic
    };
    
    localStorage.setItem(`profile_${user.userName}`, JSON.stringify(profileData));
    setProfile(profileData);
    setIsEditing(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return 'August 2026';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // --- Calculate Stats ---
  const totalEntries = journals.length;
  
  // Calculate unique days journaled
  const uniqueDates = new Set(journals.map(j => {
    if (!j.date) return null;
    return new Date(j.date).toDateString();
  }).filter(Boolean));
  const daysJournaled = uniqueDates.size;

  // Parse favorite entries robustly
  const favoriteEntries = journals.filter(j => {
    if (!j.tags) return false;
    const tagsArray = Array.isArray(j.tags) ? j.tags : (typeof j.tags === 'string' ? j.tags.split(',') : []);
    const cleanTags = tagsArray.map(t => typeof t === 'string' ? t.trim().toLowerCase() : '');
    return cleanTags.includes('favorite');
  });
  
  const favCount = favoriteEntries.length;

  // Mock streak since actual streak requires date sorting logic
  const currentStreak = Math.min(daysJournaled, 12); 

  // --- Mood Data Processing ---
  const moodCounts = journals.reduce((acc, journal) => {
    const mood = journal.sentiment || 'NEUTRAL';
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {});

  const totalMoods = journals.length || 1; // avoid div by 0
  
  // Re-map backend sentiments to screenshot labels (Happy, Calm, Sad, Anxious, Tired)
  const mappedMoods = {
    'Happy': (moodCounts['HAPPY'] || 0) + (moodCounts['EXCITED'] || 0),
    'Calm': (moodCounts['NEUTRAL'] || 0) + (moodCounts['FOCUSED'] || 0),
    'Sad': moodCounts['SAD'] || 0,
    'Anxious': (moodCounts['ANXIOUS'] || 0) + (moodCounts['ANGRY'] || 0),
    'Tired': 0 // Mock field
  };

  let totalMapped = Object.values(mappedMoods).reduce((a, b) => a + b, 0) || 1;

  const moodData = [
    { name: 'Happy', value: mappedMoods['Happy'], color: '#A78BFA', emoji: '😋' },
    { name: 'Calm', value: mappedMoods['Calm'], color: '#F472B6', emoji: '😌' },
    { name: 'Sad', value: mappedMoods['Sad'], color: '#FCD34D', emoji: '😢' },
    { name: 'Anxious', value: mappedMoods['Anxious'], color: '#34D399', emoji: '😰' },
    { name: 'Tired', value: mappedMoods['Tired'], color: '#93C5FD', emoji: '😴' },
  ].filter(m => m.value > 0).sort((a, b) => b.value - a.value);

  // Top Emotions derived from actual data
  const topEmotions = moodData.slice(0, 4).map(item => ({
    name: item.name,
    percentage: Math.round((item.value / totalMapped) * 100),
    color: item.color,
    icon: <Smile size={16} />
  }));

  // Actual favorite list (show up to 6)
  const favList = favoriteEntries.slice(0, 6);

  return (
    <div className={styles.container}>
      
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Update Your Profile</h2>
              <button className={styles.closeBtn} onClick={() => setIsEditing(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className={styles.modalForm}>
              <div className={styles.inputGroup}>
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={editFullName} 
                  onChange={(e) => setEditFullName(e.target.value)} 
                  required 
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Location (City)</label>
                <input 
                  type="text" 
                  value={editLocation} 
                  onChange={(e) => setEditLocation(e.target.value)} 
                  required 
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Bio</label>
                <textarea 
                  value={editBio} 
                  onChange={(e) => setEditBio(e.target.value)} 
                  required 
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Join Date</label>
                <input 
                  type="date" 
                  value={editJoinDate} 
                  onChange={(e) => setEditJoinDate(e.target.value)} 
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Profile Picture</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload} 
                />
                {editProfilePic && (
                  <img src={editProfilePic} alt="Preview" style={{ marginTop: '10px', width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                )}
              </div>
              <button type="submit" className={styles.submitModalBtn}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Profile</h1>
          <p className={styles.subtitle}>Your thoughts. Your story. Your growth.</p>
        </div>
        <button className={styles.editBtn} onClick={handleEditProfile} title="Edit Profile">
          <Edit2 size={18} />
        </button>
      </div>

      {/* Banner */}
      <div className={styles.bannerCard}>
        <img 
          src="https://images.unsplash.com/photo-1506744626753-eba7bc336109?auto=format&fit=crop&w=1200&q=80" 
          alt="Banner" 
          className={styles.bannerImg} 
        />
        <div className={styles.bannerOverlay}></div>
        
        <div className={styles.bannerContent}>
          <div className={styles.avatarWrapper}>
            <img 
              src={profile?.profilePic || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80"} 
              alt="Avatar" 
              className={styles.avatar} 
            />
            <button className={styles.avatarEditBtn} onClick={handleEditProfile}>
              <Edit2 size={16} />
            </button>
          </div>
          
          <div className={styles.userInfo}>
            <h2 className={styles.userName}>{profile?.fullName || user?.userName || 'User'}</h2>
            <p className={styles.userBio}>{profile?.bio || 'Dreamer | Writer | Believer ✨\nKeeping memories alive, one entry at a time.'}</p>
            
            <div className={styles.userMeta}>
              <div className={styles.metaItem}>
                <CalendarIcon size={16} />
                <span>Joined {formatJoinDate(profile?.joinDate)}</span>
              </div>
              <div className={styles.metaItem}>
                <MapPin size={16} />
                <span>{profile?.location || 'Unknown'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}><BookOpen size={24} /></div>
          <div>
            <div className={styles.statValue}>{totalEntries}</div>
            <div className={styles.statLabel}>Entries</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}><CalendarDays size={24} /></div>
          <div>
            <div className={styles.statValue}>{daysJournaled}</div>
            <div className={styles.statLabel}>Days Journaled</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}><Smile size={24} /></div>
          <div>
            <div className={styles.statValue}>{currentStreak}</div>
            <div className={styles.statLabel}>Current Streak</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}><Heart size={24} /></div>
          <div>
            <div className={styles.statValue}>{favCount}</div>
            <div className={styles.statLabel}>Favorite Entries</div>
          </div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        {/* Mood Overview Chart */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Mood Overview</h3>
            <span className={styles.cardSubtitle}>This month</span>
          </div>
          
          {moodData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div style={{ width: '180px', height: '180px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={moodData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {moodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Smile size={32} color="var(--accent-color)" />
                </div>
              </div>
              
              <div className={styles.moodLegend} style={{ flex: 1 }}>
                {moodData.map(item => (
                  <div key={item.name} className={styles.legendItem}>
                    <div className={styles.legendLeft}>
                      <span>{item.emoji}</span>
                      <span>{item.name}</span>
                    </div>
                    <div className={styles.legendRight}>
                      {Math.round((item.value / totalMapped) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
              No mood data yet. Write an entry to see insights!
            </div>
          )}
        </div>

        {/* Top Emotions Progress Bars */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Top Emotions</h3>
            <span className={styles.cardSubtitle}>This month</span>
          </div>
          
          {topEmotions.length > 0 ? (
            <div className={styles.emotionsList}>
              {topEmotions.map(emotion => (
                <div key={emotion.name} className={styles.emotionItem}>
                  <div className={styles.emotionHeader}>
                    <div className={styles.emotionLeft} style={{ color: emotion.color }}>
                      {emotion.icon}
                      <span style={{ color: 'var(--text-primary)' }}>{emotion.name}</span>
                    </div>
                    <div className={styles.emotionRight}>{emotion.percentage}%</div>
                  </div>
                  <div className={styles.progressBarContainer}>
                    <div 
                      className={styles.progressBar} 
                      style={{ width: `${emotion.percentage}%`, backgroundColor: emotion.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
              No emotions logged yet.
            </div>
          )}
        </div>
      </div>

      <div className={styles.card} style={{ marginBottom: '2rem' }}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Favorite Entries</h3>
          <span className={styles.cardSubtitle} style={{ color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 500 }}>View all</span>
        </div>
        
        <div className={styles.favoritesList}>
          {favList.length > 0 ? favList.map((fav, i) => (
            <div key={i} className={styles.favoriteItem}>
              <img src={fav.img || fav.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80'} alt={fav.title} className={styles.favImage} />
              <div className={styles.favContent}>
                <h4 className={styles.favTitle}>{fav.title}</h4>
                <p className={styles.favDesc}>{fav.desc || fav.content?.substring(0, 50)}</p>
                <span className={styles.favTag} style={{ backgroundColor: fav.color || '#E0E7FF', color: fav.textColor || '#4F46E5' }}>
                  {fav.tag || (fav.tags && fav.tags.filter(t => t !== 'favorite')[0]) || 'Favorite'}
                </span>
              </div>
              <div className={styles.favRight}>
                <span className={styles.favDate}>{fav.date}</span>
                <Star size={16} className={styles.favStar} fill="#F59E0B" />
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
              No favorite entries yet. Check the star on an entry to favorite it!
            </div>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Achievements</h3>
        </div>
        
        <div className={styles.achievementsList}>
          <div className={styles.achievementItem}>
            <div className={`${styles.achieveIcon} ${styles.purple}`}>
              <Award size={28} />
            </div>
            <div>
              <div className={styles.achieveTitle}>Consistent Writer</div>
              <div className={styles.achieveDesc}>Write for 7 days in a row</div>
              <div className={styles.achieveDate}>10 May 2024</div>
            </div>
          </div>
          
          <div className={styles.achievementItem}>
            <div className={`${styles.achieveIcon} ${styles.pink}`}>
              <Heart size={28} />
            </div>
            <div>
              <div className={styles.achieveTitle}>Mood Tracker</div>
              <div className={styles.achieveDesc}>Track moods for 15 days</div>
              <div className={styles.achieveDate}>18 May 2024</div>
            </div>
          </div>
          
          <div className={styles.achievementItem}>
            <div className={`${styles.achieveIcon} ${styles.green}`}>
              <CheckCircle size={28} />
            </div>
            <div>
              <div className={styles.achieveTitle}>Journal Starter</div>
              <div className={styles.achieveDesc}>Write your first entry</div>
              <div className={styles.achieveDate}>5 May 2024</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { 
  BookOpen, 
  Flame, 
  Calendar as CalendarIcon, 
  Smile,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Bookmark,
  MoreHorizontal,
  ImageIcon,
  Tag,
  PenTool
} from 'lucide-react';
import styles from './MyJournals.module.css';

const MyJournals = () => {
  const [journals, setJournals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const response = await api.getAllJournals();
        setJournals(response.data || []);
      } catch (err) {
        console.error('Failed to fetch journals', err);
      }
    };
    fetchJournals();
  }, []);

  // --- Process Stats ---
  const totalEntries = journals.length;
  
  const uniqueDates = new Set(journals.map(j => {
    if (!j.date) return null;
    return new Date(j.date).toDateString();
  }).filter(Boolean));
  const daysJournaled = uniqueDates.size;
  const currentStreak = Math.min(daysJournaled, 7); // Mock streak for design

  const currentMonthEntries = journals.filter(j => {
    if (!j.date) return false;
    const d = new Date(j.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const moodCounts = journals.reduce((acc, journal) => {
    const mood = journal.sentiment || 'NEUTRAL';
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {});

  const mappedMoods = {
    'Happy': (moodCounts['HAPPY'] || 0) + (moodCounts['EXCITED'] || 0),
    'Neutral': (moodCounts['NEUTRAL'] || 0) + (moodCounts['FOCUSED'] || 0),
    'Sad': moodCounts['SAD'] || 0,
    'Excited': moodCounts['EXCITED'] || 0,
    'Angry': moodCounts['ANGRY'] || 0,
  };

  const topMood = Object.keys(mappedMoods).reduce((a, b) => mappedMoods[a] > mappedMoods[b] ? a : b, 'Happy');

  // Chart Data
  const moodData = [
    { name: 'Happy', value: mappedMoods['Happy'] || 0, color: '#34D399' },
    { name: 'Neutral', value: mappedMoods['Neutral'] || 0, color: '#FBBF24' },
    { name: 'Sad', value: mappedMoods['Sad'] || 0, color: '#60A5FA' },
    { name: 'Excited', value: mappedMoods['Excited'] || 0, color: '#F472B6' },
    { name: 'Angry', value: mappedMoods['Angry'] || 0, color: '#EF4444' },
  ].filter(m => m.value > 0).sort((a, b) => b.value - a.value);

  const totalMoods = moodData.reduce((acc, m) => acc + m.value, 0) || 1;

  const getEmojiForSentiment = (sentiment) => {
    switch(sentiment) {
      case 'HAPPY': return '😊';
      case 'EXCITED': return '😍';
      case 'SAD': return '😔';
      case 'ANXIOUS': return '😰';
      case 'ANGRY': return '😠';
      case 'FOCUSED': return '😎';
      default: return '😐';
    }
  };

  const getColorForSentiment = (sentiment) => {
    switch(sentiment) {
      case 'HAPPY': return 'green';
      case 'EXCITED': return 'purple';
      case 'SAD': return 'blue';
      case 'ANXIOUS': return 'pink';
      case 'ANGRY': return 'yellow';
      default: return 'gray';
    }
  };

  // Dynamic Calendar Data
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); 
  const startDay = (firstDayOfMonth + 6) % 7; 
  
  const calendarDays = [];
  
  // Fill previous month days
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
  for (let i = 0; i < startDay; i++) {
    calendarDays.push({ num: daysInPrevMonth - startDay + i + 1, current: false, emoji: '' });
  }
  
  // Map journals by date for quick lookup
  const journalsByDate = {};
  journals.forEach(j => {
    if (j.date) {
      const d = new Date(j.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        journalsByDate[d.getDate()] = j.sentiment;
      }
    }
  });

  // Fill current month days
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    let emoji = '';
    if (journalsByDate[i]) {
       emoji = getEmojiForSentiment(journalsByDate[i]);
    }
    calendarDays.push({ num: i, current: true, emoji: emoji, active: i === now.getDate() });
  }

  // Pinned Memory
  const favoriteEntries = journals.filter(j => {
    if (!j.tags) return false;
    const tagsArray = Array.isArray(j.tags) ? j.tags : (typeof j.tags === 'string' ? j.tags.split(',') : []);
    const cleanTags = tagsArray.map(t => typeof t === 'string' ? t.trim().toLowerCase() : '');
    return cleanTags.includes('favorite');
  });
  const pinnedMemory = favoriteEntries.length > 0 ? favoriteEntries[0] : null;



  const formatDateStr = (dateStr) => {
    if (!dateStr) return { date: '', time: '' };
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
  };

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>My Journal</h1>
        <p className={styles.subtitle}>Capture your thoughts, memories & moments.</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.purple}`}>
            <BookOpen size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{totalEntries}</div>
            <div className={styles.statLabel}>Total Entries</div>
            <div className={styles.statSubtext}>All time</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.orange}`}>
            <Flame size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{currentStreak}</div>
            <div className={styles.statLabel}>Day Streak</div>
            <div className={styles.statSubtext}>Keep it up! 🔥</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.green}`}>
            <CalendarIcon size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{currentMonthEntries}</div>
            <div className={styles.statLabel}>This Month</div>
            <div className={styles.statSubtext}>August 2026</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.yellow}`}>
            <Smile size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>Mostly {topMood}</div>
            <div className={styles.statLabel}>Your top mood {topMood === 'Happy' ? '😊' : '😐'}</div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className={styles.mainGrid}>
        
        {/* Left Column: Calendar */}
        <div className={styles.calendarCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>{now.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
            <div className={styles.calendarControls}>
              <button className={styles.calendarNavBtn}><ChevronLeft size={16} /></button>
              <button className={styles.calendarNavBtn}><ChevronRight size={16} /></button>
            </div>
          </div>
          
          <div className={styles.calendarGrid}>
            <div className={styles.weekday}>Mon</div>
            <div className={styles.weekday}>Tue</div>
            <div className={styles.weekday}>Wed</div>
            <div className={styles.weekday}>Thu</div>
            <div className={styles.weekday}>Fri</div>
            <div className={styles.weekday}>Sat</div>
            <div className={styles.weekday}>Sun</div>
            
            {calendarDays.map((day, idx) => (
              <div key={idx} className={`${styles.dayCell} ${day.current ? '' : styles.inactive} ${day.active ? styles.active : ''}`}>
                <span className={styles.dayNumber}>{day.num}</span>
                <span className={styles.dayEmoji}>{day.emoji}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn}>
          
          {/* Mood Summary */}
          <div className={styles.smallCard}>
            <h3 className={styles.cardTitle} style={{ marginBottom: '1rem' }}>This Month Mood Summary</h3>
            {moodData.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '120px', height: '120px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={moodData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={55}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {moodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className={styles.moodLegend}>
                  {moodData.map((item, idx) => (
                    <div key={idx} className={styles.legendItem}>
                      <div className={styles.legendDot} style={{ backgroundColor: item.color }}></div>
                      <span>{item.value} {item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                No moods logged yet this month.
              </div>
            )}
          </div>

          {/* Pinned Memories */}
          <div className={styles.smallCard}>
            <div className={styles.cardHeader} style={{ marginBottom: '0.5rem' }}>
              <h3 className={styles.cardTitle}>Pinned Memories</h3>
              {pinnedMemory && <span className={styles.viewAll}>View all</span>}
            </div>
            
            {pinnedMemory ? (
              <div className={styles.pinnedCard}>
                <img src={pinnedMemory.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&q=80"} alt="Pinned" className={styles.pinnedImage} />
                <div className={styles.pinnedContent}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 className={styles.pinnedTitle}>{pinnedMemory.title}</h4>
                    <Bookmark size={16} color="#6366F1" fill="#6366F1" />
                  </div>
                  <p className={styles.pinnedDesc}>{pinnedMemory.content?.substring(0, 40)}...</p>
                  <span className={styles.pinnedTag}>{pinnedMemory.sentiment || 'Favorite'}</span>
                </div>
                <MoreHorizontal size={16} color="var(--text-secondary)" style={{ alignSelf: 'flex-end', cursor: 'pointer' }} />
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                No pinned memories yet. Add a "favorite" tag to an entry to see it here!
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input type="text" placeholder="Search entries..." className={styles.searchInput} />
        </div>
        <select className={styles.filterSelect}>
          <option>All Moods</option>
          <option>Happy</option>
          <option>Sad</option>
        </select>
        <select className={styles.filterSelect}>
          <option>All Tags</option>
          <option>Work</option>
          <option>Personal</option>
        </select>
        <button className={styles.sortBtn}>
          Newest
          <Filter size={16} />
        </button>
      </div>

      {/* Timeline */}
      <div className={styles.timeline}>
        {journals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No entries found. Create your first entry!
          </div>
        ) : journals.map((entry) => {
          const { date, time } = formatDateStr(entry.date);
          const emoji = getEmojiForSentiment(entry.sentiment);
          const dotColor = getColorForSentiment(entry.sentiment);
          
          let firstTag = '';
          if (entry.tags && entry.tags.length > 0) {
            firstTag = Array.isArray(entry.tags) ? entry.tags[0] : entry.tags.split(',')[0];
          }

          return (
            <div key={entry.id} className={styles.timelineItem}>
              
              {/* Left side (Date) */}
              <div className={styles.timelineDate}>
                <div className={styles.timelineDateDay}>{date}</div>
                <div className={styles.timelineDateTime}>{time}</div>
              </div>
              
              {/* Timeline dot */}
              <div className={styles.timelineDotWrapper}>
                <div className={`${styles.timelineDot} ${styles[dotColor]}`}></div>
              </div>
              
              {/* Right side (Content) */}
              <div className={styles.timelineContent}>
                <div className={styles.timelineEntryDetails}>
                  
                  <div className={styles.timelineHeader}>
                    <div className={styles.timelineHeaderLeft}>
                      <span className={styles.timelineEmoji}>{emoji}</span>
                      <h4 className={styles.timelineTitle}>{entry.title}</h4>
                    </div>
                    <div className={styles.timelineActions}>
                      <Bookmark size={16} style={{ cursor: 'pointer', marginRight: '8px' }} />
                      <MoreHorizontal size={16} style={{ cursor: 'pointer' }} />
                    </div>
                  </div>
                  
                  <p className={styles.timelineText}>{entry.content}</p>
                  
                  <div className={styles.timelineTags}>
                    <span className={`${styles.tagBadge} ${styles.mood}`}>
                      <span>{emoji}</span> {entry.sentiment || 'Neutral'}
                    </span>
                    {firstTag && firstTag.toLowerCase() !== 'favorite' && (
                      <span className={`${styles.tagBadge} ${styles.category}`}>
                        <Tag size={12} /> {firstTag.trim()}
                      </span>
                    )}
                  </div>

                </div>

                {/* Image thumbnail if exists */}
                {entry.image && (
                  <div className={styles.timelineImageWrapper}>
                    <img src={entry.image} alt="Thumbnail" className={styles.timelineImage} />
                    <div className={styles.imageCount}>
                      <ImageIcon size={10} /> 1
                    </div>
                  </div>
                )}
              </div>
              
            </div>
          );
        })}
      </div>
      
      {/* Edit FAB */}
      <button className={styles.fab} onClick={() => navigate('/new-entry')}>
        <PenTool size={24} />
      </button>

    </div>
  );
};

export default MyJournals;

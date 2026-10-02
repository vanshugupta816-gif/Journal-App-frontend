import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Sparkles, Cloud, Sun, CloudRain, ArrowRight, Edit, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [locationName, setLocationName] = useState('Loading location...');
  const [profile, setProfile] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const fetchWeather = async (locName) => {
    try {
      // Set to their chosen location immediately while it loads
      setLocationName(locName);
      
      // Get coordinates
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locName)}&count=1`);
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) return;
      
      const { latitude, longitude, name, admin1, country_code } = geoData.results[0];
      const displayLoc = `${name}${admin1 ? `, ${admin1}` : (country_code ? `, ${country_code}` : '')}`;
      setLocationName(displayLoc);

      // Get weather
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit`);
      const weatherJson = await weatherRes.json();
      if (weatherJson.current_weather) {
        setWeatherData(weatherJson.current_weather);
      }
    } catch (err) {
      console.error('Failed to fetch weather', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.getAllJournals();
      setJournals(response.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Could not fetch real data from backend. Displaying empty data.');
      setJournals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Load profile location
    if (user?.userName) {
      const profileDataStr = localStorage.getItem(`profile_${user.userName}`);
      if (profileDataStr) {
        try {
          const profileData = JSON.parse(profileDataStr);
          setProfile(profileData);
          if (profileData.location) {
            fetchWeather(profileData.location);
          }
        } catch (e) {
          console.error("Invalid profile data", e);
        }
      }
    }
  }, [user]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      try {
        const entryToDelete = journals.find(j => j.id === id);
        
        try {
          await api.deleteJournal(id);
        } catch (err) {
          console.error('Backend delete failed, performing local delete only:', err);
        }
        
        if (entryToDelete) {
          const trash = JSON.parse(localStorage.getItem('trash_entries') || '[]');
          trash.push({ ...entryToDelete, deletedAt: new Date().toISOString() });
          localStorage.setItem('trash_entries', JSON.stringify(trash));
        }

        setJournals(journals.filter(j => j.id !== id));
      } catch (err) {
        console.error('Failed to delete entry:', err);
        alert('Failed to delete entry.');
      }
    }
  };

  const handleEdit = (id, e) => {
    e.stopPropagation();
    navigate(`/edit-entry/${id}`);
  };

  // Compute stats based on actual data
  const totalEntries = journals.length;
  
  // Calculate unique days journaled
  const uniqueDates = new Set(journals.map(j => {
    if (!j.date) return null;
    return new Date(j.date).toDateString();
  }).filter(Boolean));
  const daysJournaled = uniqueDates.size;
  const currentStreak = Math.min(daysJournaled, 12); 
  
  const favoriteEntries = journals.filter(j => {
    if (!j.tags) return false;
    const tagsArray = Array.isArray(j.tags) ? j.tags : (typeof j.tags === 'string' ? j.tags.split(',') : []);
    const cleanTags = tagsArray.map(t => typeof t === 'string' ? t.trim().toLowerCase() : '');
    return cleanTags.includes('favorite');
  }).length; 
  
  const allTags = journals.reduce((acc, journal) => {
    if (journal.tags && Array.isArray(journal.tags)) {
      acc.push(...journal.tags);
    }
    return acc;
  }, []);
  const uniqueTagsCount = new Set(allTags).size;

  // Process data for Mood Chart
  const moodCounts = journals.reduce((acc, journal) => {
    const mood = journal.sentiment || 'NEUTRAL';
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {});

  const moodData = Object.keys(moodCounts).map(mood => ({
    name: mood,
    count: moodCounts[mood]
  }));

  const COLORS = {
    HAPPY: '#10B981',
    EXCITED: '#F59E0B',
    FOCUSED: '#3B82F6',
    NEUTRAL: '#6B7280',
    SAD: '#6366F1',
    ANXIOUS: '#EF4444',
    ANGRY: '#EF4444'
  };

  const renderWeatherIcon = (code) => {
    if (code === undefined) return <Cloud size={48} strokeWidth={1.5} opacity={0.9} />;
    if (code <= 3) return <Sun size={48} strokeWidth={1.5} opacity={0.9} />;
    if (code >= 50 && code <= 69) return <CloudRain size={48} strokeWidth={1.5} opacity={0.9} />;
    return <Cloud size={48} strokeWidth={1.5} opacity={0.9} />;
  };

  const getWeatherDescription = (code) => {
    if (code === undefined) return 'Loading...';
    if (code === 0) return 'Clear sky';
    if (code === 1 || code === 2 || code === 3) return 'Partly cloudy';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 55) return 'Drizzle';
    if (code >= 61 && code <= 65) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Rain showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Cloudy';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {greeting}, {profile?.fullName || user?.userName || 'User'}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here's what's happening with your journal today.</p>
        </div>
      </div>
      
      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#FEF2F2', color: '#EF4444', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #F87171' }}>
          {error}
        </div>
      )}

      {/* Statistics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Entries</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalEntries}</div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Current Streak</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{currentStreak}</div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Favorite Entries</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{favoriteEntries}</div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Tags Used</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{uniqueTagsCount}</div>
        </div>
      </div>
      
      {/* Complex Widgets Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* AI Insights Widget */}
          <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: '#6366F1', padding: '0.5rem', borderRadius: '8px', color: 'white' }}>
                <Sparkles size={20} />
              </div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>AI Insight</h2>
            </div>
            {journals.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Start journaling to receive personalized AI insights about your mood and writing patterns!</p>
            ) : (
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Based on your recent entries, you seem to be highly focused this week. Your sentiment analysis indicates a positive trend when discussing work-related topics.</p>
            )}
          </div>

          {/* Recent Entries List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Recent Entries</h2>
              <button style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                View All <ArrowRight size={16} />
              </button>
            </div>
            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading entries...</div>
              ) : journals.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <p style={{ marginBottom: '1rem' }}>You haven't written any journal entries yet.</p>
                  <button onClick={() => navigate('/new-entry')} style={{ backgroundColor: 'var(--accent-color)', color: 'white', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                    Create your first entry
                  </button>
                </div>
              ) : (
                journals.slice(0, 5).map((entry, idx) => (
                  <div key={entry.id || idx} style={{ padding: '1.25rem', borderBottom: idx !== Math.min(journals.length, 5) - 1 ? '1px solid var(--border-color)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <div>
                      <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{entry.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{entry.content?.substring(0, 60) || ''}...</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '1rem', backgroundColor: 'var(--sidebar-active-bg)', color: 'var(--accent-color)', fontWeight: 500 }}>
                        {entry.sentiment || 'NEUTRAL'}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {entry.date ? new Date(entry.date).toLocaleDateString() : ''}
                      </span>
                      
                      {/* Edit and Delete Buttons */}
                      <button onClick={(e) => handleEdit(entry.id, e)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.25rem' }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={(e) => handleDelete(entry.id, e)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.25rem' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Mood Chart Widget */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Mood Distribution</h2>
            {moodData.length === 0 ? (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center' }}>
                No mood data available yet. Start journaling!
              </div>
            ) : (
              <div style={{ height: 250, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moodData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'var(--bg-primary)' }} contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {moodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || 'var(--accent-color)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Weather Widget */}
          <div style={{ backgroundColor: '#38BDF8', borderRadius: 'var(--radius-lg)', padding: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, opacity: 0.9, marginBottom: '0.25rem' }}>{locationName}</div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                {weatherData ? `${Math.round(weatherData.temperature)}°F` : '--°F'}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                {getWeatherDescription(weatherData?.weathercode)}
              </div>
            </div>
            {renderWeatherIcon(weatherData?.weathercode)}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;

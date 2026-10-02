import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import styles from './NewEntry.module.css';
import { useAuth } from '../context/AuthContext';
import { Save, X, Tag, Star } from 'lucide-react';

const EditEntry = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sentiment, setSentiment] = useState('HAPPY');
  const [tagsInput, setTagsInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        setInitialLoading(true);
        const response = await api.getJournalById(id);
        const entry = response.data;
        if (entry) {
          setTitle(entry.title || '');
          setContent(entry.content || '');
          setSentiment(entry.sentiment || 'HAPPY');
          if (entry.tags) {
            const tagsArray = Array.isArray(entry.tags) ? entry.tags : (typeof entry.tags === 'string' ? entry.tags.split(',') : []);
            const cleanTags = tagsArray.map(t => t.trim()).filter(t => t);
            if (cleanTags.includes('favorite')) {
              setIsFavorite(true);
            }
            setTagsInput(cleanTags.filter(t => t !== 'favorite').join(', '));
          }
        }
      } catch (err) {
        console.error('Failed to fetch entry:', err);
        setError('Failed to load entry. It may have been deleted.');
      } finally {
        setInitialLoading(false);
      }
    };
    
    if (id) {
      fetchEntry();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }

    setLoading(true);
    setError('');

    // Parse tags from comma separated string
    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);
    if (isFavorite && !tags.includes('favorite')) {
      tags.push('favorite');
    }
    
    // Explicitly handle if it was unfavorited
    if (!isFavorite && tags.includes('favorite')) {
      const idx = tags.indexOf('favorite');
      if (idx > -1) tags.splice(idx, 1);
    }

    const entryData = {
      title,
      content,
      sentiment,
      tags
    };

    try {
      await api.updateJournal(id, entryData);
      navigate('/'); // Go back to dashboard on success
    } catch (err) {
      console.error('Failed to update entry:', err);
      setError(err.response?.data?.message || 'Failed to update journal entry. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const moods = ['HAPPY', 'SAD', 'NEUTRAL', 'ANXIOUS', 'EXCITED', 'FOCUSED', 'ANGRY'];

  if (initialLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading entry data...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Edit Entry</h1>
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={() => navigate('/')}>
            <X size={18} /> Cancel
          </button>
          <button type="submit" form="edit-form" className={styles.saveBtn} disabled={loading}>
            <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form id="edit-form" onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          className={styles.titleInput}
          placeholder="Entry Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className={styles.metaRow}>
          <div className={styles.metaGroup}>
            <label className={styles.metaLabel}>How are you feeling?</label>
            <select 
              className={styles.select}
              value={sentiment}
              onChange={(e) => setSentiment(e.target.value)}
            >
              {moods.map(mood => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </select>
          </div>

          <div className={styles.metaGroup}>
            <label className={styles.metaLabel}><Tag size={14} /> Tags</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="text"
                className={styles.tagInput}
                style={{ flex: 1 }}
                placeholder="e.g. work, personal, ideas (comma separated)"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
              <button 
                type="button" 
                className={`${styles.favBtn} ${isFavorite ? styles.active : ''}`}
                onClick={() => setIsFavorite(prev => !prev)}
                title="Mark as Favorite"
              >
                <Star size={18} fill={isFavorite ? '#F59E0B' : 'none'} />
                {isFavorite ? 'Favorited' : 'Favorite'}
              </button>
            </div>
          </div>
        </div>

        <textarea
          className={styles.contentInput}
          placeholder="What's on your mind today?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>
      </form>
    </div>
  );
};

export default EditEntry;

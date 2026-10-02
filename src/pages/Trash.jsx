import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  Search, 
  RotateCcw, 
  Calendar,
  Info,
  Clock,
  Leaf
} from 'lucide-react';
import styles from './Trash.module.css';
import { api } from '../services/api';

const Trash = () => {
  const [deletedEntries, setDeletedEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load from local storage on mount (simulating a backend fetch)
  useEffect(() => {
    const stored = localStorage.getItem('trash_entries');
    if (stored) {
      try {
        setDeletedEntries(JSON.parse(stored));
      } catch(e) {
        console.error("Failed to parse trash entries", e);
      }
    }
  }, []);

  const saveToLocal = (entries) => {
    localStorage.setItem('trash_entries', JSON.stringify(entries));
    setDeletedEntries(entries);
  };

  const handleRestore = async (entry) => {
    // In a real app, you would call api.restoreJournal(entry.id)
    // Here, we just remove it from local storage
    const newEntries = deletedEntries.filter(e => e.id !== entry.id);
    saveToLocal(newEntries);
    alert('Entry restored successfully!');
  };

  const handlePermanentDelete = (id) => {
    if (window.confirm("Are you sure you want to permanently delete this entry? This action cannot be undone.")) {
      const newEntries = deletedEntries.filter(e => e.id !== id);
      saveToLocal(newEntries);
    }
  };

  const handleEmptyTrash = () => {
    if (window.confirm("Are you sure you want to empty the trash? All entries will be permanently deleted.")) {
      saveToLocal([]);
    }
  };

  const filteredEntries = deletedEntries.filter(entry => 
    (entry.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entry.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.trashIconWrapper}>
            <Trash2 size={28} />
          </div>
          <div>
            <h1 className={styles.title}>Trash</h1>
            <p className={styles.subtitle}>Deleted journal entries are moved here. You can restore them or delete them permanently.</p>
          </div>
        </div>
        <button className={styles.emptyBtn} onClick={handleEmptyTrash} disabled={deletedEntries.length === 0}>
          <Trash2 size={16} /> Empty Trash
        </button>
      </div>

      <div className={styles.mainGrid}>
        {/* Main Content Area */}
        <div>
          {/* Filters Bar */}
          <div className={styles.filtersBar}>
            <div className={styles.searchWrapper}>
              <Search size={16} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search deleted entries..." 
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select className={styles.sortSelect}>
              <option>Deleted Date (Newest)</option>
              <option>Deleted Date (Oldest)</option>
            </select>
          </div>

          {/* List of deleted entries */}
          <div className={styles.entryList}>
            {filteredEntries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                <Trash2 size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <h3>No entries found</h3>
                <p>Deleted entries will appear here.</p>
              </div>
            ) : (
              filteredEntries.map(entry => {
                // Formatting date for UI
                const dateObj = new Date(entry.deletedAt || entry.date || Date.now());
                const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

                return (
                  <div key={entry.id} className={styles.entryCard}>
                    {entry.image && (
                      <img src={entry.image} alt={entry.title} className={styles.entryImage} />
                    )}
                    
                    <div className={styles.entryContent}>
                      <h3 className={styles.entryTitle}>{entry.title || 'Untitled'}</h3>
                      <p className={styles.entryExcerpt}>
                        {entry.content ? (entry.content.length > 80 ? entry.content.substring(0, 80) + '...' : entry.content) : 'No content...'}
                      </p>
                      
                      <div className={styles.entryTags}>
                        {entry.tags && (Array.isArray(entry.tags) ? entry.tags : entry.tags.split(',')).slice(0, 2).map((tag, idx) => (
                          <span key={idx} className={`${styles.tag} ${styles.motivation}`}>
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={styles.entryMeta}>
                      <div className={styles.metaHeader}>
                        <Calendar size={12} /> Deleted on
                      </div>
                      <div>{dateStr}</div>
                      <div>{timeStr}</div>
                    </div>

                    <div className={styles.actions}>
                      <button className={`${styles.actionBtn} ${styles.restoreBtn}`} onClick={() => handleRestore(entry)}>
                        <RotateCcw size={14} /> Restore
                      </button>
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handlePermanentDelete(entry.id)}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className={styles.footerNote}>
            <Leaf size={16} /> Letting go makes space for new memories.
          </div>
        </div>

        {/* Right Sidebar */}
        <div className={styles.sidebar}>
          <div className={`${styles.sidebarCard} ${styles.purpleBg}`}>
            <div className={styles.sidebarIconWrapper}>
              <Trash2 size={20} />
            </div>
            <h3 className={styles.sidebarTitle}>About Trash</h3>
            <p className={styles.sidebarDesc}>
              Deleted entries are kept in trash for 30 days before being permanently deleted.
            </p>
            
            <div className={styles.sidebarList}>
              <div className={styles.sidebarListItem}>
                <RotateCcw size={16} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                <span>Restore an entry to move it back to your journal.</span>
              </div>
              <div className={styles.sidebarListItem}>
                <Trash2 size={16} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                <span>Permanently delete entries you no longer need.</span>
              </div>
              <div className={styles.sidebarListItem}>
                <Info size={16} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                <span>Entries in trash are not visible in your journal.</span>
              </div>
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <div className={styles.autoDeleteCard}>
              <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '50%', display: 'flex', color: '#6366F1' }}>
                <Clock size={18} />
              </div>
              <div className={styles.autoDeleteContent}>
                <h4>Auto Delete</h4>
                <p>Entries will be permanently deleted after 30 days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trash;

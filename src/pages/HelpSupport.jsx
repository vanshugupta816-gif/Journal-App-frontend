import React, { useState } from 'react';
import { 
  Search, 
  Send, 
  BookOpen, 
  Settings, 
  FileText, 
  Shield, 
  Wrench,
  File,
  ChevronRight,
  Headphones,
  Mail,
  Clock,
  Users,
  MessageSquare,
  Heart
} from 'lucide-react';
import styles from './HelpSupport.module.css';

const HelpSupport = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const articles = [
    { id: 1, title: 'How do I create a new journal entry?', desc: 'Step-by-step guide to writing your first entry.' },
    { id: 2, title: 'How can I edit or delete an entry?', desc: 'Learn how to manage your journal entries.' },
    { id: 3, title: 'How does the trash feature work?', desc: 'Understand how deleted entries are stored and restored.' },
    { id: 4, title: 'Can I add tags to my entries?', desc: 'Organize your thoughts using tags.' },
    { id: 5, title: 'How do I enable dark mode?', desc: 'Switch between light and dark themes.' },
    { id: 6, title: 'Is my data safe and private?', desc: 'Learn about our privacy and security measures.' }
  ];

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    article.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContact = () => {
    alert('Contact Support form would open here!');
  };

  const handleAction = (actionName) => {
    alert(`${actionName} feature coming soon!`);
  };

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Help & Support</h1>
          <p className={styles.subtitle}>We're here to help you on your journaling journey.</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search for help articles..." 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className={styles.contactBtn} onClick={handleContact}>
            <Send size={16} /> Contact Us
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerContent}>
          <div className={styles.bannerLabel}>Need Help?</div>
          <h2 className={styles.bannerTitle}>
            Find answers, get support, and keep journaling.
          </h2>
          <p className={styles.bannerDesc}>
            Explore our help articles, guides or reach out to our support team.
          </p>
          
          <div className={styles.bannerSearchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search for help (e.g. delete entry, change password...)" 
              className={styles.searchInput}
              style={{ fontSize: '1rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.bannerIllustration}>
          <div style={{ fontSize: '8rem', opacity: 0.9 }}>
            👩‍💻
          </div>
          <div style={{ position: 'absolute', top: 20, right: 60, backgroundColor: 'white', padding: '10px 15px', borderRadius: '20px', fontSize: '1.2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transform: 'rotate(5deg)', fontStyle: 'italic', color: '#6366F1' }}>
            We're here for you <Heart size={14} fill="#6366F1" color="#6366F1" style={{ display: 'inline' }} />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className={styles.categoriesGrid}>
        <div className={styles.categoryCard} onClick={() => handleAction('Getting Started')}>
          <div className={`${styles.iconWrapper} ${styles.purple}`}>
            <BookOpen size={24} />
          </div>
          <h3 className={styles.categoryTitle}>Getting Started</h3>
          <p className={styles.categoryDesc}>Learn the basics</p>
        </div>

        <div className={styles.categoryCard} onClick={() => handleAction('Account & Settings')}>
          <div className={`${styles.iconWrapper} ${styles.green}`}>
            <Settings size={24} />
          </div>
          <h3 className={styles.categoryTitle}>Account & Settings</h3>
          <p className={styles.categoryDesc}>Manage your account</p>
        </div>

        <div className={styles.categoryCard} onClick={() => handleAction('Writing & Journaling')}>
          <div className={`${styles.iconWrapper} ${styles.yellow}`}>
            <FileText size={24} />
          </div>
          <h3 className={styles.categoryTitle}>Writing & Journaling</h3>
          <p className={styles.categoryDesc}>Tips and features</p>
        </div>

        <div className={styles.categoryCard} onClick={() => handleAction('Privacy & Security')}>
          <div className={`${styles.iconWrapper} ${styles.red}`}>
            <Shield size={24} />
          </div>
          <h3 className={styles.categoryTitle}>Privacy & Security</h3>
          <p className={styles.categoryDesc}>Your data is safe</p>
        </div>

        <div className={styles.categoryCard} onClick={() => handleAction('Troubleshooting')}>
          <div className={`${styles.iconWrapper} ${styles.blue}`}>
            <Wrench size={24} />
          </div>
          <h3 className={styles.categoryTitle}>Troubleshooting</h3>
          <p className={styles.categoryDesc}>Fix common issues</p>
        </div>
      </div>

      {/* Main Grid Split */}
      <div className={styles.mainGrid}>
        
        {/* Left Content - Popular Articles */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleWrapper}>
              <FileText size={20} color="var(--text-primary)" />
              <h2 className={styles.sectionTitle}>{searchQuery ? 'Search Results' : 'Popular Help Articles'}</h2>
            </div>
            {!searchQuery && (
              <a href="#" className={styles.viewAll} onClick={(e) => { e.preventDefault(); handleAction('View All Articles'); }}>
                View All <ChevronRight size={16} />
              </a>
            )}
          </div>

          <div className={styles.articleList}>
            {filteredArticles.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No articles found matching "{searchQuery}". Try different keywords.
              </div>
            ) : (
              filteredArticles.map(article => (
                <div key={article.id} className={styles.articleItem} onClick={() => handleAction(`Read article: ${article.title}`)}>
                  <File size={20} className={styles.articleIcon} />
                  <div className={styles.articleContent}>
                    <h4 className={styles.articleTitle}>{article.title}</h4>
                    <p className={styles.articleDesc}>{article.desc}</p>
                  </div>
                  <ChevronRight size={18} className={styles.chevron} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Content - Widgets */}
        <div className={styles.widgetsColumn}>
          
          <div className={styles.widgetCard}>
            <div className={styles.widgetHeader}>
              <div className={styles.widgetIcon}>
                <Headphones size={24} />
              </div>
              <div>
                <h3 className={styles.widgetTitle}>Still need help?</h3>
                <p className={styles.widgetDesc}>Our support team is here for you. Reach out and we'll get back to you as soon as possible.</p>
              </div>
            </div>
            
            <button className={`${styles.widgetBtn} ${styles.primary}`} onClick={handleContact}>
              <Send size={16} /> Contact Support
            </button>
            
            <div className={styles.contactInfoList}>
              <div className={styles.contactInfoItem}>
                <Mail size={16} /> support@journalapp.com
              </div>
              <div className={styles.contactInfoItem}>
                <Clock size={16} /> We typically respond within 24 hours.
              </div>
            </div>
          </div>

          <div className={styles.widgetCard}>
            <div className={styles.widgetHeader}>
              <div className={styles.widgetIcon} style={{ color: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                <Users size={24} />
              </div>
              <div>
                <h3 className={styles.widgetTitle}>Community Support</h3>
                <p className={styles.widgetDesc}>Join our community to ask questions, share tips, and connect with other journalers.</p>
              </div>
            </div>
            <button className={styles.widgetBtn} style={{ marginTop: '1rem' }} onClick={() => handleAction('Join Community')}>
              Join Community
            </button>
          </div>

          <div className={styles.widgetCard}>
            <div className={styles.widgetHeader}>
              <div className={styles.widgetIcon} style={{ color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className={styles.widgetTitle}>Give Feedback</h3>
                <p className={styles.widgetDesc}>Help us improve! Share your suggestions or report an issue.</p>
              </div>
            </div>
            <button className={styles.widgetBtn} style={{ marginTop: '1rem' }} onClick={() => handleAction('Send Feedback')}>
              Send Feedback
            </button>
          </div>

        </div>

      </div>

      {/* Footer Note */}
      <div className={styles.footerArea}>
        <div className={styles.footerHeart}>
          Your words matter <Heart size={16} fill="#8B5CF6" color="#8B5CF6" />
        </div>
        <div className={styles.footerLinks}>
          <a href="#" className={styles.footerLink} onClick={(e) => e.preventDefault()}>Terms of Service</a>
          <span style={{ color: 'var(--border-color)' }}>|</span>
          <a href="#" className={styles.footerLink} onClick={(e) => e.preventDefault()}>Privacy Policy</a>
          <span style={{ color: 'var(--border-color)' }}>|</span>
          <a href="#" className={styles.footerLink} onClick={(e) => { e.preventDefault(); handleContact(); }}>Contact Us</a>
        </div>
      </div>

    </div>
  );
};

export default HelpSupport;

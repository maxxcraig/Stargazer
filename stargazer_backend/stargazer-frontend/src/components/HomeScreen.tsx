import React from 'react';

interface HomeScreenProps {
  username: string;
  onNavigateToStargazer: () => void;
  onNavigateToAbout: () => void;
  onNavigateToNASA: () => void;
  onLogout: () => void;
  githubUrl?: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  username, 
  onNavigateToStargazer, 
  onNavigateToAbout, 
  onNavigateToNASA,
  onLogout,
  githubUrl = "https://github.com/maxxcraig/Stargazer" // Default URL, can be overridden
}) => {
  return (
    <div style={styles.container}>
      {/* Background gradient */}
      <div style={styles.backgroundGradient} />
      
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>
          <span style={styles.titleText}>✨ Max's Skyview ✨</span>
          <p style={styles.subtitle}>Your personal AR stargazing companion</p>
        </div>
        
        <button onClick={onLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      {/* Welcome Section */}
      <div style={styles.welcomeSection}>
        <h2 style={styles.welcomeTitle}>Welcome back, {username}!</h2>
        <p style={styles.welcomeText}>
          Your personal window to the universe awaits. Discover stars, planets, and constellations
          in real-time through your device's camera.
        </p>
      </div>

      {/* Navigation Cards */}
      <div style={styles.cardContainer}>
        {/* Stargazer Card */}
        <div 
          style={styles.card} 
          onClick={onNavigateToStargazer}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 20px 50px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.2)';
          }}
        >
          <div style={styles.cardIcon}></div>
          <h3 style={styles.cardTitle}>Start Stargazing</h3>
          <p style={styles.cardDescription}>
            Launch the AR stargazer to explore stars, planets, and constellations 
            in real-time using your device's camera.
          </p>
          <div style={styles.cardFeatures}>
            <span style={styles.feature}>• 17 bright stars</span>
            <span style={styles.feature}>• All 9 planets + sun</span>
            <span style={styles.feature}>• 4 constellations</span>
            <span style={styles.feature}>• Real-time positioning</span>
          </div>
        </div>

        {/* NASA Data Card */}
        <div 
          style={styles.card} 
          onClick={onNavigateToNASA}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 20px 50px rgba(255, 165, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 165, 0, 0.2)';
          }}
        >
          <div style={styles.cardIcon}></div>
          <h3 style={styles.cardTitle}>NASA Space Data</h3>
          <p style={styles.cardDescription}>
            Explore real-time NASA data including near Earth objects, 
            astronomy pictures, and space facts updated daily.
          </p>
          <div style={styles.cardFeatures}>
            <span style={styles.feature}>• Near Earth objects today</span>
            <span style={styles.feature}>• Astronomy picture of the day</span>
            <span style={styles.feature}>• Real NASA data</span>
            <span style={styles.feature}>• Updated daily</span>
          </div>
        </div>

        {/* About Card */}
        <div 
          style={styles.card} 
          onClick={onNavigateToAbout}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 20px 50px rgba(118, 75, 162, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(118, 75, 162, 0.2)';
          }}
        >
          <div style={styles.cardIcon}></div>
          <h3 style={styles.cardTitle}>About My Project</h3>
          <p style={styles.cardDescription}>
            Learn about how I built this AR stargazing app, the technologies I used,
            and the astronomical data behind my experience.
          </p>
          <div style={styles.cardFeatures}>
            <span style={styles.feature}>• Technical overview</span>
            <span style={styles.feature}>• Astronomical data</span>
            <span style={styles.feature}>• My development story</span>
            <span style={styles.feature}>• Open source</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerContent}>
          <p style={styles.footerText}>
            Built with React, Three.js, and astronomical precision
          </p>
          {githubUrl && (
            <a 
              href={githubUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.githubLink}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.textShadow = '0 0 10px rgba(102, 126, 234, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#b8c5ff';
                e.currentTarget.style.textShadow = 'none';
              }}
            >
              <span style={styles.githubIcon}></span>
              View source code
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative' as const,
    width: '100%',
    minHeight: '100vh',
    overflow: 'visible',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    paddingBottom: '20px',
  },
  backgroundGradient: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #0c0c1e 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0c0c1e 100%)',
    zIndex: -1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px',
    position: 'relative' as const,
    zIndex: 10,
  },
  title: {
    textAlign: 'center' as const,
    flex: 1,
  },
  titleText: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: '48px',
    fontWeight: 'bold',
    textShadow: '0 0 30px rgba(102, 126, 234, 0.6)',
    letterSpacing: '2px',
    display: 'block',
  },
  subtitle: {
    color: '#b8c5ff',
    fontSize: '18px',
    fontWeight: '300',
    marginTop: '10px',
    marginBottom: '0',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
  },
  logoutButton: {
    background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 107, 107, 0.4) 100%)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 107, 107, 0.4)',
    borderRadius: '12px',
    padding: '12px 20px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(255, 107, 107, 0.2)',
    transition: 'all 0.3s ease',
  },
  welcomeSection: {
    textAlign: 'center' as const,
    padding: '40px 20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  welcomeText: {
    fontSize: '18px',
    lineHeight: '1.6',
    color: '#d4a4ff',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
  },
  cardContainer: {
    display: 'flex',
    gap: '30px',
    padding: '0 20px 40px',
    maxWidth: '1000px',
    margin: '0 auto',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  },
  card: {
    flex: '1 1 400px',
    maxWidth: '450px',
    minHeight: '350px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '20px',
    padding: '30px',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.2)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
  },
  cardIcon: {
    fontSize: '60px',
    marginBottom: '20px',
    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#ffffff',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
  },
  cardDescription: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#b8c5ff',
    marginBottom: '20px',
    textShadow: '0 1px 5px rgba(0, 0, 0, 0.3)',
  },
  cardFeatures: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    alignItems: 'flex-start',
    width: '100%',
    marginTop: 'auto',
  },
  feature: {
    fontSize: '14px',
    color: '#d4a4ff',
    fontWeight: '500',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
  },
  footer: {
    padding: '40px 20px 20px',
    textAlign: 'center' as const,
    borderTop: '1px solid rgba(102, 126, 234, 0.2)',
    marginTop: 'auto',
  },
  footerContent: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  footerText: {
    color: '#b8c5ff',
    fontSize: '14px',
    marginBottom: '15px',
    textShadow: '0 1px 5px rgba(0, 0, 0, 0.3)',
  },
  githubLink: {
    color: '#b8c5ff',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  githubIcon: {
    fontSize: '18px',
  },
};
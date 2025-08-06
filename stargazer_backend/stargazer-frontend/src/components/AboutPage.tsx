import React from 'react';

interface AboutPageProps {
  onNavigateHome: () => void;
  onLogout: () => void;
  githubUrl?: string;
}

export const AboutPage: React.FC<AboutPageProps> = ({ 
  onNavigateHome, 
  onLogout,
  githubUrl = "https://github.com/maxcraig/stargazer" 
}) => {
  return (
    <div style={styles.container}>
      {/* Background gradient */}
      <div style={styles.backgroundGradient} />
      
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onNavigateHome} style={styles.backButton}>
          ← Back to Home
        </button>
        
        <div style={styles.title}>
          <span style={styles.titleText}>✨ About Max's Skyview ✨</span>
        </div>
        
        <button onClick={onLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        
        {/* Project Overview */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>What is Max's Skyview?</h2>
          <div style={styles.card}>
            <p style={styles.text}>
              Max's Skyview is my web-based augmented reality stargazing application that brings the wonders 
              of the cosmos directly to your device. By combining your camera feed with real-time astronomical 
              data, I created an immersive experience similar to popular apps like SkyView Lite.
            </p>
            <p style={styles.text}>
              Point your device at the night sky and discover stars, planets, and constellations with 
              accurate positioning, detailed information, and beautiful visualizations.
            </p>
          </div>
        </section>

        {/* Features */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Key Features</h2>
          <div style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}></div>
              <h3 style={styles.featureTitle}>Real Stars</h3>
              <p style={styles.featureText}>
                17 bright stars from the NASA Hipparcos catalog with accurate coordinates,
                magnitudes, and spectral classifications.
              </p>
            </div>
            
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}></div>
              <h3 style={styles.featureTitle}>Solar System</h3>
              <p style={styles.featureText}>
                All 9 planets plus the Sun with real-time positioning using accurate 
                orbital mechanics and Kepler's laws.
              </p>
            </div>
            
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}></div>
              <h3 style={styles.featureTitle}>Constellations</h3>
              <p style={styles.featureText}>
                4 major constellations with connecting lines: Orion, Summer Triangle, 
                Taurus, and Canis Major.
              </p>
            </div>
            
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}></div>
              <h3 style={styles.featureTitle}>AR Experience</h3>
              <p style={styles.featureText}>
                Live camera feed background with transparent 3D overlays, creating 
                an authentic augmented reality experience.
              </p>
            </div>
            
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}></div>
              <h3 style={styles.featureTitle}>Interactive</h3>
              <p style={styles.featureText}>
                Click on stars and planets for detailed information including physical 
                properties, orbital data, and astronomical details.
              </p>
            </div>
            
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}></div>
              <h3 style={styles.featureTitle}>Accurate Positioning</h3>
              <p style={styles.featureText}>
                Real celestial coordinate calculations with proper coordinate system 
                transformations and time-based positioning.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Details */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>How I Built It</h2>
          <div style={styles.card}>
            <div style={styles.techStack}>
              <div style={styles.techCategory}>
                <h4 style={styles.techTitle}>Frontend Technologies</h4>
                <ul style={styles.techList}>
                  <li><strong>React + TypeScript</strong> - Modern component-based architecture</li>
                  <li><strong>Three.js</strong> - WebGL 3D graphics and rendering</li>
                  <li><strong>WebRTC getUserMedia</strong> - Real-time camera access</li>
                  <li><strong>Canvas API</strong> - Dynamic text rendering for labels</li>
                </ul>
              </div>
              
              <div style={styles.techCategory}>
                <h4 style={styles.techTitle}>Astronomical Computing</h4>
                <ul style={styles.techList}>
                  <li><strong>Kepler's Laws</strong> - Planetary orbital mechanics</li>
                  <li><strong>J2000.0 Epoch</strong> - Standard astronomical coordinate system</li>
                  <li><strong>Coordinate Transformations</strong> - Ecliptic to equatorial conversions</li>
                  <li><strong>NASA Hipparcos Catalog</strong> - Precise stellar data</li>
                </ul>
              </div>
              
              <div style={styles.techCategory}>
                <h4 style={styles.techTitle}>Rendering & Interaction</h4>
                <ul style={styles.techList}>
                  <li><strong>Raycasting</strong> - Precise click detection on 3D objects</li>
                  <li><strong>Sprite-based Labels</strong> - High-quality text overlays</li>
                  <li><strong>Mouse Controls</strong> - Full 360° camera movement</li>
                  <li><strong>Transparent Rendering</strong> - Seamless AR overlay effects</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Data Sources */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Astronomical Data</h2>
          <div style={styles.card}>
            <div style={styles.dataGrid}>
              <div style={styles.dataItem}>
                <h4 style={styles.dataTitle}>Star Data</h4>
                <p style={styles.dataText}>
                  17 bright stars from the NASA Hipparcos catalog including Sirius, Vega, 
                  Betelgeuse, and other magnitude &lt; 2.0 stars with precise RA/Dec coordinates.
                </p>
              </div>
              
              <div style={styles.dataItem}>
                <h4 style={styles.dataTitle}>Planetary Elements</h4>
                <p style={styles.dataText}>
                  J2000.0 epoch orbital elements for all planets including semi-major axis, 
                  eccentricity, inclination, and daily motion rates.
                </p>
              </div>
              
              <div style={styles.dataItem}>
                <h4 style={styles.dataTitle}>Constellation Lines</h4>
                <p style={styles.dataText}>
                  Traditional constellation patterns including Orion's Belt, Summer Triangle, 
                  and other recognizable star groupings.
                </p>
              </div>
              
              <div style={styles.dataItem}>
                <h4 style={styles.dataTitle}>Real-time Updates</h4>
                <p style={styles.dataText}>
                  Planetary positions calculated in real-time based on current date and time 
                  using proper orbital mechanics and coordinate transformations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Development Story */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>My Development Journey</h2>
          <div style={styles.card}>
            <p style={styles.text}>
              I started this project as an exploration into combining web technologies with astronomical 
              computing. My goal was to create a SkyView Lite-style experience that runs entirely 
              in the browser without requiring app store downloads.
            </p>
            <p style={styles.text}>
              The biggest challenges I faced were implementing accurate astronomical calculations in JavaScript, 
              creating smooth AR overlays with Three.js, and ensuring the coordinate system 
              transformations matched real-world sky positions.
            </p>
            <p style={styles.text}>
              Every star and planet position is calculated using real astronomical formulas - from 
              solving Kepler's equation for planetary positions to converting between different 
              coordinate systems. The result is my web app that shows celestial objects in their 
              actual positions in the sky.
            </p>
          </div>
        </section>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.footerCard}>
            <h3 style={styles.footerTitle}>Open Source & Contributions</h3>
            <p style={styles.footerText}>
              My project is open source and available for exploration, learning, and contributions.
              Check out my code to see how astronomical calculations and AR rendering work together.
            </p>
            <div style={styles.footerLinks}>
              {githubUrl && (
                <a 
                  href={githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.githubLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  <span style={styles.githubIcon}></span>
                  View my source code on GitHub
                </a>
              )}
              
              <button 
                onClick={onNavigateHome}
                style={styles.homeButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(118, 75, 162, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(118, 75, 162, 0.3)';
                }}
              >
                <span>🏠</span>
                Back to Home
              </button>
            </div>
          </div>
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
    alignItems: 'center',
    padding: '20px',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    background: 'rgba(12, 12, 30, 0.9)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(102, 126, 234, 0.3)',
  },
  backButton: {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(102, 126, 234, 0.4) 100%)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(102, 126, 234, 0.4)',
    borderRadius: '12px',
    padding: '10px 16px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)',
    transition: 'all 0.3s ease',
  },
  title: {
    flex: 1,
    textAlign: 'center' as const,
  },
  titleText: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: '32px',
    fontWeight: 'bold',
    textShadow: '0 0 20px rgba(102, 126, 234, 0.5)',
    letterSpacing: '1px',
  },
  logoutButton: {
    background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 107, 107, 0.4) 100%)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 107, 107, 0.4)',
    borderRadius: '12px',
    padding: '10px 16px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(255, 107, 107, 0.2)',
    transition: 'all 0.3s ease',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  section: {
    marginBottom: '60px',
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '25px',
    textAlign: 'center' as const,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: '0 2px 10px rgba(102, 126, 234, 0.3)',
  },
  card: {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '15px',
    padding: '30px',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.2)',
  },
  text: {
    fontSize: '16px',
    lineHeight: '1.7',
    color: '#d4a4ff',
    marginBottom: '15px',
    textShadow: '0 1px 5px rgba(0, 0, 0, 0.3)',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '25px',
  },
  featureCard: {
    background: 'linear-gradient(135deg, rgba(118, 75, 162, 0.15) 0%, rgba(102, 126, 234, 0.15) 100%)',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(118, 75, 162, 0.3)',
    borderRadius: '12px',
    padding: '25px',
    textAlign: 'center' as const,
    transition: 'all 0.3s ease',
    cursor: 'default',
  },
  featureIcon: {
    fontSize: '40px',
    marginBottom: '15px',
    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#ffffff',
  },
  featureText: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#b8c5ff',
  },
  techStack: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
  },
  techCategory: {
    marginBottom: '20px',
  },
  techTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#ffffff',
    borderBottom: '2px solid rgba(102, 126, 234, 0.3)',
    paddingBottom: '8px',
  },
  techList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  dataGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '25px',
  },
  dataItem: {
    padding: '20px',
    background: 'rgba(118, 75, 162, 0.1)',
    borderRadius: '10px',
    border: '1px solid rgba(118, 75, 162, 0.2)',
  },
  dataTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#ffffff',
  },
  dataText: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#d4a4ff',
  },
  footer: {
    marginTop: '60px',
    paddingTop: '40px',
    borderTop: '1px solid rgba(102, 126, 234, 0.3)',
  },
  footerCard: {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(102, 126, 234, 0.4)',
    borderRadius: '15px',
    padding: '40px',
    textAlign: 'center' as const,
  },
  footerTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#ffffff',
  },
  footerText: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#d4a4ff',
    marginBottom: '30px',
  },
  footerLinks: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  githubLink: {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(102, 126, 234, 0.4) 100%)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(102, 126, 234, 0.4)',
    borderRadius: '12px',
    padding: '15px 25px',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    transition: 'all 0.3s ease',
  },
  githubIcon: {
    fontSize: '18px',
  },
  homeButton: {
    background: 'linear-gradient(135deg, rgba(118, 75, 162, 0.2) 0%, rgba(118, 75, 162, 0.4) 100%)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(118, 75, 162, 0.4)',
    borderRadius: '12px',
    padding: '15px 25px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(118, 75, 162, 0.3)',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
  },
};
import React, { useState, useEffect } from 'react';
import { ARStargazer } from './components/ARStargazer';
import { AuthScreen } from './components/AuthScreen';
import { HomeScreen } from './components/HomeScreen';
import { AboutPage } from './components/AboutPage';
import { NASADataPage } from './components/NASADataPage';
import { Star, Planet } from './services/StarCatalogService';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

function AppContent() {
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Initialize currentPage - but only restore if user is authenticated
  const initializePage = (): 'home' | 'stargazer' | 'about' | 'nasa' => {
    // Always start with 'home' during initial load - user auth state isn't known yet
    // We'll restore the saved page after authentication check
    return 'home';
  };

  const [currentPage, setCurrentPage] = useState<'home' | 'stargazer' | 'about' | 'nasa'>(initializePage);
  const [stargazerKey, setStargazerKey] = useState(0);
  
  const { user, loading, signOut } = useAuth();

  // Restore saved page after user authentication is confirmed
  useEffect(() => {
    if (!loading && user) {
      // Only restore saved page for authenticated users
      const hash = window.location.hash.slice(1) as 'home' | 'stargazer' | 'about' | 'nasa';
      if (['home', 'stargazer', 'about', 'nasa'].includes(hash)) {
        setCurrentPage(hash);
        return;
      }
      
      const saved = localStorage.getItem('stargazer-current-page') as 'home' | 'stargazer' | 'about' | 'nasa';
      if (['home', 'stargazer', 'about', 'nasa'].includes(saved)) {
        setCurrentPage(saved);
      }
    }
  }, [loading, user]);

  // Add/remove stargazer-mode class based on current page and persist state
  useEffect(() => {
    if (currentPage === 'stargazer') {
      document.body.classList.add('stargazer-mode');
    } else {
      document.body.classList.remove('stargazer-mode');
    }
    
    // Persist current page to localStorage and URL
    localStorage.setItem('stargazer-current-page', currentPage);
    window.history.replaceState({}, '', currentPage === 'home' ? '/' : `/#${currentPage}`);
    
    return () => {
      document.body.classList.remove('stargazer-mode');
    };
  }, [currentPage]);

  const handleStarClick = (star: Star) => {
    setSelectedStar(star);
    setSelectedPlanet(null); // Clear planet selection
  };

  const handlePlanetClick = (planet: Planet) => {
    setSelectedPlanet(planet);
    setSelectedStar(null); // Clear star selection
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const navigateToHome = () => {
    setCurrentPage('home');
    setSelectedStar(null);
    setSelectedPlanet(null);
  };

  const navigateToStargazer = () => {
    setCurrentPage('stargazer');
    setSelectedStar(null);
    setSelectedPlanet(null);
  };

  const navigateToAbout = () => {
    setCurrentPage('about');
    setSelectedStar(null);
    setSelectedPlanet(null);
  };

  const navigateToNASA = () => {
    setCurrentPage('nasa');
    setSelectedStar(null);
    setSelectedPlanet(null);
  };

  const handleLogout = async () => {
    await signOut();
    setSelectedStar(null);
    setSelectedPlanet(null);
    setCurrentPage('home');
  };

  const closeCelestialInfo = () => {
    // Clear the selected objects
    setSelectedStar(null);
    setSelectedPlanet(null);
    
    // Force ARStargazer to remount by changing its key
    if (currentPage === 'stargazer') {
      setStargazerKey(prev => prev + 1);
    }
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0c0c1e 0%, #1a1a2e 50%, #16213e 100%)',
        color: '#ffffff',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!user) {
    return <AuthScreen />;
  }

  const username = user?.email?.split('@')[0] || 'TestUser';

  // Render different pages based on current page state
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomeScreen
            username={username}
            onNavigateToStargazer={navigateToStargazer}
            onNavigateToAbout={navigateToAbout}
            onNavigateToNASA={navigateToNASA}
            onLogout={handleLogout}
            githubUrl="https://github.com/maxxcraig/Stargazer"
          />
        );
      
      case 'about':
        return (
          <AboutPage
            onNavigateHome={navigateToHome}
            onLogout={handleLogout}
            githubUrl="https://github.com/maxxcraig/Stargazer"
          />
        );
      
      case 'nasa':
        return (
          <NASADataPage
            onNavigateHome={navigateToHome}
            onLogout={handleLogout}
          />
        );
      
      case 'stargazer':
        return (
          <div className="App">
            {/* Title */}
            <div style={{ 
              position: 'absolute', 
              top: '10px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              zIndex: 10,
              background: 'linear-gradient(135deg, rgba(118, 75, 162, 0.2) 0%, rgba(102, 126, 234, 0.2) 100%)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(118, 75, 162, 0.4)',
              borderRadius: '15px',
              padding: '12px 24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '32px',
                fontWeight: 'bold',
                textShadow: '0 0 20px rgba(102, 126, 234, 0.5)',
                fontFamily: 'Arial, sans-serif',
                letterSpacing: '1px'
              }}>
                Max's Skyview
              </span>
            </div>

            {/* Back to Home Button */}
            <button
              onClick={navigateToHome}
              style={{
                position: 'absolute',
                top: '10px',
                left: '20px',
                zIndex: 10,
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.2)';
              }}
            >
              ← Home
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                position: 'absolute',
                top: '10px',
                right: '20px',
                zIndex: 10,
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.2)';
              }}
            >
              Logout
            </button>
            
            {/* Always render ARStargazer - don't let modal affect it */}
            <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
              <ARStargazer 
                key={stargazerKey}
                onStarClick={handleStarClick} 
                onPlanetClick={handlePlanetClick} 
                onError={handleError} 
              />
            </div>
            
            {/* Celestial Object Information Modal - render on top but don't interfere */}
            {(selectedStar || selectedPlanet) && (
              <div className="star-info-modal" onClick={closeCelestialInfo}>
                <div className="star-info-content" onClick={(e) => e.stopPropagation()}>
                  <button className="close-button" onClick={closeCelestialInfo}>×</button>
                  
                  {selectedStar && (
                    <>
                      <h2>{selectedStar.commonName || selectedStar.name}</h2>
                      <div className="star-details">
                        <p><strong>Type:</strong> Star</p>
                        <p><strong>Magnitude:</strong> {selectedStar.magnitude}</p>
                        <p><strong>Spectral Class:</strong> {selectedStar.spectralClass || 'Unknown'}</p>
                        <p><strong>Constellation:</strong> {selectedStar.constellation || 'Unknown'}</p>
                        <p><strong>Coordinates:</strong> RA {selectedStar.ra.toFixed(2)}°, Dec {selectedStar.dec.toFixed(2)}°</p>
                      </div>
                    </>
                  )}
                  
                  {selectedPlanet && (
                    <>
                      <h2>{selectedPlanet.commonName}</h2>
                      <div className="star-details">
                        <p><strong>Type:</strong> {selectedPlanet.type === 'sun' ? 'Star (Sun)' : 'Planet'}</p>
                        <p><strong>Mass:</strong> {selectedPlanet.physicalData.mass} Earth masses</p>
                        <p><strong>Diameter:</strong> {selectedPlanet.physicalData.diameter} Earth diameters</p>
                        <p><strong>Distance from Sun:</strong> {selectedPlanet.physicalData.distanceFromSun} AU</p>
                        <p><strong>Orbital Period:</strong> {selectedPlanet.physicalData.orbitalPeriod} Earth days</p>
                        <p><strong>Rotation Period:</strong> {Math.abs(selectedPlanet.physicalData.rotationPeriod)} Earth days{selectedPlanet.physicalData.rotationPeriod < 0 ? ' (retrograde)' : ''}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Error Toast */}
            {error && (
              <div className="error-toast">
                <p>{error}</p>
                <button onClick={() => setError(null)}>×</button>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div>
      {renderCurrentPage()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

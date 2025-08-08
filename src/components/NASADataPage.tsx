import React, { useState, useEffect } from 'react';

interface NASADataPageProps {
  onNavigateHome: () => void;
  onLogout: () => void;
}

interface NearEarthObject {
  id: string;
  name: string;
  estimated_diameter: {
    meters: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    }
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: Array<{
    close_approach_date: string;
    relative_velocity: {
      kilometers_per_hour: string;
    };
    miss_distance: {
      kilometers: string;
    };
  }>;
}

interface APODData {
  title: string;
  explanation: string;
  url: string;
  date: string;
  media_type: string;
}

export const NASADataPage: React.FC<NASADataPageProps> = ({ 
  onNavigateHome, 
  onLogout 
}) => {
  const [nearEarthObjects, setNearEarthObjects] = useState<NearEarthObject[]>([]);
  const [apodData, setApodData] = useState<APODData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const NASA_API_KEY = process.env.REACT_APP_NASA_API_KEY || 'DEMO_KEY';

  useEffect(() => {
    fetchNASAData();
  }, []);

  const fetchNASAData = async () => {
    setLoading(true);
    setError(null);
    
    // Check if we recently fetched data to avoid rate limiting
    const lastFetch = localStorage.getItem('nasaLastFetch');
    const now = Date.now();
    if (lastFetch && (now - parseInt(lastFetch)) < 60000) { // 1 minute cache
      console.log('Using cached data to avoid rate limiting');
      const cachedNEO = localStorage.getItem('nasaCachedNEO');
      const cachedAPOD = localStorage.getItem('nasaCachedAPOD');
      
      if (cachedNEO && cachedAPOD) {
        try {
          setNearEarthObjects(JSON.parse(cachedNEO));
          setApodData(JSON.parse(cachedAPOD));
          setLoading(false);
          return;
        } catch (e) {
          console.log('Cache parsing failed, will fetch fresh data');
        }
      }
    }

    try {
      console.log('Starting NASA data fetch...');
      console.log('NASA API Key:', NASA_API_KEY ? `${NASA_API_KEY.substring(0, 10)}...` : 'MISSING');
      
      // Get today's date for Near Earth Objects
      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching data for date:', today);
      
      const neoUrl = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`;
      const apodUrl = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;
      
      console.log('NEO URL:', neoUrl);
      console.log('APOD URL:', apodUrl);
      
      // Fetch with retry logic and rate limit handling
      console.log('Starting sequential fetch to avoid rate limits...');
      
      // Fetch APOD first (usually more reliable)
      console.log('Fetching APOD...');
      const apodResponse = await fetch(apodUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (apodResponse.status === 429) {
        console.warn('Rate limited on APOD, using fallback data');
        // Use fallback APOD data
        setApodData({
          title: "Rate Limit Reached",
          explanation: "NASA API rate limit reached. Please try again in a few minutes. The NASA APIs have usage limits to ensure fair access for all users.",
          url: "https://apod.nasa.gov/apod/image/2508/Ngc6072_webb_960.jpg",
          date: today,
          media_type: "image"
        });
      } else if (!apodResponse.ok) {
        const apodError = await apodResponse.text();
        console.error('APOD API Error:', apodResponse.status, apodError);
        throw new Error(`APOD API failed: ${apodResponse.status} - ${apodError}`);
      } else {
        const apodData = await apodResponse.json();
        setApodData(apodData);
        localStorage.setItem('nasaCachedAPOD', JSON.stringify(apodData));
        console.log('APOD data loaded successfully');
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fetch NEO data
      console.log('Fetching Near Earth Objects...');
      const neoResponse = await fetch(neoUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (neoResponse.status === 429) {
        console.warn('Rate limited on NEO, using fallback data');
        // Use fallback NEO data
        setNearEarthObjects([
          {
            id: "fallback",
            name: "Rate Limit Reached",
            estimated_diameter: {
              meters: {
                estimated_diameter_min: 0,
                estimated_diameter_max: 0
              }
            },
            is_potentially_hazardous_asteroid: false,
            close_approach_data: [{
              close_approach_date: today,
              relative_velocity: {
                kilometers_per_hour: "0"
              },
              miss_distance: {
                kilometers: "0"
              }
            }]
          }
        ]);
      } else if (!neoResponse.ok) {
        const neoError = await neoResponse.text();
        console.error('NEO API Error:', neoResponse.status, neoError);
        throw new Error(`NEO API failed: ${neoResponse.status} - ${neoError}`);
      } else {
        const neoData = await neoResponse.json();
        const todaysObjects = neoData.near_earth_objects[today] || [];
        console.log(`Found ${todaysObjects.length} Near Earth Objects for ${today}`);
        
        const limitedObjects = todaysObjects.slice(0, 10);
        setNearEarthObjects(limitedObjects);
        localStorage.setItem('nasaCachedNEO', JSON.stringify(limitedObjects));
        console.log('NEO data loaded successfully');
      }

      // Store last fetch time
      localStorage.setItem('nasaLastFetch', now.toString());
      console.log('Successfully updated state with NASA data');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Complete NASA API Error Details:', {
        error: err,
        message: errorMessage,
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
      
      // If we hit rate limits, show helpful message
      if (errorMessage.includes('429') || errorMessage.includes('OVER_RATE_LIMIT')) {
        setError('NASA API rate limit reached. Please wait a few minutes before refreshing. The NASA APIs have usage limits to ensure fair access for all users.');
      } else {
        setError(`Failed to load NASA data: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

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
          <span style={styles.titleText}>NASA Space Data</span>
        </div>
        
        <button onClick={onLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        
        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingText}>Loading NASA data...</div>
          </div>
        )}

        {error && (
          <div style={styles.errorContainer}>
            <div style={styles.errorText}>{error}</div>
            <button onClick={fetchNASAData} style={styles.retryButton}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Astronomy Picture of the Day */}
            {apodData && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Astronomy Picture of the Day</h2>
                <div style={styles.apodCard}>
                  <div style={styles.apodImageContainer}>
                    {apodData.media_type === 'image' ? (
                      <img 
                        src={apodData.url} 
                        alt={apodData.title}
                        style={styles.apodImage}
                        onError={(e) => {
                          console.log('APOD image failed to load:', apodData.url);
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const parent = img.parentElement;
                          if (parent && !parent.querySelector('.image-error')) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'image-error';
                            errorDiv.innerHTML = `<p style="margin-bottom: 15px;">Image could not be loaded from NASA servers</p><a href="${apodData.url}" target="_blank" rel="noopener noreferrer" style="color: #667eea; text-decoration: none; font-weight: 600; padding: 10px 20px; background: rgba(102, 126, 234, 0.2); border-radius: 8px; border: 1px solid rgba(102, 126, 234, 0.4);">View Image at NASA ↗</a>`;
                            errorDiv.style.cssText = 'padding: 40px; text-align: center; background: rgba(255, 255, 255, 0.05); border-radius: 12px; color: #b8c5ff;';
                            parent.appendChild(errorDiv);
                          }
                        }}
                      />
                    ) : (
                      <div style={styles.videoPlaceholder}>
                        <p>Video content available at NASA</p>
                        <a href={apodData.url} target="_blank" rel="noopener noreferrer" style={styles.videoLink}>
                          View Video
                        </a>
                      </div>
                    )}
                  </div>
                  <div style={styles.apodContent}>
                    <h3 style={styles.apodTitle}>{apodData.title}</h3>
                    <p style={styles.apodDate}>{apodData.date}</p>
                    <p style={styles.apodExplanation}>{apodData.explanation}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Near Earth Objects */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Near Earth Objects Today</h2>
              <div style={styles.neoGrid}>
                {nearEarthObjects.length > 0 ? (
                  nearEarthObjects.map((neo) => (
                    <div key={neo.id} style={styles.neoCard}>
                      <h3 style={styles.neoName}>{neo.name}</h3>
                      <div style={styles.neoDetails}>
                        <p>
                          <strong>Diameter:</strong> {' '}
                          {Math.round(neo.estimated_diameter.meters.estimated_diameter_min)} - {' '}
                          {Math.round(neo.estimated_diameter.meters.estimated_diameter_max)} meters
                        </p>
                        {neo.close_approach_data[0] && (
                          <>
                            <p>
                              <strong>Closest Approach:</strong> {neo.close_approach_data[0].close_approach_date}
                            </p>
                            <p>
                              <strong>Speed:</strong> {' '}
                              {parseInt(neo.close_approach_data[0].relative_velocity.kilometers_per_hour).toLocaleString()} km/h
                            </p>
                            <p>
                              <strong>Miss Distance:</strong> {' '}
                              {parseInt(neo.close_approach_data[0].miss_distance.kilometers).toLocaleString()} km
                            </p>
                          </>
                        )}
                        <div style={{
                          ...styles.hazardBadge,
                          backgroundColor: neo.is_potentially_hazardous_asteroid ? '#ff6b6b' : '#51cf66'
                        }}>
                          {neo.is_potentially_hazardous_asteroid ? 'Potentially Hazardous' : 'Safe'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={styles.noDataCard}>
                    <p>No Near Earth Objects detected for today</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
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
  backButton: {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(102, 126, 234, 0.4) 100%)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(102, 126, 234, 0.4)',
    borderRadius: '12px',
    padding: '12px 20px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)',
    transition: 'all 0.3s ease',
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
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px',
  },
  loadingText: {
    fontSize: '18px',
    color: '#b8c5ff',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '20px',
    height: '400px',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: '18px',
    color: '#ff6b6b',
    textAlign: 'center' as const,
  },
  retryButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    transition: 'all 0.3s ease',
  },
  section: {
    marginBottom: '50px',
  },
  sectionTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '30px',
    textAlign: 'center' as const,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  apodCard: {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.2)',
  },
  apodImageContainer: {
    marginBottom: '20px',
    textAlign: 'center' as const,
  },
  apodImage: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '12px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
  },
  videoPlaceholder: {
    padding: '40px',
    textAlign: 'center' as const,
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
  },
  videoLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600',
  },
  apodContent: {
    textAlign: 'left' as const,
  },
  apodTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#ffffff',
  },
  apodDate: {
    fontSize: '14px',
    color: '#b8c5ff',
    marginBottom: '15px',
  },
  apodExplanation: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#d4a4ff',
  },
  neoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px',
  },
  neoCard: {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.2)',
  },
  neoName: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#ffffff',
  },
  neoDetails: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  hazardBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textAlign: 'center' as const,
    marginTop: '10px',
    width: 'fit-content',
  },
  noDataCard: {
    textAlign: 'center' as const,
    padding: '40px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '15px',
    color: '#b8c5ff',
  },
};
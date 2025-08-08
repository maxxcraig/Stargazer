import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSignupSuccess(false);
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password);
      }

      if (result.error) {
        setError(result.error.message);
      } else if (!isLogin) {
        // Signup was successful
        setSignupSuccess(true);
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
    
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      {/* Background stars effect */}
      <div style={styles.starsBackground}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.star,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Auth Form */}
      <div style={styles.authCard}>
        {/* Title */}
        <div style={styles.titleContainer}>
          <span style={styles.title}>
            Max's Skyview
          </span>
          <p style={styles.subtitle}>
            {isLogin ? 'Welcome back, stargazer!' : 'Join my stargazing community!'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="Your email address"
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Your password"
              disabled={loading}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}
          
          {signupSuccess && (
            <div style={styles.success}>
              Account created successfully! 
              <br />
              Check your email to confirm your account and then log in.
            </div>
          )}

          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? 'Loading...' : (isLogin ? 'Launch to Stars' : 'Create Account')}
          </button>
        </form>

        {/* Toggle between login/signup */}
        <div style={styles.toggleContainer}>
          <p style={styles.toggleText}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSignupSuccess(false);
            }}
            style={styles.toggleButton}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative' as const,
    width: '100%',
    height: '100vh',
    background: 'linear-gradient(135deg, #0c0c1e 0%, #1a1a2e 50%, #16213e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  starsBackground: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  star: {
    position: 'absolute' as const,
    width: '2px',
    height: '2px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    animation: 'twinkle 3s ease-in-out infinite',
    boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
  },
  authCard: {
    position: 'relative' as const,
    zIndex: 2,
    background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
    backdropFilter: 'blur(20px)',
    border: '2px solid',
    borderImage: 'linear-gradient(135deg, #667eea, #764ba2) 1',
    borderRadius: '25px',
    padding: '40px',
    maxWidth: '450px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    animation: 'slideIn 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)',
  },
  titleContainer: {
    textAlign: 'center' as const,
    marginBottom: '30px',
  },
  title: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: '36px',
    fontWeight: 'bold',
    textShadow: '0 0 30px rgba(102, 126, 234, 0.5)',
    fontFamily: 'Arial, sans-serif',
    letterSpacing: '1px',
    display: 'block',
  },
  subtitle: {
    color: '#b8c5ff',
    fontSize: '16px',
    marginTop: '10px',
    fontWeight: '500',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    color: '#d4a4ff',
    fontSize: '14px',
    fontWeight: '600',
    marginLeft: '4px',
  },
  input: {
    padding: '15px 20px',
    border: '2px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },
  error: {
    color: '#ff6b6b',
    fontSize: '14px',
    textAlign: 'center' as const,
    padding: '10px',
    background: 'rgba(255, 107, 107, 0.1)',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    borderRadius: '8px',
  },
  success: {
    color: '#4ade80',
    fontSize: '14px',
    textAlign: 'center' as const,
    padding: '12px',
    background: 'rgba(74, 222, 128, 0.1)',
    border: '1px solid rgba(74, 222, 128, 0.3)',
    borderRadius: '8px',
    lineHeight: '1.4',
  },
  submitButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    border: 'none',
    padding: '18px 30px',
    borderRadius: '15px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
    transition: 'all 0.3s ease',
    marginTop: '10px',
  },
  toggleContainer: {
    textAlign: 'center' as const,
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  toggleText: {
    color: '#b8c5ff',
    fontSize: '14px',
    margin: '0 0 10px 0',
  },
  toggleButton: {
    background: 'transparent',
    color: '#667eea',
    border: '2px solid rgba(102, 126, 234, 0.4)',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};
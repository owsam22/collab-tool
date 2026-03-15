import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineVideoCamera, HiOutlineMail, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 70%, #0f172a 100%)',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '30%', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '10%', right: '20%', width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: 440, padding: 40, position: 'relative' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            borderRadius: 14, width: 48, height: 48,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HiOutlineVideoCamera size={26} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>
              Collab<span style={{ color: 'var(--color-primary-light)' }}>Space</span>
            </h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: 2 }}>
              REAL-TIME COLLABORATION
            </p>
          </div>
        </div>

        {/* Toggle */}
        <div style={{
          display: 'flex', background: 'var(--color-surface)', borderRadius: 10,
          padding: 4, marginBottom: 24,
        }}>
          <button onClick={() => setIsLogin(true)} style={{
            flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
            background: isLogin ? 'var(--color-primary)' : 'transparent',
            color: isLogin ? 'white' : 'var(--color-text-muted)',
          }}>Sign In</button>
          <button onClick={() => setIsLogin(false)} style={{
            flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
            background: !isLogin ? 'var(--color-primary)' : 'transparent',
            color: !isLogin ? 'white' : 'var(--color-text-muted)',
          }}>Register</button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            color: 'var(--color-danger)', fontSize: '0.85rem',
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <HiOutlineUser size={18} style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }} />
              <input
                id="name-input"
                className="input-field"
                type="text" placeholder="Full Name" value={name}
                onChange={(e) => setName(e.target.value)} required
                style={{ paddingLeft: 42 }}
              />
            </div>
          )}
          <div style={{ position: 'relative' }}>
            <HiOutlineMail size={18} style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
            }} />
            <input
              id="email-input"
              className="input-field"
              type="email" placeholder="Email Address" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              style={{ paddingLeft: 42 }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <HiOutlineLockClosed size={18} style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
            }} />
            <input
              id="password-input"
              className="input-field"
              type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)} required minLength={6}
              style={{ paddingLeft: 42 }}
            />
          </div>
          <button id="submit-btn" className="btn-primary" type="submit" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', marginTop: 8 }}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

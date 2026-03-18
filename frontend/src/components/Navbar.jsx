import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { HiOutlineVideoCamera, HiOutlineBell, HiOutlineUser, HiOutlineLogout } from 'react-icons/hi';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, clearNotifications, removeNotification } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--glass-border)',
      padding: '0 24px', height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          borderRadius: 10, width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <HiOutlineVideoCamera size={20} color="white" />
        </div>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.5px' }}>
          Collab<span style={{ color: 'var(--color-primary-light)' }}>Space</span>
        </span>
      </Link>

      {user ? (
        <>
          <div className="nav-links" style={{ display: 'flex', gap: 20 }}>
            <Link to="/dashboard" style={{ 
              fontSize: '0.9rem', fontWeight: 600, color: location.pathname === '/dashboard' ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
              textDecoration: 'none', transition: 'color 0.2s'
            }}>
              Dashboard
            </Link>
            <Link to="/teams" style={{ 
              fontSize: '0.9rem', fontWeight: 600, color: location.pathname === '/teams' ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
              textDecoration: 'none', transition: 'color 0.2s'
            }}>
              Teams
            </Link>
            <Link to="/tasks" style={{ 
              fontSize: '0.9rem', fontWeight: 600, color: location.pathname === '/tasks' ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
              textDecoration: 'none', transition: 'color 0.2s'
            }}>
              Tasks
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Notifications */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button className="btn-icon" onClick={() => setShowNotifs(!showNotifs)}
                style={{ position: 'relative' }}>
                <HiOutlineBell size={20} />
                {notifications.length > 0 && (
                  <span style={{
                    position: 'absolute', top: -2, right: -2,
                    background: 'var(--color-danger)', color: 'white',
                    borderRadius: '50%', width: 18, height: 18,
                    fontSize: '0.7rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{notifications.length}</span>
                )}
              </button>
              {showNotifs && (
                <div className="glass-card animate-fade-in" style={{
                  position: 'absolute', right: 0, top: 48, width: 320,
                  maxHeight: 400, overflow: 'auto', padding: 8,
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px', borderBottom: '1px solid var(--glass-border)',
                  }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Notifications</span>
                    {notifications.length > 0 && (
                      <button onClick={clearNotifications}
                        style={{ fontSize: '0.75rem', color: 'var(--color-primary-light)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Clear all
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p style={{ padding: 16, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      No notifications
                    </p>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} style={{
                        padding: '10px 12px', borderBottom: '1px solid var(--glass-border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <div>
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase',
                            color: n.type === 'chat' ? 'var(--color-accent)' : 'var(--color-warning)',
                            marginRight: 6,
                          }}>{n.type}</span>
                          <span style={{ fontSize: '0.85rem' }}>{n.message}</span>
                        </div>
                        <button onClick={() => removeNotification(i)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1rem' }}>×</button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* User menu */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button className="btn-icon" onClick={() => setShowProfile(!showProfile)}>
                <HiOutlineUser size={20} />
              </button>
              {showProfile && (
                <div className="glass-card animate-fade-in" style={{
                  position: 'absolute', right: 0, top: 48, width: 220, padding: 8,
                }}>
                  <div style={{ padding: '12px', borderBottom: '1px solid var(--glass-border)' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user.email}</p>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase',
                      background: 'var(--color-primary)', padding: '2px 8px', borderRadius: 4,
                      marginTop: 4, display: 'inline-block',
                    }}>{user.role}</span>
                  </div>
                  <Link to="/profile" onClick={() => setShowProfile(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 12px', color: 'var(--color-text)', textDecoration: 'none',
                      borderRadius: 8, fontSize: '0.9rem',
                    }}>
                    <HiOutlineUser size={16} /> Profile
                  </Link>
                  <button onClick={handleLogout} style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                    padding: '10px 12px', color: 'var(--color-danger)', background: 'none',
                    border: 'none', cursor: 'pointer', borderRadius: 8, fontSize: '0.9rem',
                  }}>
                    <HiOutlineLogout size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" style={{ 
            fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)',
            textDecoration: 'none', padding: '8px 16px', borderRadius: 8,
            transition: 'background 0.2s'
          }} onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.target.style.background = 'transparent'}>
            Login
          </Link>
          <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 20px', fontSize: '0.9rem' }}>
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { HiOutlineX, HiOutlineChatAlt2, HiOutlineDocument, HiOutlineVideoCamera } from 'react-icons/hi';

const Notifications = () => {
  const { notifications, removeNotification } = useSocket();
  const [visibleToasts, setVisibleToasts] = useState([]);

  useEffect(() => {
    if (notifications.length > 0 && notifications.length > visibleToasts.length) {
      const latest = notifications[0];
      const toastId = Date.now();
      setVisibleToasts((prev) => [{ ...latest, id: toastId }, ...prev].slice(0, 5));

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setVisibleToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 5000);
    }
  }, [notifications]);

  const getIcon = (type) => {
    switch (type) {
      case 'chat': return <HiOutlineChatAlt2 size={16} />;
      case 'file': return <HiOutlineDocument size={16} />;
      case 'meeting': return <HiOutlineVideoCamera size={16} />;
      case 'team': return <HiOutlineUserGroup size={16} />;
      default: return <HiOutlineVideoCamera size={16} />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'chat': return 'var(--color-accent)';
      case 'file': return 'var(--color-warning)';
      case 'meeting': return 'var(--color-success)';
      case 'team': return 'var(--color-primary)';
      default: return 'var(--color-primary)';
    }
  };

  if (visibleToasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', top: 76, right: 16, zIndex: 200,
      display: 'flex', flexDirection: 'column', gap: 8,
      pointerEvents: 'none',
    }}>
      {visibleToasts.map((toast) => (
        <div key={toast.id} className="glass-card animate-toast" style={{
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
          pointerEvents: 'auto', minWidth: 260, maxWidth: 360,
        }}>
          <div style={{
            color: getColor(toast.type),
            background: `${getColor(toast.type)}22`,
            borderRadius: 8, width: 32, height: 32, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {getIcon(toast.type)}
          </div>
          <p style={{ flex: 1, fontSize: '0.82rem', lineHeight: 1.3 }}>{toast.message}</p>
          <button onClick={() => setVisibleToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            style={{
              background: 'none', border: 'none', color: 'var(--color-text-muted)',
              cursor: 'pointer', padding: 4,
            }}>
            <HiOutlineX size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;

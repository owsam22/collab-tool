import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { HiOutlineUser, HiOutlineMail, HiOutlineShieldCheck } from 'react-icons/hi';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await API.put(`/users/${user.id}`, { name });
      updateProfile({ ...user, name: res.data.user.name });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
      <div className="glass-card animate-slide-up" style={{ padding: 32 }}>
        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 700, marginBottom: 12,
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{user?.name}</h2>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginTop: 4, color: 'var(--color-text-muted)', fontSize: '0.85rem',
          }}>
            <HiOutlineMail size={14} /> {user?.email}
          </div>
          <span style={{
            marginTop: 8, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
            background: 'var(--color-primary)', padding: '3px 12px', borderRadius: 6,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <HiOutlineShieldCheck size={12} /> {user?.role}
          </span>
        </div>

        {message && (
          <div style={{
            padding: '10px 14px', borderRadius: 8, marginBottom: 16,
            background: message.includes('success') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${message.includes('success') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: message.includes('success') ? 'var(--color-success)' : 'var(--color-danger)',
            fontSize: '0.85rem',
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--color-text-muted)' }}>
              Display Name
            </label>
            <div style={{ position: 'relative' }}>
              <HiOutlineUser size={16} style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }} />
              <input
                id="profile-name"
                className="input-field" type="text"
                value={name} onChange={(e) => setName(e.target.value)}
                required style={{ paddingLeft: 40 }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--color-text-muted)' }}>
              Email
            </label>
            <input className="input-field" type="email" value={user?.email || ''} disabled
              style={{ opacity: 0.6 }}
            />
          </div>

          <button id="save-profile-btn" className="btn-primary" type="submit" disabled={saving}
            style={{ marginTop: 8 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;

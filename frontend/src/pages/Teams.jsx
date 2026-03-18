import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { HiOutlineUserGroup, HiOutlinePlus, HiOutlineUserAdd, HiOutlineTrash, HiOutlineInformationCircle, HiOutlineClock, HiOutlineClipboardList, HiOutlineLogout, HiOutlineVideoCamera } from 'react-icons/hi';

const Teams = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMeetings, setTeamMeetings] = useState([]);
  const [teamTasks, setTeamTasks] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await API.get('/teams');
      setTeams(res.data.teams);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamDetails = async (teamId) => {
    setLoadingDetails(true);
    try {
      const [teamRes, meetingRes, taskRes] = await Promise.all([
        API.get(`/teams/${teamId}`),
        API.get('/meetings', { params: { teamId } }),
        API.get('/tasks', { params: { teamId } })
      ]);
      setSelectedTeam(teamRes.data.team);
      setTeamMeetings(meetingRes.data.meetings || []);
      setTeamTasks(taskRes.data.tasks || []);

      // Join team room for real-time notifications
      if (socket) {
        socket.emit('team:join', { teamId });
      }
    } catch (err) {
      console.error('Failed to fetch team details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/teams', newTeam);
      setTeams([...teams, res.data.team]);
      setNewTeam({ name: '', description: '' });
      setShowCreateForm(false);
      setMessage({ text: 'Team created successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to create team', type: 'error' });
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedTeam) return;
    try {
      await API.post(`/teams/${selectedTeam._id}/members`, { email: newMemberEmail });
      setMessage({ text: 'Member added successfully!', type: 'success' });
      setNewMemberEmail('');
      fetchTeams(); // Refresh to show new member
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to add member', type: 'error' });
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the team?')) return;
    try {
      const res = await API.delete(`/teams/${selectedTeam._id}/members/${userId}`);
      setSelectedTeam(res.data.team);
      setTeams(teams.map(t => t._id === res.data.team._id ? res.data.team : t));
      setMessage({ text: 'Member removed successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to remove member', type: 'error' });
    }
  };

  const isTeamAdmin = selectedTeam?.owner?._id === user?.id || selectedTeam?.owner === user?.id || user?.role === 'admin';

  const handleDeleteTeam = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    try {
      await API.delete(`/teams/${id}`);
      setTeams(teams.filter(t => t._id !== id));
      if (selectedTeam?._id === id) setSelectedTeam(null);
      setMessage({ text: 'Team deleted successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Failed to delete team', type: 'error' });
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;
    try {
      await API.post(`/teams/${selectedTeam._id}/leave`);
      setMessage({ text: 'You have left the team', type: 'success' });
      setSelectedTeam(null);
      fetchTeams();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to leave team', type: 'error' });
    }
  };

  if (loading) return <div className="p-8 text-center">Loading teams...</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Your Teams</h1>
        <button className="btn-primary" onClick={() => setShowCreateForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HiOutlinePlus size={20} /> Create Team
        </button>
      </div>

      {message.text && (
        <div className={`glass-card`} style={{ 
          padding: '12px 20px', marginBottom: 24, 
          border: `1px solid ${message.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
          color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
          background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'
        }}>
          {message.text}
        </div>
      )}

      {showCreateForm && (
        <div className="glass-card animate-slide-up" style={{ padding: 24, marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20 }}>Create New Team</h2>
          <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input 
              className="input-field" placeholder="Team Name" required
              value={newTeam.name} onChange={e => setNewTeam({...newTeam, name: e.target.value})}
            />
            <textarea 
              className="input-field" placeholder="Description (optional)" rows="3"
              value={newTeam.description} onChange={e => setNewTeam({...newTeam, description: e.target.value})}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-primary" type="submit">Create Team</button>
              <button className="btn-secondary" type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="teams-grid" style={{ gap: 32 }}>
        {/* Teams List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {teams.length === 0 ? (
            <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No teams yet. Create one to collaborate!
            </div>
          ) : (
            teams.map(team => (
              <div 
                key={team._id} 
                className={`glass-card clickable ${selectedTeam?._id === team._id ? 'active' : ''}`}
                onClick={() => fetchTeamDetails(team._id)}
                style={{ 
                  padding: 20, 
                  border: selectedTeam?._id === team._id ? '1px solid var(--color-primary)' : '1px solid var(--glass-border)',
                  background: selectedTeam?._id === team._id ? 'rgba(79,70,229,0.1)' : 'rgba(30,41,59,0.4)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{team.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                      {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <HiOutlineUserGroup size={24} color={selectedTeam?._id === team._id ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Team Details */}
        <div>
          {selectedTeam ? (
            <div className="glass-card animate-fade-in" style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{selectedTeam.name}</h2>
                  <p style={{ color: 'var(--color-text-muted)', marginTop: 8 }}>{selectedTeam.description}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(selectedTeam?.owner?._id !== user?.id && selectedTeam?.owner !== user?.id) && (
                    <button className="btn-secondary" onClick={handleLeaveTeam} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-danger)' }}>
                      <HiOutlineLogout size={18} /> Leave
                    </button>
                  )}
                  {isTeamAdmin && (
                    <button className="btn-icon" onClick={() => handleDeleteTeam(selectedTeam._id)} style={{ color: 'var(--color-danger)' }}>
                      <HiOutlineTrash size={20} />
                    </button>
                  )}
                </div>
              </div>

              {isTeamAdmin && (
                <div style={{ marginBottom: 32 }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HiOutlineUserAdd size={18} /> Add Member
                  </h4>
                  <form onSubmit={handleAddMember} style={{ display: 'flex', gap: 8 }}>
                    <input 
                      className="input-field" placeholder="User email" type="email" required
                      value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)}
                    />
                    <button className="btn-primary" type="submit" style={{ flexShrink: 0 }}>Add</button>
                  </form>
                </div>
              )}

              <div>
                <div style={{ padding: '0 12px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16 }}>Team Members</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {selectedTeam.members.map((member, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ 
                            width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700
                          }}>
                            {member.user?.name ? member.user.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{member.user?.name || 'Loading...'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{member.user?.email || ''}</div>
                          </div>
                        </div>
                        <span style={{ 
                          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', 
                          padding: '2px 8px', borderRadius: 4, 
                          background: member.role === 'admin' ? 'rgba(79,70,229,0.2)' : 'rgba(255,255,255,0.05)',
                          color: member.role === 'admin' ? 'var(--color-primary-light)' : 'var(--color-text-muted)'
                        }}>
                          {member.role}
                        </span>
                        {isTeamAdmin && member.user?._id !== (selectedTeam.owner?._id || selectedTeam.owner) && (
                          <button 
                            onClick={() => handleRemoveMember(member.user?._id)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: 4, opacity: 0.7 }}
                          >
                            <HiOutlineTrash size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Notifications / Upcoming Section */}
                  <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, paddingBottom: 24 }}>
                    {/* Meetings */}
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <HiOutlineClock style={{ color: 'var(--color-warning)' }} /> Upcoming Meetings
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {teamMeetings.length === 0 ? (
                          <div className="glass-card" style={{ padding: 12, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                            No meetings scheduled
                          </div>
                        ) : (
                          teamMeetings.slice(0, 3).map(m => (
                            <div key={m._id} className="glass-card" style={{ padding: 12, borderLeft: '3px solid var(--color-warning)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                                  {new Date(m.scheduledAt).toLocaleString()}
                                </div>
                              </div>
                              <button className="btn-icon" onClick={() => window.location.href = `/meeting/${m.roomId}`} style={{ color: 'var(--color-success)' }}>
                                <HiOutlineVideoCamera size={18} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Tasks */}
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <HiOutlineClipboardList style={{ color: 'var(--color-accent)' }} /> Active Tasks
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {teamTasks.filter(t => t.status !== 'done').length === 0 ? (
                          <div className="glass-card" style={{ padding: 12, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                            No active tasks
                          </div>
                        ) : (
                          teamTasks.filter(t => t.status !== 'done').slice(0, 3).map(t => (
                            <div key={t._id} className="glass-card" style={{ padding: 12, borderLeft: '3px solid var(--color-accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                                  {t.status}
                                </div>
                              </div>
                              <button className="btn-icon" onClick={() => window.location.href = '/tasks'} style={{ color: 'var(--color-accent)' }}>
                                <HiOutlineClipboardList size={18} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <HiOutlineInformationCircle size={48} />
              <p>Select a team from the list to view members and details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Teams;

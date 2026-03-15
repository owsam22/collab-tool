import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMicrophone, HiOutlineVideoCamera, HiOutlineDesktopComputer, HiOutlineVolumeOff, HiOutlineEyeOff } from 'react-icons/hi';

const VideoCall = ({ roomId }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const localVideoRef = useRef(null);
  const peersRef = useRef({});
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  const ICE_CONFIG = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  const createPeerConnection = useCallback((socketId, remoteUser) => {
    if (peersRef.current[socketId]) return peersRef.current[socketId];

    const pc = new RTCPeerConnection(ICE_CONFIG);

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      setPeers((prev) => ({
        ...prev,
        [socketId]: { stream: event.streams[0], user: remoteUser },
      }));
    };

    // Send ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('video:ice-candidate', {
          to: socketId,
          candidate: event.candidate,
          from: socket.id,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        removePeer(socketId);
      }
    };

    peersRef.current[socketId] = pc;
    return pc;
  }, [socket]);

  const removePeer = (socketId) => {
    if (peersRef.current[socketId]) {
      peersRef.current[socketId].close();
      delete peersRef.current[socketId];
    }
    setPeers((prev) => {
      const updated = { ...prev };
      delete updated[socketId];
      return updated;
    });
  };

  // Initialize local media
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Failed to get media devices:', err);
        // Try audio only
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          localStreamRef.current = audioStream;
          setLocalStream(audioStream);
        } catch (audioErr) {
          console.error('Failed to get audio:', audioErr);
        }
      }
    };
    initMedia();

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      Object.values(peersRef.current).forEach((pc) => pc.close());
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !localStreamRef.current) return;

    socket.emit('video:join-room', { roomId, user });

    // When a new user joins, create offer
    socket.on('video:user-joined', async ({ socketId, user: remoteUser }) => {
      const pc = createPeerConnection(socketId, remoteUser);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('video:offer', { to: socketId, offer, from: socket.id, user });
    });

    // Receive offer, create answer
    socket.on('video:offer', async ({ from, offer, user: remoteUser }) => {
      const pc = createPeerConnection(from, remoteUser);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('video:answer', { to: from, answer, from: socket.id });
    });

    // Receive answer
    socket.on('video:answer', async ({ from, answer }) => {
      const pc = peersRef.current[from];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    // Receive ICE candidate
    socket.on('video:ice-candidate', async ({ from, candidate }) => {
      const pc = peersRef.current[from];
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      }
    });

    // User left
    socket.on('video:user-left', ({ socketId }) => {
      removePeer(socketId);
    });

    return () => {
      socket.off('video:user-joined');
      socket.off('video:offer');
      socket.off('video:answer');
      socket.off('video:ice-candidate');
      socket.off('video:user-left');
      socket.emit('video:leave', { roomId });
    };
  }, [socket, localStreamRef.current, roomId, createPeerConnection]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing, revert to camera
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = cameraStream;
      setLocalStream(cameraStream);
      if (localVideoRef.current) localVideoRef.current.srcObject = cameraStream;

      // Replace tracks in all peer connections
      Object.values(peersRef.current).forEach((pc) => {
        const senders = pc.getSenders();
        const videoSender = senders.find((s) => s.track?.kind === 'video');
        if (videoSender && cameraStream.getVideoTracks()[0]) {
          videoSender.replaceTrack(cameraStream.getVideoTracks()[0]);
        }
      });

      socket.emit('screen:stop', { roomId });
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;

        // Replace video track in local view
        if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;

        // Replace tracks in all peer connections
        Object.values(peersRef.current).forEach((pc) => {
          const senders = pc.getSenders();
          const videoSender = senders.find((s) => s.track?.kind === 'video');
          if (videoSender && screenStream.getVideoTracks()[0]) {
            videoSender.replaceTrack(screenStream.getVideoTracks()[0]);
          }
        });

        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };

        socket.emit('screen:start', { roomId, user });
        setIsScreenSharing(true);
      } catch (err) {
        console.error('Screen sharing failed:', err);
      }
    }
  };

  const peerEntries = Object.entries(peers);
  const totalVideos = 1 + peerEntries.length;
  const gridCols = totalVideos <= 1 ? 1 : totalVideos <= 4 ? 2 : 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Video Grid */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gap: 8, padding: 8, overflow: 'auto',
      }}>
        {/* Local Video */}
        <div style={{
          position: 'relative', borderRadius: 12, overflow: 'hidden',
          background: '#1a1a2e', minHeight: 180,
        }}>
          <video
            ref={localVideoRef} autoPlay muted playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: isScreenSharing ? 'none' : 'scaleX(-1)' }}
          />
          <div style={{
            position: 'absolute', bottom: 8, left: 8,
            background: 'rgba(0,0,0,0.6)', padding: '4px 10px',
            borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
          }}>
            You {isScreenSharing && '(Screen)'}
          </div>
        </div>

        {/* Remote Videos */}
        {peerEntries.map(([socketId, { stream, user: remoteUser }]) => (
          <RemoteVideo key={socketId} stream={stream} user={remoteUser} />
        ))}
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 12,
        padding: '12px 0', borderTop: '1px solid var(--glass-border)',
      }}>
        <button className={`btn-icon ${isMuted ? '' : 'active'}`} onClick={toggleMute}
          style={isMuted ? { background: 'var(--color-danger)' } : {}}>
          {isMuted ? <HiOutlineVolumeOff size={18} /> : <HiOutlineMicrophone size={18} />}
        </button>
        <button className={`btn-icon ${isVideoOff ? '' : 'active'}`} onClick={toggleVideo}
          style={isVideoOff ? { background: 'var(--color-danger)' } : {}}>
          {isVideoOff ? <HiOutlineEyeOff size={18} /> : <HiOutlineVideoCamera size={18} />}
        </button>
        <button className={`btn-icon ${isScreenSharing ? 'active' : ''}`} onClick={toggleScreenShare}>
          <HiOutlineDesktopComputer size={18} />
        </button>
      </div>
    </div>
  );
};

const RemoteVideo = ({ stream, user }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div style={{
      position: 'relative', borderRadius: 12, overflow: 'hidden',
      background: '#1a1a2e', minHeight: 180,
    }}>
      <video ref={ref} autoPlay playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div style={{
        position: 'absolute', bottom: 8, left: 8,
        background: 'rgba(0,0,0,0.6)', padding: '4px 10px',
        borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
      }}>
        {user?.name || 'Participant'}
      </div>
    </div>
  );
};

export default VideoCall;

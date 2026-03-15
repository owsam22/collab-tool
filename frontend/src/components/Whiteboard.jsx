import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899', '#ffffff'];
const WIDTHS = [2, 4, 6, 8];

const Whiteboard = ({ roomId }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(2);
  const [tool, setTool] = useState('pen');
  const currentStrokeRef = useRef([]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      contextRef.current = ctx;
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Load existing strokes and listen for new ones
  useEffect(() => {
    if (!socket) return;

    socket.on('whiteboard:load', ({ strokes }) => {
      strokes.forEach((stroke) => drawStroke(stroke));
    });

    socket.on('whiteboard:draw', ({ stroke }) => {
      drawStroke(stroke);
    });

    socket.on('whiteboard:clear', () => {
      const canvas = canvasRef.current;
      if (canvas && contextRef.current) {
        contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
      }
    });

    return () => {
      socket.off('whiteboard:load');
      socket.off('whiteboard:draw');
      socket.off('whiteboard:clear');
    };
  }, [socket]);

  const drawStroke = useCallback((stroke) => {
    const ctx = contextRef.current;
    if (!ctx || !stroke.points || stroke.points.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = stroke.tool === 'eraser' ? '#0f172a' : stroke.color;
    ctx.lineWidth = stroke.tool === 'eraser' ? stroke.width * 4 : stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const pos = getPos(e);
    currentStrokeRef.current = [pos];
    setIsDrawing(true);

    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.strokeStyle = tool === 'eraser' ? '#0f172a' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 4 : lineWidth;
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    currentStrokeRef.current.push(pos);

    const ctx = contextRef.current;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStrokeRef.current.length >= 2 && socket) {
      const stroke = {
        tool,
        color,
        width: lineWidth,
        points: currentStrokeRef.current,
        userId: user.id,
        userName: user.name,
        timestamp: new Date(),
      };
      socket.emit('whiteboard:draw', { roomId, stroke });
    }
    currentStrokeRef.current = [];
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    if (canvas && contextRef.current) {
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
      if (socket) {
        socket.emit('whiteboard:clear', { roomId });
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
        borderBottom: '1px solid var(--glass-border)', flexWrap: 'wrap',
      }}>
        <button className={`btn-icon ${tool === 'pen' ? 'active' : ''}`}
          onClick={() => setTool('pen')} style={{ width: 32, height: 32 }}>
          <HiOutlinePencil size={14} />
        </button>
        <button className={`btn-icon ${tool === 'eraser' ? 'active' : ''}`}
          onClick={() => setTool('eraser')} style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
          E
        </button>

        <div style={{ width: 1, height: 24, background: 'var(--glass-border)', margin: '0 4px' }} />

        {/* Colors */}
        {COLORS.map((c) => (
          <button key={c} onClick={() => { setColor(c); setTool('pen'); }}
            style={{
              width: 22, height: 22, borderRadius: '50%', background: c,
              border: color === c ? '2px solid var(--color-primary-light)' : '2px solid transparent',
              cursor: 'pointer', transition: 'transform 0.15s',
              transform: color === c ? 'scale(1.2)' : 'scale(1)',
            }}
          />
        ))}

        <div style={{ width: 1, height: 24, background: 'var(--glass-border)', margin: '0 4px' }} />

        {/* Width selector */}
        {WIDTHS.map((w) => (
          <button key={w} onClick={() => setLineWidth(w)}
            style={{
              width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
              background: lineWidth === w ? 'var(--color-primary)' : 'var(--color-surface-lighter)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <div style={{ width: w + 2, height: w + 2, borderRadius: '50%', background: 'white' }} />
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <button className="btn-icon" onClick={clearBoard} style={{ width: 32, height: 32, color: 'var(--color-danger)' }}>
          <HiOutlineTrash size={14} />
        </button>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative', background: '#0f172a', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair', touchAction: 'none' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
      </div>
    </div>
  );
};

export default Whiteboard;

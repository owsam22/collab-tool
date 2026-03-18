import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineVideoCamera, HiOutlineChatAlt2, HiOutlinePencilAlt, HiOutlineDocumentReport, HiOutlineDesktopComputer } from 'react-icons/hi';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div style={{ overflowX: 'hidden', background: '#020617', color: 'white' }}>
      {/* Hero Section */}
      <section style={{
        minHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        position: 'relative',
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)'
      }}>
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px',
          background: 'var(--color-primary)', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.1, zIndex: 0
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%', width: '300px', height: '300px',
          background: 'var(--color-accent)', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.1, zIndex: 0
        }} />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ position: 'relative', zIndex: 1, maxWidth: 1000 }}
        >
          {/* Mobile Warning/Notice */}
          <motion.div variants={itemVariants} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: '100px',
            background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
            color: 'var(--color-primary-light)', fontSize: '0.85rem', fontWeight: 600,
            marginBottom: 32
          }}>
            <HiOutlineDesktopComputer size={18} />
            Use desktop for better experience
          </motion.div>

          <motion.h1 variants={itemVariants} style={{
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 24,
            letterSpacing: '-2px'
          }}>
            Collaborate in <span style={{
              background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-accent))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Real-Time</span> <br /> 
            Without Boundaries.
          </motion.h1>

          <motion.p variants={itemVariants} style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--color-text-muted)',
            maxWidth: 600,
            margin: '0 auto 40px',
            lineHeight: 1.6
          }}>
            Collab Space brings teams together with premium video calls, interactive whiteboards, 
            and instant messaging—all in one seamless, high-performance interface.
          </motion.p>

          <motion.div variants={itemVariants} style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link to="/login" className="btn-primary" style={{
              padding: '16px 32px', fontSize: '1.1rem', borderRadius: 12, textDecoration: 'none',
              boxShadow: '0 10px 30px -10px var(--color-primary)'
            }}>
              Start Collaborating
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16 }}>Built for Modern Teams</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Everything you need to work efficiently, anywhere in the world.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 32
        }}>
          {[
            {
              title: 'Interactive Whiteboard',
              desc: 'Draw, brainstorm, and visualize ideas together in real-time with locking controls.',
              icon: <HiOutlinePencilAlt size={32} />,
              color: 'var(--color-primary)'
            },
            {
              title: 'Crystal Clear Video',
              desc: 'High-definition video and audio communication for a presence that feels real.',
              icon: <HiOutlineVideoCamera size={32} />,
              color: '#10b981'
            },
            {
              title: 'Instant Messaging',
              desc: 'Keep the conversation going with persistent chat rooms and file sharing.',
              icon: <HiOutlineChatAlt2 size={32} />,
              color: '#f59e0b'
            },
            {
              title: 'Task Management',
              desc: 'Stay organized with integrated task lists and project tracking.',
              icon: <HiOutlineDocumentReport size={32} />,
              color: '#ec4899'
            }
          ].map((feat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              style={{
                padding: 40,
                borderRadius: 24,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(10px)',
                textAlign: 'left'
              }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: `${feat.color}15`, color: feat.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 24
              }}>
                {feat.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12 }}>{feat.title}</h3>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social Proof / Trust */}
      <section style={{ 
        padding: '80px 24px', textAlign: 'center', 
        borderTop: '1px solid var(--glass-border)',
        background: 'rgba(255,255,255,0.01)'
      }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 40, textTransform: 'uppercase', letterSpacing: 2 }}>
          Trusted by innovators worldwide
        </p>
        <div style={{ 
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 60, opacity: 0.5, filter: 'grayscale(1)' 
        }}>
          {['TECHNO', 'NEXUS', 'VORTEX', 'QUANTUM'].map(brand => (
             <span key={brand} style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: 4 }}>{brand}</span>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '120px 24px', textAlign: 'center' }}>
        <div style={{
          maxWidth: 800, margin: '0 auto', padding: '60px 40px',
          borderRadius: 32, background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          boxShadow: '0 20px 50px -20px var(--color-primary)'
        }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 24 }}>Ready to elevate your workflow?</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: 40, opacity: 0.9 }}>
            Join Collab Space today and experience building together in a whole new way.
          </p>
          <Link to="/login" style={{
            display: 'inline-block', padding: '16px 40px', background: 'white', color: 'var(--color-primary)',
            borderRadius: 12, fontWeight: 700, textDecoration: 'none', transition: 'transform 0.2s'
          }} onMouseOver={e => e.target.style.transform = 'scale(1.05)'} onMouseOut={e => e.target.style.transform = 'scale(1)'}>
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

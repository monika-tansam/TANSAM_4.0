import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { labsData } from '../components/LabsGrid';
import { Box3D, CheckCircle3D, Lightbulb3D, Factory3D, Gear3D, Network3D, Clipboard3D, VRGlasses3D, Bot3D } from '../components/LabsGrid';

// Re-implementing a simple non-rotating icon for the detail page, or we can use the same rotating logic
import { useFrame } from '@react-three/fiber';

const Rotating3DIcon = ({ type }) => {
  const groupRef = React.useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.8;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const getModel = () => {
    switch (type) {
      case 'cuboid': return <Box3D />;
      case 'check': return <CheckCircle3D />;
      case 'lightbulb': return <Lightbulb3D />;
      case 'factory': return <Factory3D />;
      case 'gear': return <Gear3D />;
      case 'network': return <Network3D />;
      case 'clipboard': return <Clipboard3D />;
      case 'vr': return <VRGlasses3D />;
      case 'bot': return <Bot3D />;
      default: return <Box3D />;
    }
  };

  return (
    <group ref={groupRef} scale={1.8}>
      {getModel()}
    </group>
  );
};

export default function LabDetailsPage({ theme }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const lab = labsData.find(l => l.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!lab) {
    return (
      <div style={{ padding: '150px 20px', textAlign: 'center', minHeight: '80vh' }}>
        <h2>Lab not found!</h2>
        <button onClick={() => navigate('/labs')} className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Labs
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ padding: '120px 20px 80px', maxWidth: '1200px', margin: '0 auto', minHeight: '85vh' }}
    >
      <div style={{ marginBottom: '40px' }}>
        <Link to="/labs" style={{ color: '#009999', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Back to All Labs
        </Link>
      </div>

      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '60px', 
        alignItems: 'center',
        background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
        padding: '60px',
        borderRadius: '24px',
        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
      }}>
        
        {/* Left Side: 3D Visualization */}
        <div style={{ flex: '1 1 400px', height: '400px', minWidth: '300px' }}>
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={theme === 'dark' ? 2.5 : 2.0} />
            <pointLight position={[10, 10, 10]} intensity={theme === 'dark' ? 4 : 3} color={theme === 'dark' ? "#00ffff" : "#00cccc"} />
            <pointLight position={[-10, -10, -10]} intensity={theme === 'dark' ? 3 : 2} color="#00ffff" />
            <Rotating3DIcon type={lab.iconType} />
          </Canvas>
        </div>

        {/* Right Side: Information */}
        <div style={{ flex: '1 1 400px', minWidth: '300px' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: 'var(--text-color)' }}>
            {lab.title}
          </h1>
          <p style={{ fontSize: '1.2rem', lineHeight: 1.6, opacity: 0.9, marginBottom: '40px' }}>
            {lab.desc}
          </p>

          <div style={{ 
            background: theme === 'dark' ? 'rgba(0, 153, 153, 0.1)' : 'rgba(0, 153, 153, 0.05)', 
            padding: '25px', 
            borderRadius: '16px',
            borderLeft: '4px solid #009999'
          }}>
            <h3 style={{ marginBottom: '15px', color: '#009999' }}>Coming Soon</h3>
            <p style={{ opacity: 0.8 }}>
              This section will soon feature in-depth details about the equipment, software, case studies, and training modules associated with the <strong>{lab.title}</strong> lab. Stay tuned!
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

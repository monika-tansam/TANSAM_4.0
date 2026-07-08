import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { labsData } from '../components/LabsGrid';
import { Box3D, CheckCircle3D, Lightbulb3D, Factory3D, Gear3D, Network3D, Clipboard3D, VRGlasses3D, Bot3D } from '../components/LabsGrid';
import { labDetailsData } from '../data/labDetailsData';
import { MiniModelWrapper, QuestionMark3D, SpeechBubble3D, Document3D, Wrench3D, Benefit3D } from '../components/LabDetailsModels';
import { useFrame } from '@react-three/fiber';

// Re-using the main hero rotating icon
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

const getMiniModel = (title, color) => {
  const t = title.toLowerCase();
  if (t.includes('faq') || t.includes('question')) return <QuestionMark3D color={color} />;
  if (t.includes('testimonial')) return <SpeechBubble3D color={color} />;
  if (t.includes('case study')) return <Document3D color={color} />;
  if (t.includes('help') || t.includes('benefit') || t.includes('solution')) return <Benefit3D color={color} />;
  return <Wrench3D color={color} />;
};

const BentoCard = ({ title, items, themeColor, index }) => {
  // Determine if we should make this a wide card based on content length or type
  const isWide = title.toLowerCase().includes('case study') || items.join('').length > 300;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.5 }}
      whileHover={{ y: -5, boxShadow: `0 10px 30px -10px ${themeColor}88` }}
      style={{
        gridColumn: isWide ? '1 / -1' : 'span 1',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${themeColor}33`,
        borderRadius: '24px',
        padding: '30px',
        display: 'flex',
        flexDirection: isWide ? 'row' : 'column',
        gap: '20px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
      className="bento-card"
    >
      {/* Decorative Glow */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '150px',
        height: '150px',
        background: `radial-gradient(circle, ${themeColor}22 0%, transparent 70%)`,
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <div style={{ width: isWide ? '150px' : '100px', height: isWide ? '150px' : '100px', flexShrink: 0, margin: isWide ? '0' : '0 auto' }}>
        <Canvas camera={{ position: [0, 0, 4] }}>
          <ambientLight intensity={1.5} />
          <pointLight position={[10, 10, 10]} intensity={2} color={themeColor} />
          <MiniModelWrapper color={themeColor}>
            {getMiniModel(title, themeColor)}
          </MiniModelWrapper>
        </Canvas>
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ color: themeColor, marginBottom: '15px', fontSize: '1.4rem' }}>{title}</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '10px',
              color: 'var(--text-color)',
              opacity: 0.9,
              lineHeight: 1.5
            }}>
              <span style={{ color: themeColor, marginTop: '2px' }}>✦</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

const ImageSlider = ({ images, themeColor }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (!images || images.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      style={{
        gridColumn: '1 / -1',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${themeColor}33`,
        borderRadius: '24px',
        padding: '30px',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: themeColor, fontSize: '1.4rem', margin: 0 }}>Lab Gallery</h3>
      </div>
      
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '400px', 
        overflow: 'hidden', 
        borderRadius: '16px',
        boxShadow: `0 8px 30px ${themeColor}22`
      }}>
        <AnimatePresence>
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              position: 'absolute', 
              top: 0, 
              left: 0 
            }}
            alt="Lab showcase"
          />
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default function LabDetailsPage({ theme }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const lab = labsData.find(l => l.id === id);
  const labContent = labDetailsData[id]?.sections || {};
  const labSpecificImages = labDetailsData[id]?.images || [];
  
  // Compile all unique images from all labs to use as "general" pictures
  const allImages = Object.values(labDetailsData).flatMap(l => l.images || []);
  // Put lab specific images first, then append the rest, filtering out duplicates
  const sliderImages = [...new Set([...labSpecificImages, ...allImages])];

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

  const themeColor = lab.color || '#009999';

  return (
    <div style={{ padding: '120px 20px 80px', maxWidth: '1200px', margin: '0 auto', minHeight: '85vh' }}>
      <div style={{ marginBottom: '40px' }}>
        <Link to="/labs" style={{ color: themeColor, textDecoration: 'none', fontWeight: 'bold' }}>
          ← Back to All Labs
        </Link>
      </div>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '40px', 
          alignItems: 'center',
          background: `linear-gradient(135deg, ${themeColor}11 0%, transparent 100%)`,
          padding: '60px',
          borderRadius: '32px',
          border: `1px solid ${themeColor}33`,
          marginBottom: '60px'
        }}
      >
        <div style={{ flex: '1 1 300px', height: '350px' }}>
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={theme === 'dark' ? 2.5 : 2.0} />
            <pointLight position={[10, 10, 10]} intensity={theme === 'dark' ? 4 : 3} color={themeColor} />
            <pointLight position={[-10, -10, -10]} intensity={theme === 'dark' ? 3 : 2} color="#ffffff" />
            <Rotating3DIcon type={lab.iconType} />
          </Canvas>
        </div>

        <div style={{ flex: '1 1 400px' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', color: 'var(--text-color)', lineHeight: 1.1 }}>
            {lab.title}
          </h1>
          <p style={{ fontSize: '1.2rem', lineHeight: 1.6, opacity: 0.9, borderLeft: `4px solid ${themeColor}`, paddingLeft: '20px' }}>
            {lab.desc}
          </p>
        </div>
      </motion.div>

      {/* Bento Grid Content */}
      {(Object.keys(labContent).length > 0 || sliderImages.length > 0) ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px'
        }}>
          {/* Auto-scrolling Slider Gallery */}
          {sliderImages.length > 0 && (
            <ImageSlider images={sliderImages} themeColor={themeColor} />
          )}

          {Object.entries(labContent).map(([title, items], index) => (
            <BentoCard 
              key={title} 
              title={title} 
              items={items} 
              themeColor={themeColor} 
              index={index + 1} 
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--glass-bg)', borderRadius: '24px' }}>
          <h3 style={{ color: themeColor }}>Content Coming Soon</h3>
          <p>Detailed information for this lab is currently being updated.</p>
        </div>
      )}
    </div>
  );
}

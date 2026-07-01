import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Bot3D, VRGlasses3D, Lightbulb3D, Factory3D, Gear3D, Network3D 
} from './LabsGrid';
import { motion } from 'framer-motion';

// The Pipe component that holds the flowing particles and icons
function DataPipe({ theme }) {
  const pointsRef = useRef();
  const iconRefs = useRef([]);
  
  // Setup the flowing icons data
  const iconsData = useMemo(() => {
    const models = [Bot3D, VRGlasses3D, Lightbulb3D, Factory3D, Gear3D, Network3D];
    return models.map((Model, i) => {
      // Distribute evenly around the pipe (theta)
      const angle = (i / models.length) * Math.PI * 2;
      // Stagger them evenly along the extended X axis
      const x = (i - models.length / 2) * 8.33; 
      const radius = 2.5; 
      // All move at the same speed to maintain spacing
      const speed = 0.05; // Slightly faster flow
      return { Model, angle, x, radius, speed };
    });
  }, []);

  // Setup the flowing particles for the pipe background
  const { positions, speeds } = useMemo(() => {
    const count = 1200;
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const x = (Math.random() - 0.5) * 50; // Spread from -25 to +25 along X
      const r = 3 + (Math.random() * 1.5); // Radius between 3 and 4.5
      p[i*3] = x;
      p[i*3+1] = r * Math.sin(theta);
      p[i*3+2] = r * Math.cos(theta);
      s[i] = 0.03 + Math.random() * 0.04; // Flow speed
    }
    return { positions: p, speeds: s };
  }, []);

  useFrame((state, delta) => {
    // 1. Move particles along the pipe
    if (pointsRef.current) {
      const posArray = pointsRef.current.geometry.attributes.position.array;
      for (let i = 0; i < 1200; i++) {
        posArray[i*3] += speeds[i]; // Move right
        if (posArray[i*3] > 25) posArray[i*3] = -25; // Wrap completely off-screen
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      // Slowly rotate the entire particle pipe for extra dynamism
      pointsRef.current.rotation.x -= 0.002;
    }

    // 2. Move icons along the pipe
    iconRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const data = iconsData[i];
      data.x += data.speed;
      if (data.x > 25) data.x = -25; // Wrap completely off-screen
      
      // Update position (moving along X, maintaining radial position)
      ref.position.set(data.x, data.radius * Math.sin(data.angle), data.radius * Math.cos(data.angle));
      
      // Slowly rotate the icon itself
      ref.rotation.y += delta * 0.5;
      ref.rotation.x += delta * 0.2;
    });
  });

  const pipeColor = theme === 'dark' ? "#00ffff" : "#009999";

  return (
    <PresentationControls
      global={false}
      cursor={true}
      snap={true} // Safe snapping
      polar={[-Math.PI / 3, Math.PI / 3]}
      azimuth={[-Math.PI / 4, Math.PI / 4]}
    >
      {/* Slightly angle the pipe towards the camera for a better perspective */}
      <group rotation={[0, -0.2, 0]}> 
        <ambientLight intensity={theme === 'dark' ? 2 : 1} />
        
        {/* Colorful lighting to make the models look beautiful as they flow */}
        <pointLight position={[-15, 5, 5]} intensity={3} color="#ff00ff" distance={30} />
        <pointLight position={[0, -5, 5]} intensity={2} color="#00ffff" distance={20} />
        <pointLight position={[15, 5, 5]} intensity={3} color="#ffff00" distance={30} />
        <directionalLight position={[0, 0, 10]} intensity={1.5} color="#ffffff" />
        
        {/* The Particle Tunnel */}
        <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
          <PointMaterial
            transparent
            color={pipeColor}
            size={0.1}
            sizeAttenuation={true}
            depthWrite={false}
            opacity={0.8}
          />
        </Points>
        
        {/* The Flowing Icons */}
        {iconsData.map((data, i) => {
          const Model = data.Model;
          return (
            <group key={`icon-${i}`} ref={(el) => iconRefs.current[i] = el}>
              <Model theme={theme} scale={1.2} />
            </group>
          );
        })}
        
        {/* Invisible hit-box cylinder to catch mouse drags everywhere inside the pipe */}
        <mesh>
          <cylinderGeometry args={[6, 6, 30, 16]} rotation={[0, 0, Math.PI/2]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </PresentationControls>
  );
}

export default function HeroSection({ theme }) {
  return (
    <section className="hero-section" id="hero" style={{ 
      position: 'relative', 
      maxWidth: '100%', 
      padding: 0,
      background: theme === 'dark' ? '#0a0f16' : '#ffffff',
      overflow: 'hidden'
    }}>
      {/* Full-width 3D Canvas Background */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0,
        maskImage: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)',
      }}>
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <DataPipe theme={theme} />
        </Canvas>
      </div>

      <div className="about-content-wrapper" style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '120px 20px 80px',
        display: 'flex',
        minHeight: '85vh',
        alignItems: 'center',
        justifyContent: 'flex-start', // Align card to left
        pointerEvents: 'none' // Crucial: lets clicks pass through empty space to the canvas!
      }}>
        
        {/* Left Side: Text and Glass Card */}
        <div style={{ flex: '0 0 650px', position: 'relative', zIndex: 10, pointerEvents: 'none', marginLeft: '40px' }}>
          <div className="hero-glass-card" style={{ 
            pointerEvents: 'auto', 
            background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            padding: '50px',
            borderRadius: '24px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <motion.h1 
              className="hero-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{ fontSize: '2.8rem', marginBottom: '20px', lineHeight: 1.2, fontWeight: 'bold' }}
            >
              INDUSTRY 4.0<br />
              <span className="highlight-gradient">CENTER OF EXCELLENCE</span>
            </motion.h1>

            <motion.p 
              className="hero-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ fontSize: '1.2rem', marginBottom: '40px', opacity: 0.9 }}
            >
              TANSAM, powered by Siemens, is your gateway to smart manufacturing. We empower MSMEs, startups, and students with cutting-edge technologies.
            </motion.p>

            <motion.div 
              className="hero-buttons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ display: 'flex', gap: '20px' }}
            >
              <a href="#about-us" className="btn btn-primary">Explore Solutions</a>
              <a href="#contact" className="btn btn-outline">Contact Us</a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

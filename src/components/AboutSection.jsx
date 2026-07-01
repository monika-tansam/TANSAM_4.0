import React from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import * as THREE from 'three';

function QuantumCoreGame({ theme }) {
  const [score, setScore] = React.useState(0);
  const [position, setPosition] = React.useState([0, 0, 0]);
  const [isHit, setIsHit] = React.useState(false);
  const targetRef = React.useRef();
  const fieldRef = React.useRef();

  const moveTarget = React.useCallback(() => {
    // Spawn within a 3D spherical bounds
    const radius = 2.2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    setPosition([x, y, z]);
    setIsHit(false);
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!isHit) moveTarget();
    }, 1200);
    return () => clearInterval(interval);
  }, [isHit, moveTarget]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (isHit) return;
    setScore(s => s + 1);
    setIsHit(true);
    setTimeout(moveTarget, 300);
  };

  useFrame((state, delta) => {
    if (targetRef.current) {
      targetRef.current.rotation.x += delta * (isHit ? 15 : 2);
      targetRef.current.rotation.y += delta * (isHit ? 20 : 2);
      const scale = isHit ? 0.1 : 1 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
      targetRef.current.scale.setScalar(THREE.MathUtils.lerp(targetRef.current.scale.x, scale, 0.2));
    }
    if (fieldRef.current) {
      fieldRef.current.rotation.y += delta * 0.2;
      fieldRef.current.rotation.z += delta * 0.1;
    }
  });

  return (
    <group>
      {/* 3D Holographic HUD */}
      <Text 
        position={[0, 3.8, 0]} 
        fontSize={0.4} 
        color={theme === 'dark' ? "#00ffff" : "#009999"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor={theme === 'dark' ? "#00ffff" : "#009999"}
      >
        SYSTEM ANOMALIES RESOLVED: {score}
      </Text>
      <Text 
        position={[0, 3.3, 0]} 
        fontSize={0.18} 
        color={theme === 'dark' ? "#ffffff" : "#333333"}
        anchorX="center"
        anchorY="middle"
        opacity={0.8}
      >
        CLICK GLOWING NODES TO STABILIZE CORE
      </Text>

      {/* Holographic Containment Field */}
      <group ref={fieldRef}>
        {/* Core Sphere */}
        <mesh>
          <sphereGeometry args={[2.8, 16, 16]} />
          <meshBasicMaterial 
            color={theme === 'dark' ? "#00ffff" : "#009999"} 
            wireframe 
            transparent 
            opacity={0.06} 
          />
        </mesh>
        
        {/* Data Rings */}
        {[...Array(3)].map((_, i) => (
          <mesh key={i} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
            <torusGeometry args={[3.0 + i * 0.2, 0.01, 16, 100]} />
            <meshBasicMaterial 
              color={theme === 'dark' ? "#00ffff" : "#009999"} 
              transparent 
              opacity={0.3} 
            />
          </mesh>
        ))}
      </group>

      {/* Anomaly Target */}
      <group 
        position={position} 
        ref={targetRef}
        onClick={handleClick}
        onPointerEnter={() => document.body.style.cursor='crosshair'}
        onPointerLeave={() => document.body.style.cursor='auto'}
      >
        {/* Outer glowing shell */}
        <mesh>
          <icosahedronGeometry args={[0.5, 0]} />
          <meshBasicMaterial 
            color={isHit ? "#00ffff" : "#ff0055"} 
            wireframe
            transparent
            opacity={0.8}
          />
        </mesh>
        {/* Inner solid core */}
        <mesh scale={0.5}>
          <icosahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial 
            color={isHit ? "#00ffff" : "#ff0055"} 
            emissive={isHit ? "#00ffff" : "#ff0055"} 
            emissiveIntensity={2}
          />
        </mesh>
      </group>
    </group>
  );
}

export default function AboutSection({ theme }) {
  return (
    <section className="about-section" id="about-us" style={{ 
      position: 'relative', 
      maxWidth: '100%', 
      padding: '100px 20px',
      background: theme === 'dark' ? '#0f1724' : '#f8f9fa',
      overflow: 'hidden'
    }}>
      <div className="about-container" style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '60px'
      }}>
        
        {/* Left Side: Interactive 3D Object */}
        <div style={{ flex: '1', display: 'flex', justifyContent: 'center', height: '500px' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
              position: 'relative',
              cursor: 'grab'
            }}
          >
            <Canvas camera={{ position: [0, 0, 9], fov: 60 }}>
              <ambientLight intensity={theme === 'dark' ? 1.5 : 0.8} />
              <pointLight position={[10, 10, 10]} intensity={1.5} />
              <pointLight position={[-10, -10, -10]} intensity={1} color="#00ffff" />
              <QuantumCoreGame theme={theme} />
            </Canvas>
          </motion.div>
        </div>

        {/* Right Side: About Text */}
        <div style={{ flex: '1' }}>
          <motion.div 
            className="about-content"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ 
              background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
              padding: '50px',
              borderRadius: '24px',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
            }}
          >
            <h1 className="section-title" style={{ fontSize: '3rem', marginBottom: '30px' }}>
              <span className="highlight-gradient">ABOUT</span> TANSAM
            </h1>

            <p className="about-text-lead" style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '20px' }}>
              TANSAM (Tamil Nadu Smart and Advanced Manufacturing), powered by Siemens, is the state's arts Industry 4.0 Centre of Excellence. Located at Tidel Park, Chennai, TANSAM helps industries, MSMEs, and academic institutions adopt future-ready technologies such as IoT, digital twins, AI, AR/VR, and smart factory solutions.
            </p>

            <p className="about-text-sub" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '30px', opacity: 0.8 }}>
              Inaugurated on 8 November 2022 by Honourable Chief Minister of Tamil Nadu, Thiru. M.K. Stalin. Established as a Section 8 company under TIDCO to drive industrial growth, a global leader in smart manufacturing solutions.
            </p>

            <div className="features-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px',
              marginBottom: '40px'
            }}>
              <div className="feature-item"><span className="checkmark" style={{ color: '#009999', marginRight: '10px' }}>✓</span> MSME Collaboration</div>
              <div className="feature-item"><span className="checkmark" style={{ color: '#009999', marginRight: '10px' }}>✓</span> Start-Up Mentoring</div>
              <div className="feature-item"><span className="checkmark" style={{ color: '#009999', marginRight: '10px' }}>✓</span> POCs & POVs</div>
              <div className="feature-item"><span className="checkmark" style={{ color: '#009999', marginRight: '10px' }}>✓</span> Industry & Academic Spokes</div>
              <div className="feature-item"><span className="checkmark" style={{ color: '#009999', marginRight: '10px' }}>✓</span> Joint Research & Development</div>
              <div className="feature-item"><span className="checkmark" style={{ color: '#009999', marginRight: '10px' }}>✓</span> Industry Academic Collaboration</div>
            </div>

            <div className="about-actions">
              <a href="#labs" className="btn btn-primary">Discover More</a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

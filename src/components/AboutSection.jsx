import React from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function DottedSphere({ theme }) {
  const ref = React.useRef();
  
  // Generate random points on a sphere
  const count = 1000;
  const positions = React.useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 2.5;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      p[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = radius * Math.cos(phi);
    }
    return p;
  }, [count]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.1;
      ref.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <group scale={1.5}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={theme === 'dark' ? "#00e6e6" : "#009999"}
          size={0.08}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      <mesh>
        <sphereGeometry args={[2.4, 32, 32]} />
        <meshBasicMaterial 
          color={theme === 'dark' ? "#001111" : "#e6ffff"} 
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>
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
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '60px'
      }}>
        
        {/* Left Side: Interactive 3D Object */}
        <div style={{ flex: '1 1 400px', minWidth: '300px', display: 'flex', justifyContent: 'center', height: '500px' }}>
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
              <DottedSphere theme={theme} />
              <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
          </motion.div>
        </div>

        {/* Right Side: About Text */}
        <div style={{ flex: '1 1 400px', minWidth: '300px' }}>
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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

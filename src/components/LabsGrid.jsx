import React, { useRef, Suspense } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';
import cobotModelPath from '../assets/Cobot.glb';
import './LabsGrid.css';

/* ============================================================
   3D models — graphite body + accent trim (teal / maroon)
   Each is a self-contained <group>; internal parts may animate
   independently (meshing gears, rising smoke, pulsing nodes).
   ============================================================ */

const BODY = '#3a4149';

export const Box3D = ({ accent = '#00c2c2', body = BODY }) => {
  const sparkRef = useRef();
  useFrame((state) => {
    if (sparkRef.current) {
      const t = state.clock.elapsedTime;
      sparkRef.current.children.forEach((s, i) => {
        const a = t * 1.4 + (i * Math.PI * 2) / 3;
        s.position.set(Math.cos(a) * 1.3, Math.sin(a * 1.3) * 0.5, Math.sin(a) * 1.3);
      });
    }
  });
  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[0.95, 0]} />
        <meshStandardMaterial color={body} metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh scale={1.01}>
        <icosahedronGeometry args={[0.95, 0]} />
        <meshBasicMaterial color={accent} wireframe />
      </mesh>
      <group ref={sparkRef}>
        {[0, 1, 2].map((i) => (
          <mesh key={i}>
            <boxGeometry args={[0.12, 0.12, 0.12]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export const CheckCircle3D = ({ accent = '#00c2c2', body = BODY }) => (
  <group>
    <mesh>
      <torusGeometry args={[1, 0.16, 16, 48]} />
      <meshStandardMaterial color={body} metalness={0.5} roughness={0.35} />
    </mesh>
    <mesh position={[-0.22, -0.05, 0]} rotation={[0, 0, -0.8]}>
      <capsuleGeometry args={[0.09, 0.55, 4, 8]} />
      <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} />
    </mesh>
    <mesh position={[0.28, 0.28, 0]} rotation={[0, 0, 0.55]}>
      <capsuleGeometry args={[0.09, 1, 4, 8]} />
      <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} />
    </mesh>
  </group>
);

export const Lightbulb3D = ({ accent = '#00c2c2', body = BODY }) => {
  const filamentRef = useRef();
  useFrame((state) => {
    if (filamentRef.current) {
      const pulse = 1.2 + Math.sin(state.clock.elapsedTime * 3) * 0.6;
      filamentRef.current.material.emissiveIntensity = pulse;
    }
  });
  return (
    <group position={[0, 0.35, 0]}>
      <mesh>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshStandardMaterial color={accent} transparent opacity={0.22} roughness={0.1} metalness={0} />
      </mesh>
      <mesh ref={filamentRef}>
        <torusKnotGeometry args={[0.28, 0.045, 64, 8, 2, 3]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0, -0.95, 0]}>
        <cylinderGeometry args={[0.4, 0.32, 0.4, 20]} />
        <meshStandardMaterial color={body} metalness={0.6} roughness={0.3} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, -1.2 - i * 0.14, 0]}>
          <torusGeometry args={[0.3 - i * 0.02, 0.03, 8, 20]} />
          <meshStandardMaterial color={body} metalness={0.7} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
};

export const Factory3D = ({ scale = 1.0 }) => {
  const { scene } = useGLTF(cobotModelPath);
  return (
    <Center scale={scale * 4.2}>
      <primitive object={scene} />
    </Center>
  );
};
useGLTF.preload(cobotModelPath);

export const Gear3D = ({ accent = '#00c2c2', body = BODY }) => {
  const bigRef = useRef();
  const smallRef = useRef();
  useFrame((state, delta) => {
    if (bigRef.current) bigRef.current.rotation.z += delta * 0.6;
    if (smallRef.current) smallRef.current.rotation.z -= delta * 1.05;
  });
  const teeth = (count, radius, size) =>
    [...Array(count)].map((_, i) => {
      const a = (i * Math.PI * 2) / count;
      return (
        <mesh key={i} position={[Math.cos(a) * radius, Math.sin(a) * radius, 0]} rotation={[0, 0, a]}>
          <boxGeometry args={size} />
          <meshStandardMaterial color={body} metalness={0.6} roughness={0.3} />
        </mesh>
      );
    });
  return (
    <group>
      <group ref={bigRef} position={[-0.35, -0.15, 0]}>
        <mesh>
          <torusGeometry args={[0.68, 0.16, 12, 28]} />
          <meshStandardMaterial color={body} metalness={0.6} roughness={0.3} />
        </mesh>
        {teeth(10, 0.78, [0.22, 0.22, 0.3])}
        <mesh>
          <cylinderGeometry args={[0.18, 0.18, 0.32, 20]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} />
        </mesh>
      </group>
      <group ref={smallRef} position={[0.62, 0.55, 0]}>
        <mesh>
          <torusGeometry args={[0.36, 0.11, 12, 24]} />
          <meshStandardMaterial color={body} metalness={0.6} roughness={0.3} />
        </mesh>
        {teeth(8, 0.44, [0.15, 0.15, 0.24])}
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 0.26, 16]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} />
        </mesh>
      </group>
    </group>
  );
};

export const Network3D = ({ accent = '#00c2c2', body = BODY }) => {
  const satsRef = useRef();
  useFrame((state) => {
    if (!satsRef.current) return;
    const t = state.clock.elapsedTime;
    satsRef.current.children.forEach((s, i) => {
      const scale = 1 + Math.sin(t * 2.4 + i * 1.1) * 0.18;
      s.scale.setScalar(scale);
    });
  });
  const points = [
    [0, 1, 0], [-1, -0.7, 0], [1, -0.7, 0], [0, -0.2, 0.9], [0, -0.2, -0.9],
  ];
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.32, 20, 20]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1} />
      </mesh>
      <group ref={satsRef}>
        {points.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color={body} metalness={0.5} roughness={0.35} />
          </mesh>
        ))}
      </group>
      {points.map((p, i) => {
        const dir = new THREE.Vector3(...p);
        const len = dir.length();
        const mid = dir.clone().multiplyScalar(0.5);
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        return (
          <mesh key={i} position={mid} quaternion={quat}>
            <cylinderGeometry args={[0.025, 0.025, len, 8]} />
            <meshStandardMaterial color="#ffffff" opacity={0.5} transparent />
          </mesh>
        );
      })}
    </group>
  );
};

export const Clipboard3D = ({ accent = '#00c2c2', body = BODY }) => {
  const loopRef = useRef();
  useFrame((state, delta) => {
    if (loopRef.current) loopRef.current.rotation.z += delta * 0.5;
  });
  return (
    <group>
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[1.3, 1.7, 0.08]} />
        <meshStandardMaterial color={body} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.1, 1.5, 0.06]} />
        <meshStandardMaterial color="#eef3f6" metalness={0.05} roughness={0.8} />
      </mesh>
      {[0.35, 0.1, -0.15].map((y, i) => (
        <mesh key={i} position={[0, y, 0.04]}>
          <boxGeometry args={[0.7, 0.06, 0.02]} />
          <meshStandardMaterial color={body} />
        </mesh>
      ))}
      <mesh position={[0, 0.78, 0.06]}>
        <boxGeometry args={[0.45, 0.22, 0.14]} />
        <meshStandardMaterial color={accent} metalness={0.5} roughness={0.3} />
      </mesh>
      <group ref={loopRef} position={[0, 0, 0.5]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
            <torusGeometry args={[0.85, 0.035, 8, 20, Math.PI * 0.55]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export const VRGlasses3D = ({ accent = '#00c2c2', body = BODY }) => (
  <group position={[0, -0.1, 0]}>
    <mesh position={[0, 0.15, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.95, 0.09, 12, 48]} />
      <meshStandardMaterial color={body} wireframe />
    </mesh>
    <mesh position={[0, 0.15, 0.5]}>
      <boxGeometry args={[1.7, 0.85, 0.7]} />
      <meshStandardMaterial color={body} metalness={0.5} roughness={0.35} />
    </mesh>
    <mesh position={[0, 0.15, 0.86]}>
      <boxGeometry args={[1.5, 0.09, 0.05]} />
      <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.6} />
    </mesh>
    <mesh position={[-0.9, 0.15, 0.35]}>
      <boxGeometry args={[0.1, 0.35, 0.35]} />
      <meshStandardMaterial color={accent} metalness={0.5} roughness={0.3} />
    </mesh>
    <mesh position={[0.9, 0.15, 0.35]}>
      <boxGeometry args={[0.1, 0.35, 0.35]} />
      <meshStandardMaterial color={accent} metalness={0.5} roughness={0.3} />
    </mesh>
  </group>
);

export const Bot3D = ({ accent = '#00c2c2', body = BODY }) => {
  const eyesRef = useRef();
  useFrame((state) => {
    if (eyesRef.current) {
      const blink = 0.7 + Math.sin(state.clock.elapsedTime * 2.6) * 0.5;
      eyesRef.current.children.forEach((e) => (e.material.emissiveIntensity = Math.max(blink, 0.15)));
    }
  });
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.25, 1.05, 1.05]} />
        <meshStandardMaterial color={body} metalness={0.5} roughness={0.35} />
      </mesh>
      <group ref={eyesRef}>
        <mesh position={[-0.28, 0.08, 0.56]}>
          <boxGeometry args={[0.26, 0.16, 0.06]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1} />
        </mesh>
        <mesh position={[0.28, 0.08, 0.56]}>
          <boxGeometry args={[0.26, 0.16, 0.06]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1} />
        </mesh>
      </group>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
        <meshStandardMaterial color={body} />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
};

/* ============================================================
   Rotating wrapper — continuous tumble, speeds up + lifts on hover
   ============================================================ */

const MODEL_BY_TYPE = {
  cuboid: Box3D,
  check: CheckCircle3D,
  lightbulb: Lightbulb3D,
  factory: Factory3D,
  gear: Gear3D,
  network: Network3D,
  clipboard: Clipboard3D,
  vr: VRGlasses3D,
  bot: Bot3D,
};

const Rotating3DIcon = ({ type, accent, hoverRef }) => {
  const groupRef = useRef();
  const scaleState = useRef(1);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const hovered = hoverRef.current;
    const speed = hovered ? 1.8 : 0.55;
    groupRef.current.rotation.y += delta * speed;
    groupRef.current.rotation.x = type === 'factory' ? 0 : Math.sin(state.clock.elapsedTime * 0.6) * 0.14;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.6) * 0.08;

    const target = hovered ? 1.15 : 1;
    scaleState.current = THREE.MathUtils.lerp(scaleState.current, target, delta * 6);
    groupRef.current.scale.setScalar(scaleState.current);
  });

  const Model = MODEL_BY_TYPE[type] || Box3D;

  return (
    <group ref={groupRef} scale={1.5}>
      <Model accent={accent} />
    </group>
  );
};

/* ============================================================
   Data
   ============================================================ */

export const labsData = [
  { id: 'product-innovation', title: 'Product Innovation', desc: 'Uses Siemens tools to accelerate efficient, creative product development.', iconType: 'cuboid' },
  { id: 'predictive-engineering', title: 'Predictive Engineering', desc: 'Uses Siemens tools to simulate, analyze, and optimize products.', iconType: 'check' },
  { id: 'innovative-manufacturing', title: 'Innovative Manufacturing', desc: 'Powers precision manufacturing through reverse engineering and 3D metal printing.', iconType: 'lightbulb' },
  { id: 'smart-factory', title: 'Smart Factory', desc: 'Uses Siemens Industry 4.0 tools to optimize and transform manufacturing.', iconType: 'factory' },
  { id: 'asset-performance', title: 'Asset Performance', desc: 'Uses advanced engineering and computing methods to determine predictive and preventive asset performance.', iconType: 'gear' },
  { id: 'industrial-iot', title: 'Industrial IoT', desc: 'Uses edge computing and automation tools to enhance efficiency at the shop floor.', iconType: 'network' },
  { id: 'product-lifecycle', title: 'Product Lifecycle', desc: 'Uses Siemens Teamcenter to streamline product lifecycle, collaboration, and innovation.', iconType: 'clipboard' },
  { id: 'ar-vr-xr', title: 'AR | VR | XR', desc: 'Develops immersive simulations enhancing training, learning, and real-world workflows.', iconType: 'vr' },
  { id: 'digital-technologies', title: 'Digital Technologies', desc: 'Uses AI and ML techniques for vision computing and advanced computing needs.', iconType: 'bot' },
];

/* ============================================================
   Panel — corner reticle, cursor spotlight, tilt, 3D icon
   ============================================================ */

const LabPanel = ({ lab, index, theme }) => {
  const ref = useRef(null);
  const hoverRef = useRef(false);
  const navigate = useNavigate();
  const accent = index % 2 === 0 ? 'var(--teal)' : 'var(--maroon)';
  const accentHex = index % 2 === 0 ? '#00c2c2' : '#d1454a';

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [5, -5]), { stiffness: 220, damping: 22 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-5, 5]), { stiffness: 220, damping: 22 });

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    px.set(nx);
    py.set(ny);
    ref.current.style.setProperty('--mx', `${nx * 100}%`);
    ref.current.style.setProperty('--my', `${ny * 100}%`);
  };

  const handleEnter = () => { hoverRef.current = true; };
  const handleLeave = () => {
    px.set(0.5);
    py.set(0.5);
    hoverRef.current = false;
  };

  const go = () => navigate(`/labs/${lab.id}`);

  return (
    <motion.div
      ref={ref}
      className="lab-panel"
      style={{ '--accent': accent, rotateX, rotateY }}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={go}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && go()}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
    >
      <span className="lab-corner tl" />
      <span className="lab-corner tr" />
      <span className="lab-corner bl" />
      <span className="lab-corner br" />
      <span className="lab-scan" />

      <div className="lab-index">LAB · {String(index + 1).padStart(2, '0')}</div>

      <div className="lab-icon-3d">
        <Canvas
          camera={{ position: lab.id === 'smart-factory' ? [0, 0, 5.6] : [0, 0, 4.2], fov: 42 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={theme === 'dark' ? 1.4 : 2.3} />
          <pointLight position={[3, 3, 4]} intensity={theme === 'dark' ? 2.4 : 1.6} color={accentHex} />
          <pointLight position={[-3, -2, -3]} intensity={1.1} color="#ffffff" />
          <directionalLight position={[0, 2, 5]} intensity={1.1} />
          <Suspense fallback={null}>
            <Rotating3DIcon type={lab.iconType} accent={accentHex} hoverRef={hoverRef} />
          </Suspense>
        </Canvas>
      </div>

      <h3 className="lab-title">{lab.title}</h3>
      <p className="lab-desc">{lab.desc}</p>
      <div className="lab-cta">
        <span>View facility</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </div>
    </motion.div>
  );
};

export default function LabsGrid({ theme = 'dark' }) {
  return (
    <section className="labs-section" id="labs" data-theme={theme}>
      <div className="labs-hud" aria-hidden="true">
        <svg className="labs-hud-ring" viewBox="0 0 400 400">
          <g className="hud-ring-outer">
            <circle cx="200" cy="200" r="178" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 10" />
            {[...Array(12)].map((_, i) => (
              <line
                key={i}
                x1="200" y1="14" x2="200" y2="30"
                stroke="currentColor"
                strokeWidth="1.5"
                transform={`rotate(${i * 30} 200 200)`}
              />
            ))}
          </g>
          <g className="hud-ring-inner">
            <circle cx="200" cy="200" r="138" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1 8" />
          </g>
          <circle cx="200" cy="200" r="3" fill="currentColor" />
        </svg>
        <div className="labs-hud-readout">
          <span className="hud-corner tl" />
          <span className="hud-corner tr" />
          <span className="hud-corner bl" />
          <span className="hud-corner br" />
          <span className="hud-readout-label">Facility Count</span>
          <span className="hud-readout-value">09</span>
        </div>
      </div>

      <motion.div
        className="labs-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="labs-eyebrow">TANSAM · Facility Directory</span>
        <h2 className="section-title">
          <span className="highlight-gradient">Innovation</span> Labs
        </h2>
        <p className="labs-subtitle">
          Nine dedicated facilities, built with Siemens, spanning design, simulation, manufacturing, and immersive engineering.
        </p>
      </motion.div>

      <div className="labs-grid-container">
        {labsData.map((lab, i) => (
          <LabPanel key={lab.id} lab={lab} index={i} theme={theme} />
        ))}
      </div>
    </section>
  );
}
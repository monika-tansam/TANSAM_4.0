import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Custom 3D Icons built from primitives
const Gear3D = () => (
  <group>
    <mesh><torusGeometry args={[0.8, 0.3, 16, 32]} /><meshStandardMaterial color="#009999" /></mesh>
    {[...Array(8)].map((_, i) => (
      <mesh key={i} rotation={[0, 0, (i * Math.PI) / 4]} position={[Math.cos((i * Math.PI) / 4) * 0.9, Math.sin((i * Math.PI) / 4) * 0.9, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.6]} />
        <meshStandardMaterial color="#009999" />
      </mesh>
    ))}
  </group>
);

const Factory3D = () => (
  <group position={[0, -0.5, 0]}>
    <mesh position={[-0.8, 0.5, 0]}><boxGeometry args={[0.8, 1, 1]} /><meshStandardMaterial color="#009999" /></mesh>
    <mesh position={[0.2, 0.7, 0]}><boxGeometry args={[0.8, 1.4, 1]} /><meshStandardMaterial color="#009999" /></mesh>
    <mesh position={[1.2, 0.9, 0]}><boxGeometry args={[0.8, 1.8, 1]} /><meshStandardMaterial color="#009999" /></mesh>
    <mesh position={[1.2, 2.2, 0]}><cylinderGeometry args={[0.1, 0.1, 1, 16]} /><meshStandardMaterial color="#A21D21" /></mesh>
  </group>
);

const Network3D = () => (
  <group>
    <mesh position={[0, 1, 0]}><sphereGeometry args={[0.4, 16, 16]} /><meshStandardMaterial color="#A21D21" /></mesh>
    <mesh position={[-1, -0.8, 0]}><sphereGeometry args={[0.4, 16, 16]} /><meshStandardMaterial color="#009999" /></mesh>
    <mesh position={[1, -0.8, 0]}><sphereGeometry args={[0.4, 16, 16]} /><meshStandardMaterial color="#009999" /></mesh>
    <mesh position={[-0.5, 0.1, 0]} rotation={[0, 0, -0.8]}><cylinderGeometry args={[0.05, 0.05, 2]} /><meshStandardMaterial color="#ffffff" /></mesh>
    <mesh position={[0.5, 0.1, 0]} rotation={[0, 0, 0.8]}><cylinderGeometry args={[0.05, 0.05, 2]} /><meshStandardMaterial color="#ffffff" /></mesh>
    <mesh position={[0, -0.8, 0]} rotation={[0, 0, 1.57]}><cylinderGeometry args={[0.05, 0.05, 2]} /><meshStandardMaterial color="#ffffff" /></mesh>
  </group>
);

const VRGlasses3D = () => (
  <group position={[0, -0.2, 0]}>
    {/* Head Strap */}
    <mesh position={[0, 0.2, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1, 0.15, 16, 64]} />
      <meshStandardMaterial color="#009999" wireframe />
    </mesh>
    {/* Visor */}
    <mesh position={[0, 0.2, 0.6]}>
      <boxGeometry args={[1.8, 0.9, 0.8]} />
      <meshStandardMaterial color="#009999" />
    </mesh>
    {/* Glowing LED Strip on Front */}
    <mesh position={[0, 0.2, 1.01]}>
      <boxGeometry args={[1.6, 0.1, 0.05]} />
      <meshStandardMaterial color="#A21D21" emissive="#A21D21" emissiveIntensity={2} />
    </mesh>
    {/* Side attachments */}
    <mesh position={[-0.95, 0.2, 0.4]}>
      <boxGeometry args={[0.1, 0.4, 0.4]} />
      <meshStandardMaterial color="#A21D21" />
    </mesh>
    <mesh position={[0.95, 0.2, 0.4]}>
      <boxGeometry args={[0.1, 0.4, 0.4]} />
      <meshStandardMaterial color="#A21D21" />
    </mesh>
  </group>
);

const Lightbulb3D = () => (
  <group position={[0, 0.5, 0]}>
    <mesh position={[0, 0, 0]}><sphereGeometry args={[0.8, 32, 32]} /><meshStandardMaterial color="#009999" transparent opacity={0.8} /></mesh>
    <mesh position={[0, -0.9, 0]}><cylinderGeometry args={[0.4, 0.3, 0.5, 16]} /><meshStandardMaterial color="#A21D21" /></mesh>
    <mesh position={[0, -1.2, 0]}><cylinderGeometry args={[0.2, 0.1, 0.3, 16]} /><meshStandardMaterial color="#ffffff" /></mesh>
  </group>
);

const Clipboard3D = () => (
  <group>
    <mesh position={[0, 0, -0.1]}><boxGeometry args={[1.6, 2.2, 0.1]} /><meshStandardMaterial color="#A21D21" /></mesh>
    <mesh position={[0, 0, 0]}><boxGeometry args={[1.4, 2, 0.1]} /><meshStandardMaterial color="#ffffff" /></mesh>
    <mesh position={[0, 1, 0.1]}><boxGeometry args={[0.6, 0.3, 0.2]} /><meshStandardMaterial color="#009999" /></mesh>
  </group>
);

const Bot3D = () => (
  <group>
    <mesh position={[0, 0, 0]}><boxGeometry args={[1.4, 1.2, 1.2]} /><meshStandardMaterial color="#009999" /></mesh>
    <mesh position={[-0.3, 0.1, 0.65]}><boxGeometry args={[0.3, 0.2, 0.1]} /><meshStandardMaterial color="#ffffff" /></mesh>
    <mesh position={[0.3, 0.1, 0.65]}><boxGeometry args={[0.3, 0.2, 0.1]} /><meshStandardMaterial color="#ffffff" /></mesh>
    <mesh position={[0, 0.8, 0]}><cylinderGeometry args={[0.05, 0.05, 0.6]} /><meshStandardMaterial color="#ffffff" /></mesh>
    <mesh position={[0, 1.2, 0]}><sphereGeometry args={[0.2]} /><meshStandardMaterial color="#A21D21" /></mesh>
  </group>
);

const CheckCircle3D = () => (
  <group>
    <mesh><torusGeometry args={[1, 0.2, 16, 50]} /><meshStandardMaterial color="#009999" /></mesh>
    <mesh position={[-0.2, -0.1, 0]} rotation={[0, 0, -0.8]}><cylinderGeometry args={[0.1, 0.1, 0.8]} /><meshStandardMaterial color="#A21D21" /></mesh>
    <mesh position={[0.3, 0.3, 0]} rotation={[0, 0, 0.6]}><cylinderGeometry args={[0.1, 0.1, 1.4]} /><meshStandardMaterial color="#A21D21" /></mesh>
  </group>
);

const Box3D = () => (
  <mesh><boxGeometry args={[1.5, 1.5, 1.5]} /><meshStandardMaterial color="#009999" wireframe /></mesh>
);

// 3D Icon Component wrapper
const Rotating3DIcon = ({ type }) => {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.8;
      // Slight floating motion
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
    <group ref={groupRef} scale={1.2}>
      {getModel()}
    </group>
  );
};

const labsData = [
  { title: 'Product Innovation', desc: 'TANSAM Product Innovation Center uses Siemens tools to accelerate efficient, creative product development.', iconType: 'cuboid' },
  { title: 'Predictive Engineering', desc: 'TANSAM Predictive Engineering Center uses Siemens tools to simulate, analyze, and optimize products.', iconType: 'check' },
  { title: 'Innovative Manufacturing', desc: 'TANSAM with Siemens powers precision manufacturing through reverse engineering and 3D metal printing.', iconType: 'lightbulb' },
  { title: 'Smart Factory', desc: 'TANSAM Smart Factory uses Siemens Industry 4.0 tools to optimize and transform manufacturing.', iconType: 'factory' },
  { title: 'Asset Performance', desc: 'TANSAM Asset Performance uses advanced engineering & computing methods to determine predictive and preventive asset performance.', iconType: 'gear' },
  { title: 'Industrial IoT', desc: 'TANSAM Industrial IIoT center uses edge computing and automation tools to enhance efficiency at the shop floor.', iconType: 'network' },
  { title: 'Product Lifecycle', desc: 'TANSAM PLM Center uses Siemens Teamcenter to streamline product lifecycle, collaboration, and innovation.', iconType: 'clipboard' },
  { title: 'AR | VR | XR', desc: 'TANSAM AR/VR/MR Lab develops immersive simulations enhancing training, learning, and real-world workflows.', iconType: 'vr' },
  { title: 'Digital Technologies', desc: 'TANSAM Digital Technologies center uses AI & ML techniques for vision computing and advanced computing needs.', iconType: 'bot' },
];

const TiltCard = ({ lab, theme }) => {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className="lab-tilt-card"
    >
      <div className="lab-tilt-card-inner" style={{ transform: "translateZ(50px)" }}>
        <div className="lab-icon-3d" style={{ width: '80px', height: '80px', marginBottom: '15px' }}>
          <Canvas camera={{ position: [0, 0, 4] }}>
            <ambientLight intensity={theme === 'dark' ? 2.5 : 2.0} />
            <pointLight position={[10, 10, 10]} intensity={theme === 'dark' ? 4 : 3} color={theme === 'dark' ? "#00ffff" : "#00cccc"} />
            <pointLight position={[-10, -10, -10]} intensity={theme === 'dark' ? 3 : 2} color="#00ffff" />
            <directionalLight position={[0, 0, 5]} intensity={1.5} />
            <Rotating3DIcon type={lab.iconType} />
          </Canvas>
        </div>
        <h3 className="lab-title">{lab.title}</h3>
        <p className="lab-desc">{lab.desc}</p>
      </div>
    </motion.div>
  );
};

export default function LabsGrid({ theme }) {
  return (
    <section className="labs-section" id="labs">
      <div className="text-center mb-12">
        <h2 className="section-title">
          <span className="highlight-gradient">INNOVATION</span> LABS
        </h2>
      </div>
      <div className="labs-grid-container">
        {labsData.map((lab, i) => (
          <TiltCard key={i} lab={lab} theme={theme} />
        ))}
      </div>
    </section>
  );
}

export { Gear3D, Factory3D, Network3D, VRGlasses3D, Lightbulb3D, Clipboard3D, Bot3D, CheckCircle3D, Box3D };

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import { useInternship } from '../context/InternshipContext';
import { Bot3D, VRGlasses3D, Box3D, Network3D, Gear3D } from '../components/LabsGrid';

// We reuse the Rotating3DIcon logic to keep models spinning
import { useFrame } from '@react-three/fiber';

const RotatingModel = ({ type }) => {
  const groupRef = React.useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.8;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const getModel = () => {
    switch (type) {
      case 'ai': return <Bot3D />;
      case 'vr': return <VRGlasses3D />;
      case '3d': return <Box3D />;
      case 'iot': return <Network3D />;
      case 'robotics': return <Gear3D />;
      default: return <Box3D />;
    }
  };

  return (
    <group ref={groupRef} scale={1.8}>
      {getModel()}
    </group>
  );
};

const COURSES = [
  {
    id: 'ai-ml',
    title: 'AI & Machine Learning',
    desc: 'Master Neural Networks, Deep Learning, and GenAI. Build real-world intelligent systems.',
    price: 4999,
    icon: 'ai',
    color: '#f72585',
    duration: '4 Weeks'
  },
  {
    id: 'ar-vr',
    title: 'AR/VR & Metaverse',
    desc: 'Create immersive experiences using Unity, Unreal Engine, and WebXR technologies.',
    price: 5499,
    icon: 'vr',
    color: '#4361ee',
    duration: '6 Weeks'
  },
  {
    id: '3d-printing',
    title: 'Additive Manufacturing',
    desc: 'Learn industrial 3D printing, CAD design, and rapid prototyping workflows.',
    price: 3999,
    icon: '3d',
    color: '#4cc9f0',
    duration: '4 Weeks'
  },
  {
    id: 'iot',
    title: 'Industrial IoT',
    desc: 'Connect the physical and digital world. Master sensors, edge computing, and cloud data.',
    price: 4499,
    icon: 'iot',
    color: '#f8961e',
    duration: '5 Weeks'
  },
  {
    id: 'robotics',
    title: 'Robotics & Automation',
    desc: 'Program industrial robotic arms, learn PLC programming and smart factory automation.',
    price: 5999,
    icon: 'robotics',
    color: '#7209b7',
    duration: '8 Weeks'
  }
];

export default function InternshipRegistrationPage({ theme }) {
  const { cart, addToCart } = useInternship();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isInCart = (id) => cart.find(c => c.id === id);

  return (
    <div className="internship-container" style={{ padding: '120px 20px 80px', maxWidth: '1200px', margin: '0 auto', minHeight: '85vh' }}>
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="internship-hero"
        style={{
          textAlign: 'center',
          marginBottom: '60px'
        }}
      >
        <h1 style={{ 
          fontSize: '4rem', 
          fontWeight: '900', 
          background: 'linear-gradient(to right, #f72585, #7209b7, #4cc9f0)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          marginBottom: '20px'
        }}>
          Level Up Your Career.
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-color)', opacity: 0.8, maxWidth: '600px', margin: '0 auto' }}>
          Join the exclusive TANSAM corporate internship program. Hands-on projects, industry mentors, and cutting-edge tech stacks.
        </p>
      </motion.div>

      {/* Course Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '40px'
      }}>
        {COURSES.map((course, idx) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -10, boxShadow: `0 20px 40px -10px ${course.color}aa` }}
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${course.color}55`,
              borderRadius: '24px',
              padding: '30px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* 3D Model Container */}
            <div style={{ height: '200px', width: '100%', marginBottom: '20px', position: 'relative' }}>
              {/* Neon Glow Behind Model */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '120px',
                height: '120px',
                background: `radial-gradient(circle, ${course.color}55 0%, transparent 70%)`,
                borderRadius: '50%',
                pointerEvents: 'none'
              }} />
              <Canvas camera={{ position: [0, 0, 4] }}>
                <ambientLight intensity={theme === 'dark' ? 1.5 : 2.5} />
                <pointLight position={[10, 10, 10]} intensity={2} color={course.color} />
                <RotatingModel type={course.icon} />
              </Canvas>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ background: `${course.color}22`, color: course.color, padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {course.duration}
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>
                  ₹{course.price}
                </span>
              </div>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '10px', color: 'var(--text-color)' }}>{course.title}</h3>
              <p style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '25px', color: 'var(--text-color)' }}>{course.desc}</p>
            </div>

            <button 
              onClick={() => {
                if (!isInCart(course.id)) {
                  addToCart(course);
                } else {
                  navigate('/internships/checkout');
                }
              }}
              style={{
                background: isInCart(course.id) ? 'transparent' : `linear-gradient(45deg, ${course.color}, #000)`,
                border: isInCart(course.id) ? `2px solid ${course.color}` : 'none',
                color: isInCart(course.id) ? course.color : '#fff',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: isInCart(course.id) ? 'none' : `0 5px 15px ${course.color}66`
              }}
            >
              {isInCart(course.id) ? 'Proceed to Checkout →' : 'Add to Cart'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

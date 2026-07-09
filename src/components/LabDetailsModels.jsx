import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// Generic wrapper for the mini models to make them float and rotate
export const MiniModelWrapper = ({ children, color }) => {
  const groupRef = useRef();
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Clone children and inject the lab's specific theme color into materials if needed, 
          but usually we just rely on the point lights. We will pass color to children manually. */}
      {React.Children.map(children, child => React.cloneElement(child, { color }))}
    </group>
  );
};

export const QuestionMark3D = ({ color }) => (
  <group scale={1.5}>
    <mesh position={[0, 0.5, 0]}>
      <torusGeometry args={[0.4, 0.15, 16, 50, Math.PI * 1.5]} />
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.2} />
    </mesh>
    <mesh position={[0, -0.6, 0]}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.2} />
    </mesh>
  </group>
);

export const SpeechBubble3D = ({ color }) => (
  <group scale={1.2}>
    <mesh position={[0, 0.2, 0]}>
      <boxGeometry args={[1.6, 1.2, 0.4]} />
      <meshStandardMaterial color={color} transparent opacity={0.9} />
    </mesh>
    <mesh position={[-0.4, -0.6, 0]} rotation={[0, 0, 0.5]}>
      <cylinderGeometry args={[0, 0.3, 0.6, 4]} />
      <meshStandardMaterial color={color} transparent opacity={0.9} />
    </mesh>
    {/* Lines of text */}
    <mesh position={[0, 0.4, 0.25]}><boxGeometry args={[1.0, 0.1, 0.05]} /><meshStandardMaterial color="#fff" /></mesh>
    <mesh position={[0, 0.1, 0.25]}><boxGeometry args={[1.2, 0.1, 0.05]} /><meshStandardMaterial color="#fff" /></mesh>
    <mesh position={[-0.2, -0.2, 0.25]}><boxGeometry args={[0.8, 0.1, 0.05]} /><meshStandardMaterial color="#fff" /></mesh>
  </group>
);

export const Document3D = ({ color }) => (
  <group scale={1.2}>
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1.4, 1.8, 0.1]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
    {/* Folded corner */}
    <mesh position={[0.6, 0.8, 0.06]} rotation={[0, 0, Math.PI/4]}>
      <boxGeometry args={[0.4, 0.4, 0.1]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh position={[0, 0.5, 0.1]}>
      <boxGeometry args={[0.8, 0.1, 0.05]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh position={[0, 0.2, 0.1]}>
      <boxGeometry args={[1.0, 0.1, 0.05]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh position={[0, -0.1, 0.1]}>
      <boxGeometry args={[1.0, 0.1, 0.05]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh position={[0, -0.4, 0.1]}>
      <boxGeometry args={[0.6, 0.1, 0.05]} />
      <meshStandardMaterial color={color} />
    </mesh>
  </group>
);

export const Wrench3D = ({ color }) => (
  <group scale={1.2} rotation={[0, 0, -Math.PI / 4]}>
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[0.1, 0.1, 2, 16]} />
      <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
    </mesh>
    <mesh position={[0, 1.1, 0]}>
      <torusGeometry args={[0.3, 0.1, 16, 50, Math.PI]} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
    </mesh>
    <mesh position={[0, -1.1, 0]}>
      <cylinderGeometry args={[0.2, 0.2, 0.4, 6]} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
    </mesh>
  </group>
);

export const Benefit3D = ({ color }) => (
  <group scale={1.2}>
    <mesh position={[0, 0, 0]}>
      <octahedronGeometry args={[1]} />
      <meshStandardMaterial color={color} wireframe />
    </mesh>
    <mesh position={[0, 0, 0]}>
      <octahedronGeometry args={[0.5]} />
      <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={0.5} />
    </mesh>
  </group>
);

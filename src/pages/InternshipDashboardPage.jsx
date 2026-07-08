import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useInternship } from '../context/InternshipContext';
import { FaGraduationCap, FaCalendarAlt, FaCheckCircle, FaCircle } from 'react-icons/fa';

// Mock curriculum data for different tech stacks
const CURRICULUM_DATA = {
  'ai-ml': [
    { title: 'Python Fundamentals & NumPy', duration: 'Week 1' },
    { title: 'Machine Learning Algorithms', duration: 'Week 2' },
    { title: 'Deep Learning & Neural Nets', duration: 'Week 3' },
    { title: 'GenAI & Capstone Project', duration: 'Week 4' }
  ],
  'ar-vr': [
    { title: 'Introduction to Unity 3D', duration: 'Week 1-2' },
    { title: 'C# Scripting Basics', duration: 'Week 3' },
    { title: 'XR Interaction Toolkit', duration: 'Week 4-5' },
    { title: 'Metaverse Deployment', duration: 'Week 6' }
  ],
  '3d-printing': [
    { title: 'CAD Design Basics', duration: 'Week 1' },
    { title: 'Slicing & G-Code', duration: 'Week 2' },
    { title: 'Industrial Polymers', duration: 'Week 3' },
    { title: 'Rapid Prototyping', duration: 'Week 4' }
  ],
  'iot': [
    { title: 'Arduino & Sensors', duration: 'Week 1-2' },
    { title: 'Edge Computing', duration: 'Week 3' },
    { title: 'Cloud Integration (AWS)', duration: 'Week 4' },
    { title: 'Smart Factory Project', duration: 'Week 5' }
  ],
  'robotics': [
    { title: 'Robotics Kinematics', duration: 'Week 1-2' },
    { title: 'PLC Programming', duration: 'Week 3-4' },
    { title: 'Computer Vision', duration: 'Week 5-6' },
    { title: 'Industrial Arm Automation', duration: 'Week 7-8' }
  ]
};

export default function InternshipDashboardPage() {
  const { purchases } = useInternship();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (purchases.length === 0) {
    return (
      <div style={{ padding: '150px 20px', textAlign: 'center', minHeight: '80vh' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Your Dashboard is Empty</h2>
        <p style={{ opacity: 0.8, marginBottom: '30px' }}>You haven't enrolled in any internships yet.</p>
        <Link to="/internships" style={{ background: '#00ffff', color: '#000', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
          Explore Internships
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '120px 20px 80px', maxWidth: '1200px', margin: '0 auto', minHeight: '85vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
        <FaGraduationCap size={40} color="#00ffff" />
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>My Learning Dashboard</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {purchases.map((course, idx) => {
          const startDate = new Date(course.purchaseDate);
          const endDate = new Date(startDate);
          // Extract number of weeks from duration string like "4 Weeks"
          const weeksMatch = course.duration.match(/(\d+)/);
          const weeks = weeksMatch ? parseInt(weeksMatch[1], 10) : 4;
          endDate.setDate(endDate.getDate() + (weeks * 7));

          const curriculum = CURRICULUM_DATA[course.id] || CURRICULUM_DATA['ai-ml'];

          return (
            <motion.div 
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${course.color}55`,
                borderRadius: '24px',
                padding: '40px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Decorative top border */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: course.color }} />

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', gap: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>{course.title}</h2>
                  <div style={{ display: 'flex', gap: '20px', opacity: 0.8, fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FaCalendarAlt /> Started: {startDate.toLocaleDateString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FaCalendarAlt /> Target End: {endDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900', color: course.color }}>{course.progress}%</div>
                  <div style={{ opacity: 0.8, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Progress</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '40px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${course.progress}%` }} 
                  transition={{ duration: 1, delay: 0.5 }}
                  style={{ height: '100%', background: course.color, borderRadius: '4px' }} 
                />
              </div>

              {/* Curriculum Tracker */}
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                Curriculum & Milestones
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                {curriculum.map((topic, index) => {
                  // Simulate progress check based on course.progress
                  const threshold = (index / curriculum.length) * 100;
                  const isCompleted = course.progress > threshold;
                  
                  return (
                    <div key={index} style={{ 
                      display: 'flex', 
                      gap: '15px', 
                      background: isCompleted ? `${course.color}11` : 'rgba(0,0,0,0.2)',
                      padding: '20px',
                      borderRadius: '12px',
                      border: `1px solid ${isCompleted ? `${course.color}44` : 'rgba(255,255,255,0.05)'}`,
                      opacity: isCompleted ? 1 : 0.6
                    }}>
                      <div style={{ marginTop: '2px' }}>
                        {isCompleted ? <FaCheckCircle color={course.color} size={20} /> : <FaCircle color="rgba(255,255,255,0.2)" size={20} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: course.color, marginBottom: '5px', fontWeight: 'bold' }}>{topic.duration}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{topic.title}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interview Prep Note */}
              <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(0, 255, 255, 0.05)', borderRadius: '12px', borderLeft: '4px solid #00ffff' }}>
                <h4 style={{ color: '#00ffff', marginBottom: '5px' }}>Interview Prep Path</h4>
                <p style={{ opacity: 0.8, fontSize: '0.9rem', margin: 0 }}>
                  Topics covered in this internship map directly to industry requirements for roles in <strong>{course.title}</strong>. Complete all modules to unlock the final mock interview simulation!
                </p>
              </div>

            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

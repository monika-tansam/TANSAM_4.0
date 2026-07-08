import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useInternship } from '../context/InternshipContext';
import { FaTrash, FaCheckCircle, FaSpinner } from 'react-icons/fa';

export default function InternshipCheckoutPage() {
  const { cart, removeFromCart, checkout } = useInternship();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const total = cart.reduce((acc, curr) => acc + curr.price, 0);

  const handlePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate a fake payment processing delay
    setTimeout(() => {
      checkout(); // Commits to context & localStorage
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Redirect to dashboard after showing success
      setTimeout(() => {
        navigate('/internships/dashboard');
      }, 2000);
    }, 2500);
  };

  if (cart.length === 0 && !isSuccess) {
    return (
      <div style={{ padding: '150px 20px', textAlign: 'center', minHeight: '80vh' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Your Cart is Empty</h2>
        <p style={{ opacity: 0.8, marginBottom: '30px' }}>Looks like you haven't added any internships yet.</p>
        <Link to="/internships" style={{ background: '#00ffff', color: '#000', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
          Browse Catalog
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div style={{ padding: '150px 20px', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <FaCheckCircle color="#00ff88" size={80} style={{ marginBottom: '20px' }} />
        </motion.div>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Payment Successful!</h2>
        <p style={{ opacity: 0.8 }}>Redirecting you to your internship dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '120px 20px 80px', maxWidth: '1000px', margin: '0 auto', minHeight: '85vh' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
        Checkout
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
        
        {/* Cart Items */}
        <div>
          <h3 style={{ marginBottom: '20px', fontSize: '1.4rem' }}>Order Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cart.map((item) => (
              <div key={item.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                background: 'var(--glass-bg)',
                padding: '20px',
                borderRadius: '16px',
                border: `1px solid ${item.color}44`
              }}>
                <div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{item.title}</h4>
                  <span style={{ color: item.color, fontWeight: 'bold' }}>₹{item.price}</span>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '10px' }}
                  title="Remove from Cart"
                >
                  <FaTrash size={18} />
                </button>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 'bold' }}>
            <span>Total:</span>
            <span>₹{total}</span>
          </div>
        </div>

        {/* Payment Form */}
        <div>
          <h3 style={{ marginBottom: '20px', fontSize: '1.4rem' }}>Payment Details</h3>
          <form onSubmit={handlePayment} style={{ 
            background: 'var(--glass-bg)', 
            padding: '30px', 
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', opacity: 0.8 }}>Full Name</label>
              <input type="text" required placeholder="John Doe" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-color)' }} />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', opacity: 0.8 }}>Email Address</label>
              <input type="email" required placeholder="john@example.com" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-color)' }} />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '8px', opacity: 0.8 }}>Mock Card Number</label>
              <input type="text" required placeholder="XXXX-XXXX-XXXX-XXXX" defaultValue="4242-4242-4242-4242" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-color)' }} />
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              style={{
                width: '100%',
                background: isProcessing ? '#555' : '#00ffff',
                color: '#000',
                padding: '15px',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                border: 'none',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              {isProcessing ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><FaSpinner /></motion.div> : `Pay ₹${total}`}
            </button>
            <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.8rem', opacity: 0.6 }}>This is a simulated payment gateway. No real charges are made.</p>
          </form>
        </div>

      </div>
    </div>
  );
}

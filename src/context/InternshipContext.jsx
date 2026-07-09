import React, { createContext, useState, useEffect, useContext } from 'react';

const InternshipContext = createContext();

export const useInternship = () => useContext(InternshipContext);

export const InternshipProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('internship_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [purchases, setPurchases] = useState(() => {
    try {
      const saved = localStorage.getItem('internship_purchases');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('internship_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('internship_purchases', JSON.stringify(purchases));
  }, [purchases]);

  const addToCart = (course) => {
    setCart((prev) => {
      if (prev.find(item => item.id === course.id)) return prev;
      return [...prev, course];
    });
  };

  const removeFromCart = (courseId) => {
    setCart((prev) => prev.filter(item => item.id !== courseId));
  };

  const checkout = () => {
    if (cart.length === 0) return;
    
    const newPurchases = cart.map(item => ({
      ...item,
      purchaseDate: new Date().toISOString(),
      progress: 0,
      status: 'Enrolled'
    }));
    
    setPurchases(prev => {
      const existingIds = prev.map(p => p.id);
      const uniqueNew = newPurchases.filter(p => !existingIds.includes(p.id));
      return [...prev, ...uniqueNew];
    });
    
    setCart([]);
  };

  return (
    <InternshipContext.Provider value={{ cart, purchases, addToCart, removeFromCart, checkout }}>
      {children}
    </InternshipContext.Provider>
  );
};

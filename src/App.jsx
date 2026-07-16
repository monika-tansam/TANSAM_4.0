import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ChatWidget from './components/ChatWidget';

const HomePage = lazy(() => import('./pages/HomePage'));
const LabsPage = lazy(() => import('./pages/LabsPage'));
const LabDetailsPage = lazy(() => import('./pages/LabDetailsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const StudentSuccessPage = lazy(() => import('./pages/StudentSuccessPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
      <BrowserRouter>
        <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
          <Routes>
            <Route path="/" element={<MainLayout theme={theme} toggleTheme={toggleTheme} />}>
              <Route index element={<HomePage theme={theme} />} />
              <Route path="labs" element={<LabsPage theme={theme} />} />
              <Route path="labs/:id" element={<LabDetailsPage theme={theme} />} />
              <Route path="contact" element={<ContactPage theme={theme} />} />
              <Route path="success" element={<StudentSuccessPage theme={theme} />} />
              <Route path="news" element={<NewsPage theme={theme} />} />
            </Route>
          </Routes>
        </Suspense>
        <ChatWidget />
      </BrowserRouter>
  );
}

export default App;

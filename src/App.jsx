import React, { useState, useEffect, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ChatWidget from './components/ChatWidget';

const HomePage = lazy(() => import('./pages/HomePage'));
const LabsPage = lazy(() => import('./pages/LabsPage'));
const LabDetailsPage = lazy(() => import('./pages/LabDetailsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const StudentSuccessPage = lazy(() => import('./pages/StudentSuccessPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const SkillingPage = lazy(() => import('./pages/SkillingPage'));
const CorporateSkillingPage = lazy(() => import('./pages/CorporateSkillingPage'));
const AcademiaSkillingPage = lazy(() => import('./pages/AcademiaSkillingPage'));
const NaanmudhalvanPage = lazy(() => import('./pages/NaanmudhalvanPage'));

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
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
          <Routes>
            <Route path="/" element={<MainLayout theme={theme} toggleTheme={toggleTheme} />}>
              <Route index element={<HomePage theme={theme} />} />
              <Route path="labs" element={<LabsPage theme={theme} />} />
              <Route path="labs/:id" element={<LabDetailsPage theme={theme} />} />
              <Route path="contact" element={<ContactPage theme={theme} />} />
              <Route path="success" element={<StudentSuccessPage theme={theme} />} />
              <Route path="news" element={<NewsPage theme={theme} />} />
              <Route path="skilling" element={<SkillingPage />} />
              <Route path="skilling/corporate" element={<CorporateSkillingPage />} />
              <Route path="skilling/academia" element={<AcademiaSkillingPage />} />
              <Route path="skilling/naanmudhalvan" element={<NaanmudhalvanPage />} />
              <Route path="skilling/naan-mudhalvan" element={<Navigate to="/skilling/naanmudhalvan" replace />} />
            </Route>
          </Routes>
        <ChatWidget />
      </BrowserRouter>
  );
}

export default App;

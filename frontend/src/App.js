// frontend/src/App.js
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import OfflineIndicator from './components/OfflineIndicator';
import './App.css';

// Lazy load components
const NotesList = lazy(() => import('./components/NotesList'));
const NoteDetail = lazy(() => import('./components/NoteDetail'));

// Loading component
const LoadingFallback = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Get stored preference or default to true
    return localStorage.getItem('darkMode') !== 'false';
  });

  useEffect(() => {
    // Dark mode handling
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
    localStorage.setItem('darkMode', darkMode);
    
    // Keyboard navigation detection
    function handleFirstTab(e) {
      if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
        window.removeEventListener('keydown', handleFirstTab);
      }
    }
    window.addEventListener('keydown', handleFirstTab);
    
    return () => {
      window.removeEventListener('keydown', handleFirstTab);
    };
  }, [darkMode]);

  return (
    <NotificationProvider>
      <Router>
        <div className="app">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route 
                path="/" 
                element={<NotesList darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />} 
              />
              <Route 
                path="/note/:id" 
                element={<NoteDetail darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />} 
              />
            </Routes>
          </Suspense>
          <OfflineIndicator />
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;
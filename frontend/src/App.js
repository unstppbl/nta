import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NotesList from './components/NotesList';
import NoteDetail from './components/NoteDetail';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
  }, [darkMode]);

  return (
    <Router>
      <div className="app">
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
      </div>
    </Router>
  );
}

export default App;
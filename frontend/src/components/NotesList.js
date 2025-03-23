// src/components/NotesList.js - Complete corrected file
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import SearchBar from './SearchBar';
import SortMenu from './SortMenu';
import '../styles/NotesList.css';

const NotesList = ({ darkMode, toggleDarkMode }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('last_modified');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, [sortBy]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/notes?sort=${sortBy}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      } else {
        console.error('Failed to fetch notes');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Untitled Diary',
          content: '',
        }),
      });

      if (response.ok) {
        const newNote = await response.json();
        navigate(`/note/${newNote.id}`);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleNoteClick = (id) => {
    navigate(`/note/${id}`);
  };

  const handleSearch = async (query) => {
    try {
      setLoading(true);
      if (query.trim() === '') {
        fetchNotes();
        return;
      }

      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error searching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSortMenu = () => {
    setShowSortMenu(!showSortMenu);
  };

  const handleSort = (sortOption) => {
    setSortBy(sortOption);
    setShowSortMenu(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'h:mm a');
  };

  const groupNotesByDate = () => {
    const grouped = {};
    
    notes.forEach(note => {
      const date = new Date(note.created_at);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(note);
    });
    
    return grouped;
  };

  const groupedNotes = groupNotesByDate();
  const dateLabels = {
    [format(new Date(), 'yyyy-MM-dd')]: 'Today',
    [format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')]: 'Yesterday',
  };

  return (
    <div className="notes-list-container">
      <header className="notes-header">
        <h1>notetime</h1>
        <div className="header-controls">
          <div className="sort-container">
            <button className="filter-button" onClick={toggleSortMenu}>
              <span className="filter-icon">↓</span>
            </button>
            {showSortMenu && (
              <SortMenu onSort={handleSort} currentSort={sortBy} />
            )}
          </div>
          <button className="icon-button" onClick={toggleDarkMode}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <SearchBar onSearch={handleSearch} />

      {loading ? (
        <div className="loading">Loading notes...</div>
      ) : (
        <div className="notes-content">
          {Object.keys(groupedNotes).length === 0 ? (
            <div className="no-notes">No notes found. Create your first note!</div>
          ) : (
            Object.keys(groupedNotes).sort((a, b) => new Date(b) - new Date(a)).map(dateKey => (
              <div key={dateKey} className="date-section">
                <h2 className="date-heading">{dateLabels[dateKey] || format(new Date(dateKey), 'MMMM d, yyyy')}</h2>
                <div className="notes-grid">
                  {groupedNotes[dateKey].map(note => (
                    <div
                      key={note.id}
                      className="note-card"
                      onClick={() => handleNoteClick(note.id)}
                    >
                      <h3 className="note-title">{note.title}</h3>
                      <p className="note-time">{formatDate(note.created_at)}</p>
                      <p className="note-preview">
                        {note.content.length > 100 
                          ? `${note.content.substring(0, 100)}...` 
                          : note.content || "Start writing..."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <button className="create-note-button" onClick={handleCreateNote}>
        +
      </button>
      
      <footer className="notes-footer">
        <p>Something broken? Have suggestions?</p>
        <div className="contact-links">
          <span>CONTACT:</span>
          <a href="mailto:example@notetime.app">Email</a>
          <span>•</span>
          <a href="https://twitter.com/notetime">X (Twitter)</a>
        </div>
        <div className="discuss-links">
          <span>DISCUSS:</span>
          <a href="https://reddit.com/r/notetime">Reddit</a>
          <span>•</span>
          <a href="https://news.ycombinator.com/item?id=12345678">Hacker News</a>
        </div>
      </footer>
    </div>
  );
};

export default NotesList;
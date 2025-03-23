// frontend/src/components/NotesList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import SearchBar from './SearchBar';
import SortMenu from './SortMenu';
import NoteCard from './NoteCard';
import ThemeToggle from './ThemeToggle';
import Pagination from './Pagination';
import KeyboardShortcutsDialog from './KeyboardShortcutsDialog';
import { useNotification } from '../context/NotificationContext';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import '../styles/NotesList.css';

const NotesList = ({ darkMode, toggleDarkMode }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('last_modified');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const NOTES_PER_PAGE = 10; // Number of notes to display per page
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchNotes();
  }, [sortBy]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notes?sort=${sortBy}`);
      if (response.ok) {
        const data = await response.json();
        
        // Calculate pagination
        setTotalPages(Math.max(1, Math.ceil(data.length / NOTES_PER_PAGE)));
        if (currentPage > Math.ceil(data.length / NOTES_PER_PAGE)) {
          setCurrentPage(1); // Reset to first page if current page is now invalid
        }
        
        setNotes(data);
      } else {
        console.error('Failed to fetch notes');
        showNotification('Failed to fetch notes', 'error');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      showNotification('Error fetching notes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      showNotification('Creating new note...', 'info');
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
        showNotification('Note created successfully!', 'success');
        navigate(`/note/${newNote.id}`);
      } else {
        showNotification('Failed to create note', 'error');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      showNotification('Error creating note', 'error');
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

      showNotification(`Searching for "${query}"...`, 'info');
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
        showNotification(`Found ${data.length} results`, 'success');
      }
    } catch (error) {
      console.error('Error searching notes:', error);
      showNotification('Error searching notes', 'error');
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

  // Helper function to paginate the notes
  const getPaginatedNotes = () => {
    const startIndex = (currentPage - 1) * NOTES_PER_PAGE;
    const endIndex = startIndex + NOTES_PER_PAGE;
    return notes.slice(startIndex, endIndex);
  };

  const groupNotesByDate = (notesToGroup) => {
    const grouped = {};
    
    notesToGroup.forEach(note => {
      const date = new Date(note.created_at);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(note);
    });
    
    return grouped;
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      action: handleCreateNote
    },
    {
      key: '?',
      action: () => setShowShortcutsDialog(true)
    },
    {
      key: 'Escape',
      action: () => {
        if (showShortcutsDialog) setShowShortcutsDialog(false);
        if (showSortMenu) setShowSortMenu(false);
      }
    },
    {
      key: '/',
      metaKey: true,
      action: () => {
        // Focus search input
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) searchInput.focus();
      }
    },
    {
      key: 'd',
      metaKey: true,
      action: (e) => {
        e?.preventDefault();
        toggleDarkMode();
      }
    }
  ]);

  // Use the paginated notes for display
  const paginatedNotes = getPaginatedNotes();
  const groupedNotes = groupNotesByDate(paginatedNotes);
  const dateLabels = {
    [format(new Date(), 'yyyy-MM-dd')]: 'Today',
    [format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')]: 'Yesterday',
  };

  return (
    <div className="notes-list-container">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <header className="notes-header">
        <h1>notetime</h1>
        <div className="header-controls">
          <button 
            className="icon-button"
            onClick={() => setShowShortcutsDialog(true)}
            aria-label="View keyboard shortcuts"
          >
            ?
          </button>
          <div className="sort-container">
            <button 
              className="filter-button" 
              onClick={toggleSortMenu}
              aria-expanded={showSortMenu}
              aria-haspopup="true"
              aria-label="Sort options"
            >
              <span className="filter-icon" aria-hidden="true">↓</span>
            </button>
            {showSortMenu && (
              <SortMenu onSort={handleSort} currentSort={sortBy} />
            )}
          </div>
          <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </div>
      </header>

      <SearchBar onSearch={handleSearch} />

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading notes...</p>
        </div>
      ) : (
        <div id="main-content" className="notes-content">
          {Object.keys(groupedNotes).length === 0 ? (
            <div className="no-notes">No notes found. Create your first note!</div>
          ) : (
            Object.keys(groupedNotes)
              .sort((a, b) => new Date(b) - new Date(a))
              .map(dateKey => (
                <div key={dateKey} className="date-section">
                  <h2 className="date-heading">
                    {dateLabels[dateKey] || format(new Date(dateKey), 'MMMM d, yyyy')}
                  </h2>
                  <div className="notes-grid">
                    {groupedNotes[dateKey].map(note => (
                      <NoteCard 
                        key={note.id} 
                        note={note} 
                        onClick={handleNoteClick} 
                      />
                    ))}
                  </div>
                </div>
              ))
          )}
          
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              // Scroll to top when changing pages
              window.scrollTo(0, 0);
            }}
          />
        </div>
      )}

      <button 
        className="create-note-button" 
        onClick={handleCreateNote}
        aria-label="Create new note"
      >
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

      <KeyboardShortcutsDialog 
        isOpen={showShortcutsDialog} 
        onClose={() => setShowShortcutsDialog(false)} 
      />
    </div>
  );
};

export default NotesList;
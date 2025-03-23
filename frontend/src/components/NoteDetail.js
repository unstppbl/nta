// frontend/src/components/NoteDetail.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import ThemeToggle from './ThemeToggle';
import CharacterCounter from './CharacterCounter';
import ConfirmationDialog from './ConfirmationDialog';
import KeyboardShortcutsDialog from './KeyboardShortcutsDialog';
import { useNotification } from '../context/NotificationContext';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import '../styles/NoteDetail.css';

const NoteDetail = ({ darkMode, toggleDarkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLine, setCurrentLine] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const inputRef = useRef(null);
  const titleInputRef = useRef(null);
  const { showNotification } = useNotification();

  const MAX_LINE_LENGTH = 500; // Maximum characters per line

  useEffect(() => {
    fetchNote();
    fetchLines();
  }, [id]);
  
  useEffect(() => {
    if (note) {
      setNoteTitle(note.title || 'Untitled Diary');
    }
  }, [note]);
  
  // Auto-scroll to the most recent line
  useEffect(() => {
    if (lines.length > 0) {
      const noteContent = document.querySelector('.note-content');
      if (noteContent) {
        noteContent.scrollTop = noteContent.scrollHeight;
      }
    }
  }, [lines]);

  const fetchNote = async () => {
    try {
      const response = await fetch(`/api/notes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setNote(data);
      } else if (response.status === 404) {
        navigate('/');
        showNotification('Note not found', 'error');
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      showNotification('Error loading note', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLines = async () => {
    try {
      const response = await fetch(`/api/notes/${id}/lines`);
      if (response.ok) {
        const data = await response.json();
        setLines(data);
      }
    } catch (error) {
      console.error('Error fetching lines:', error);
      showNotification('Error loading note lines', 'error');
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };
  
  const handleTitleClick = () => {
    setIsEditingTitle(true);
    setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.focus();
      }
    }, 10);
  };
  
  const handleTitleUpdate = async () => {
    setIsEditingTitle(false);
    
    if (noteTitle === note.title) return;
    
    try {
      showNotification('Updating title...', 'info');
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...note,
          title: noteTitle,
        }),
      });
      
      if (response.ok) {
        const updatedNote = await response.json();
        setNote(updatedNote);
        showNotification('Title updated successfully', 'success');
      } else {
        showNotification('Failed to update title', 'error');
      }
    } catch (error) {
      console.error('Error updating note title:', error);
      showNotification('Error updating title', 'error');
    }
  };

  const handleDeleteNote = async () => {
    try {
      showNotification('Deleting note...', 'info');
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        showNotification('Note deleted successfully', 'success');
        navigate('/');
      } else {
        showNotification('Failed to delete note', 'error');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      showNotification('Error deleting note', 'error');
    }
  };

  const formatTimestamp = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm:ss');
  };

  const handleLineSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentLine.trim()) return;
    
    try {
      const response = await fetch(`/api/notes/${id}/lines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentLine,
        }),
      });

      if (response.ok) {
        const newLine = await response.json();
        setLines([...lines, newLine]);
        setCurrentLine('');
        
        // Scroll to the bottom after adding a new line
        setTimeout(() => {
          const noteContent = document.querySelector('.note-content');
          if (noteContent) {
            noteContent.scrollTop = noteContent.scrollHeight;
          }
        }, 100);
      } else {
        showNotification('Failed to add line', 'error');
      }
    } catch (error) {
      console.error('Error adding line:', error);
      showNotification('Error adding line', 'error');
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'Escape',
      action: () => {
        if (showShortcutsDialog) {
          setShowShortcutsDialog(false);
        } else if (showDeleteDialog) {
          setShowDeleteDialog(false);
        } else if (isEditingTitle) {
          setIsEditingTitle(false);
          setNoteTitle(note.title); // Reset to original title
        } else {
          // Go back to notes list if no dialog is open
          handleGoBack();
        }
      }
    },
    {
      key: '?',
      action: () => setShowShortcutsDialog(true)
    },
    {
      key: 'e',
      metaKey: true,
      action: (e) => {
        e?.preventDefault();
        handleTitleClick();
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

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading note...</p>
    </div>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="note-detail-container">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <header className="note-detail-header">
        <button 
          className="back-button" 
          onClick={handleGoBack}
          aria-label="Go back to notes list"
        >
          <span aria-hidden="true">←</span>
        </button>
        
        {isEditingTitle ? (
          <input
            type="text"
            ref={titleInputRef}
            className="note-title-input"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            onBlur={handleTitleUpdate}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleUpdate()}
          />
        ) : (
          <h2 
            className="note-title" 
            onClick={handleTitleClick}
            role="button"
            tabIndex="0"
            aria-label="Edit note title"
            onKeyDown={(e) => e.key === 'Enter' && handleTitleClick()}
          >
            {noteTitle}
          </h2>
        )}
        
        <div className="header-controls">
          <button 
            className="icon-button delete-button" 
            onClick={() => setShowDeleteDialog(true)}
            aria-label="Delete note"
          >
            🗑️
          </button>
          <button 
            className="icon-button"
            onClick={() => setShowShortcutsDialog(true)}
            aria-label="View keyboard shortcuts"
          >
            ?
          </button>
          <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </div>
      </header>

      <div id="main-content" className="note-content">
        {lines.length === 0 ? <div className="today-label">Today</div> : null}
        
        <div className="lines-container">
          {lines.map((line) => (
            <div key={line.id} className="line-item">
              <span className="line-timestamp">{formatTimestamp(line.timestamp)}</span>
              <span className="line-content">{line.content}</span>
            </div>
          ))}
          
          {/* Input form positioned right after the last line */}
          <form onSubmit={handleLineSubmit} className="line-input-form">
            <div className="line-input-container">
              <span className="input-timestamp">{format(new Date(), 'HH:mm:ss')}</span>
              <div className="input-wrapper">
                <input
                  type="text"
                  ref={inputRef}
                  value={currentLine}
                  onChange={(e) => setCurrentLine(e.target.value)}
                  placeholder="Start writing..."
                  className="line-input"
                  aria-label="Enter note line"
                  maxLength={MAX_LINE_LENGTH}
                  autoFocus
                />
                <CharacterCounter current={currentLine.length} limit={MAX_LINE_LENGTH} />
              </div>
            </div>
          </form>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteNote}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="warning"
      />

      <KeyboardShortcutsDialog 
        isOpen={showShortcutsDialog} 
        onClose={() => setShowShortcutsDialog(false)} 
      />
    </div>
  );
};

export default NoteDetail;
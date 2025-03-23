import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
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
  const inputRef = useRef(null);
  const titleInputRef = useRef(null);

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
      }
    } catch (error) {
      console.error('Error fetching note:', error);
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
      }
    } catch (error) {
      console.error('Error updating note title:', error);
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
      }
    } catch (error) {
      console.error('Error adding line:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading note...</div>;
  }

  return (
          <div className="note-detail-container">
      <header className="note-detail-header">
        <button className="back-button" onClick={handleGoBack}>
          ←
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
          <h2 className="note-title" onClick={handleTitleClick}>
            {noteTitle}
          </h2>
        )}
        <div className="header-controls">
          <button className="icon-button" onClick={toggleDarkMode}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <div className="note-content">
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
              <input
                type="text"
                ref={inputRef}
                value={currentLine}
                onChange={(e) => setCurrentLine(e.target.value)}
                placeholder="Start writing..."
                className="line-input"
                autoFocus
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NoteDetail;

// frontend/src/components/NoteCard.js
import React, { memo } from 'react';
import { format } from 'date-fns';

const NoteCard = memo(({ note, onClick }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'h:mm a');
  };
  
  return (
    <div
      className="note-card"
      onClick={() => onClick(note.id)}
    >
      <h3 className="note-title">{note.title}</h3>
      <p className="note-time">{formatDate(note.created_at)}</p>
      <p className="note-preview">
        {note.content.length > 100 
          ? `${note.content.substring(0, 100)}...` 
          : note.content || "Start writing..."}
      </p>
    </div>
  );
});

export default NoteCard;
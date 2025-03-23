-- SQLite database schema for notetime app

-- Notes table to store the main note entries
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,               -- Title of the note, defaults to "Untitled Diary"
    content TEXT,             -- Full content of the note (if storing as a single field)
    created_at TIMESTAMP,     -- When the note was created
    last_modified TIMESTAMP   -- When the note was last modified
);

-- Lines table to store individual timestamped lines within a note
CREATE TABLE IF NOT EXISTS lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id INTEGER,          -- Foreign key reference to the parent note
    content TEXT,             -- Content of the individual line
    timestamp TIMESTAMP,      -- Timestamp when this line was created
    FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes (created_at);
CREATE INDEX IF NOT EXISTS idx_notes_last_modified ON notes (last_modified);
CREATE INDEX IF NOT EXISTS idx_lines_note_id ON lines (note_id);
CREATE INDEX IF NOT EXISTS idx_lines_timestamp ON lines (timestamp);

-- Sample data for testing
INSERT INTO notes (title, created_at, last_modified) VALUES 
    ('Untitled Diary', datetime('now'), datetime('now')),
    ('trying the note taking app that I wanted', datetime('now', '-1 hour'), datetime('now', '-1 hour'));

-- Sample lines for the "trying the note taking app" note
INSERT INTO lines (note_id, content, timestamp) VALUES
    (2, 'trying the note taking app that I wanted', datetime('now', '-1 hour')),
    (2, 'it''s 11:35 note', datetime('now', '-50 minutes')),
    (2, 'every new line creates with timestamp on the left side', datetime('now', '-45 minutes'));
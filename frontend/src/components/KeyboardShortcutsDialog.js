// frontend/src/components/KeyboardShortcutsDialog.js
import React from 'react';
import '../styles/KeyboardShortcutsDialog.css';

const KeyboardShortcutsDialog = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['n'], description: 'Create new note' },
    { keys: ['?'], description: 'Show keyboard shortcuts' },
    { keys: ['Esc'], description: 'Close dialog / Cancel current action' },
    { keys: ['↑', '↓'], description: 'Navigate through notes' },
    { keys: ['Enter'], description: 'Open selected note' },
    { keys: ['⌘', 'S'], description: 'Save current note' },
    { keys: ['⌘', '/'], description: 'Focus search' },
    { keys: ['⌘', 'D'], description: 'Toggle dark/light mode' },
    { keys: ['⌘', 'E'], description: 'Edit note title' },
  ];

  const formatKey = (key) => {
    switch (key) {
      case 'meta':
        return '⌘';
      case 'alt':
        return 'Option';
      case 'ctrl':
        return 'Ctrl';
      case 'shift':
        return 'Shift';
      default:
        return key;
    }
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="shortcuts-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2>Keyboard Shortcuts</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="shortcuts-content">
          <table className="shortcuts-table">
            <tbody>
              {shortcuts.map((shortcut, index) => (
                <tr key={index} className="shortcut-row">
                  <td className="shortcut-keys">
                    {shortcut.keys.map((key, keyIndex) => (
                      <React.Fragment key={keyIndex}>
                        <kbd>{formatKey(key)}</kbd>
                        {keyIndex < shortcut.keys.length - 1 && ' + '}
                      </React.Fragment>
                    ))}
                  </td>
                  <td className="shortcut-description">{shortcut.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsDialog;
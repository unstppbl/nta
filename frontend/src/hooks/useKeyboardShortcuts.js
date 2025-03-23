// frontend/src/hooks/useKeyboardShortcuts.js
import { useEffect } from 'react';

const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignore shortcuts when user is typing in an input or textarea
      if (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable
      ) {
        return;
      }

      // Check for matches
      shortcuts.forEach(({ key, metaKey, ctrlKey, altKey, shiftKey, action }) => {
        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          !!event.metaKey === !!metaKey &&
          !!event.ctrlKey === !!ctrlKey &&
          !!event.altKey === !!altKey &&
          !!event.shiftKey === !!shiftKey
        ) {
          event.preventDefault();
          action(event);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};

export default useKeyboardShortcuts;
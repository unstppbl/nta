import React from 'react';
import '../styles/SortMenu.css';

const SortMenu = ({ onSort, currentSort }) => {
  return (
    <div className="sort-menu">
      <button
        className={`sort-option ${currentSort === 'last_modified' ? 'active' : ''}`}
        onClick={() => onSort('last_modified')}
      >
        Sort by last modified
      </button>
      <button
        className={`sort-option ${currentSort === 'creation_date' ? 'active' : ''}`}
        onClick={() => onSort('creation_date')}
      >
        Sort by creation date
      </button>
    </div>
  );
};

export default SortMenu;
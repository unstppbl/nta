// frontend/src/components/Pagination.js
import React from 'react';
import '../styles/Pagination.css';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Create page numbers with ellipsis for large page counts
  const renderPageNumbers = () => {
    const pages = [];
    
    if (totalPages <= 5) {
      // Show all pages if 5 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first and last page
      pages.push(1);
      
      // Show ellipsis and nearby pages
      if (currentPage <= 3) {
        pages.push(2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push('...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages.map((page, index) => {
      if (page === '...') {
        return <span key={`ellipsis-${index}`} className="ellipsis">...</span>;
      }
      
      return (
        <button
          key={page}
          className={`page-number ${currentPage === page ? 'active' : ''}`}
          onClick={() => onPageChange(page)}
          aria-label={`Page ${page}`}
          aria-current={currentPage === page ? 'page' : null}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className="pagination">
      <button 
        className="pagination-button" 
        onClick={handlePrevious}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        ←
      </button>
      
      <div className="page-numbers">
        {renderPageNumbers()}
      </div>
      
      <button 
        className="pagination-button" 
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        →
      </button>
    </div>
  );
};

export default Pagination;
import React from 'react';
import './TranslationHistoryItem.css';

const TranslationHistoryItem = ({ item, onDelete, onReuse }) => {
  const formattedDate = new Date(item.timestamp).toLocaleString();
  
  return (
    <div className={`translation-history-item ${item.pending ? 'pending' : ''} ${item.deleting ? 'deleting' : ''}`}>
      <div className="translation-history-content">
        <div className="translation-text-wrapper">
          <div className="translation-source">
            <span className="language-label">{item.sourceLanguage}</span>
            <p>{item.sourceText}</p>
          </div>
          <div className="translation-arrow">→</div>
          <div className="translation-target">
            <span className="language-label">{item.targetLanguage}</span>
            <p>{item.translatedText}</p>
          </div>
        </div>
        
        <div className="translation-metadata">
          <span className="translation-timestamp">{formattedDate}</span>
          {item.pending && <span className="pending-indicator">Saving...</span>}
          {item.deleting && <span className="deleting-indicator">Deleting...</span>}
        </div>
      </div>
      
      <div className="translation-actions">
        <button 
          className="reuse-button" 
          onClick={() => onReuse(item)} 
          disabled={item.deleting}
        >
          Reuse
        </button>
        <button 
          className="delete-button" 
          onClick={() => onDelete(item.id)} 
          disabled={item.deleting}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TranslationHistoryItem;

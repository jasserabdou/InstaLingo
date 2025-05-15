import React, { useState } from 'react';
import { useTranslationHistory } from '../hooks/useTranslationHistory';
import VirtualList from './VirtualList';
import SkeletonLoader from './SkeletonLoader';
import TranslationHistoryItem from './TranslationHistoryItem';
import './TranslationHistory.css';

const TranslationHistory = ({ userId, onReuseTranslation }) => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  
  const {
    history,
    isLoading,
    error,
    hasMore,
    loadMore,
    deleteTranslation,
    clearHistory,
    refreshHistory
  } = useTranslationHistory(userId);

  const handleReuse = (item) => {
    if (onReuseTranslation) {
      onReuseTranslation(item);
    }
  };

  const handleDelete = (id) => {
    deleteTranslation(id);
  };

  const handleClearAll = () => {
    clearHistory();
    setShowConfirmClear(false);
  };

  const renderHistoryItem = (item) => (
    <TranslationHistoryItem
      item={item}
      onDelete={handleDelete}
      onReuse={handleReuse}
    />
  );

  return (
    <div className="translation-history-container">
      <header className="translation-history-header">
        <h2>Translation History</h2>
        <div className="translation-history-actions">
          <button className="refresh-button" onClick={refreshHistory}>
            Refresh
          </button>
          <button 
            className="clear-all-button" 
            onClick={() => setShowConfirmClear(true)}
            disabled={isLoading || history.length === 0}
          >
            Clear All
          </button>
        </div>
      </header>
      
      {showConfirmClear && (
        <div className="confirm-clear-dialog">
          <p>Are you sure you want to clear all your translation history?</p>
          <div className="confirm-buttons">
            <button className="confirm-clear" onClick={handleClearAll}>
              Yes, Clear All
            </button>
            <button className="cancel-clear" onClick={() => setShowConfirmClear(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <div className="translation-history-list">
        {isLoading && history.length === 0 ? (
          <SkeletonLoader type="card" count={5} className="history-item-skeleton" />
        ) : error ? (
          <div className="history-error">
            <p>Error loading translation history</p>
            <button onClick={refreshHistory}>Try Again</button>
          </div>
        ) : history.length === 0 ? (
          <div className="empty-history-message">
            <p>No translation history found</p>
          </div>
        ) : (
          <VirtualList
            items={history}
            itemHeight={120}
            windowHeight={500}
            renderItem={renderHistoryItem}
            onEndReached={hasMore ? loadMore : null}
            className="history-virtual-list"
          />
        )}
        
        {isLoading && history.length > 0 && (
          <div className="loading-more">
            <SkeletonLoader type="text" count={1} width="100%" height="20px" />
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationHistory;

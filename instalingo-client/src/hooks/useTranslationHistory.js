import { useState, useEffect, useCallback } from 'react';
import translationHistoryService from '../services/translationHistoryService';
import { optimisticUpdate } from '../utils/optimisticUpdate';

export function useTranslationHistory(userId) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [pageInfo, setPageInfo] = useState({
    limit: 20,
    offset: 0
  });

  // Load initial history
  const loadHistory = useCallback(async (reset = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newOffset = reset ? 0 : pageInfo.offset;
      
      const data = await translationHistoryService.getTranslationHistory(
        userId, 
        pageInfo.limit, 
        newOffset
      );
      
      setHistory(prevHistory => {
        // If reset or first load, replace the data
        if (reset || newOffset === 0) {
          return data.translations;
        }
        // Otherwise append to existing data
        return [...prevHistory, ...data.translations];
      });
      
      setHasMore(data.translations.length === pageInfo.limit);
      setPageInfo(prev => ({
        ...prev,
        offset: newOffset + data.translations.length
      }));
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, pageInfo.limit, pageInfo.offset]);

  // Load more history items
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadHistory();
    }
  }, [isLoading, hasMore, loadHistory]);

  // Add translation to history with optimistic update
  const addTranslation = useCallback((translation) => {
    const tempTranslation = {
      ...translation,
      id: `temp_${Date.now()}`,
      userId,
      timestamp: new Date().toISOString(),
      pending: true
    };

    return optimisticUpdate(
      // Optimistic update
      () => setHistory(prev => [tempTranslation, ...prev]),
      
      // Actual action
      async () => {
        await translationHistoryService.saveTranslation({
          ...translation,
          userId
        });
        return translation;
      },
      
      // Rollback data
      history
    );
  }, [userId, history]);

  // Delete translation from history with optimistic update
  const deleteTranslation = useCallback((id) => {
    return optimisticUpdate(
      // Optimistic update
      () => setHistory(prev => prev.map(item => 
        item.id === id ? { ...item, pending: true, deleting: true } : item
      )),
      
      // Actual action
      async () => {
        await translationHistoryService.deleteTranslationHistory(id);
        setHistory(prev => prev.filter(item => item.id !== id));
        return id;
      },
      
      // Rollback data
      history
    );
  }, [history]);

  // Clear all translation history
  const clearHistory = useCallback(() => {
    return optimisticUpdate(
      // Optimistic update
      () => setHistory([]),
      
      // Actual action
      async () => {
        await translationHistoryService.clearAllHistory(userId);
        return true;
      },
      
      // Rollback data
      history
    );
  }, [userId, history]);

  // Set up real-time updates
  useEffect(() => {
    const handleHistoryUpdate = (data) => {
      if (data.action === 'add') {
        // Check if we already have a temporary version of this item
        const tempId = data.item.tempId;
        
        setHistory(prev => {
          // Replace temporary item or add new item at the beginning
          if (tempId && prev.some(item => item.id === tempId)) {
            return prev.map(item => 
              item.id === tempId ? { ...data.item, pending: false } : item
            );
          } else {
            return [data.item, ...prev.filter(item => item.id !== data.item.id)];
          }
        });
      } else if (data.action === 'delete') {
        setHistory(prev => prev.filter(item => item.id !== data.id));
      } else if (data.action === 'clear' && data.userId === userId) {
        setHistory([]);
      }
    };

    // Subscribe to real-time updates
    translationHistoryService.onHistoryUpdate(handleHistoryUpdate);
    
    // Load initial data
    loadHistory(true);
    
    return () => {
      // Cleanup
      translationHistoryService.onHistoryUpdate(null);
    };
  }, [userId, loadHistory]);

  return {
    history,
    isLoading,
    error,
    hasMore,
    loadMore,
    addTranslation,
    deleteTranslation,
    clearHistory,
    refreshHistory: () => loadHistory(true)
  };
}

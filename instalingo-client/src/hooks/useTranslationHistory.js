import { useState, useEffect, useCallback } from "react";
import translationHistoryService from "../services/translationHistoryService";

// LocalStorage key for storing translations
const STORAGE_KEY = "instalingo-translations";

export function useTranslationHistory(userId) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [pageInfo, setPageInfo] = useState({
    limit: 20,
    offset: 0,
  });

  // Load initial history from localStorage
  const loadHistory = useCallback(
    async (reset = false) => {
      try {
        setIsLoading(true);
        setError(null);

        // Load from the service instead of directly from localStorage
        const result = await translationHistoryService.getTranslationHistory(
          userId,
          pageInfo.limit,
          reset ? 0 : pageInfo.offset
        );

        setHistory((prevHistory) => {
          // If reset or first load, replace the data
          if (reset || pageInfo.offset === 0) {
            return result.translations;
          }
          // Otherwise append to existing data
          return [...prevHistory, ...result.translations];
        });

        setHasMore(result.hasMore);
        setPageInfo((prev) => ({
          ...prev,
          offset: reset
            ? result.translations.length
            : prev.offset + result.translations.length,
        }));
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, pageInfo.limit, pageInfo.offset]
  );

  // Load more history items
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadHistory(false);
    }
  }, [isLoading, hasMore, loadHistory]); // Add translation to history
  const addTranslation = useCallback(
    (translation) => {
      // Ensure we have all required fields
      const newTranslation = {
        ...translation,
        id: translation.id || `tr_${Date.now()}`,
        userId: userId || "guest", // Default to guest if no userId
        timestamp: translation.timestamp || new Date().toISOString(),
        pending: true,
      }; // Update local state immediately (optimistic update)
      setHistory((prev) => {
        const updatedHistory = [newTranslation, ...prev];
        return updatedHistory;
      });

      // Use the service to save
      translationHistoryService
        .saveTranslation(newTranslation)
        .then((result) => {
          // Update with the saved translation (removes pending flag)
          setHistory((prev) =>
            prev.map((item) =>
              item.id === newTranslation.id
                ? { ...result.translation, pending: false }
                : item
            )
          );
        })
        .catch((error) => {
          console.error("Failed to save translation:", error);
          // Mark as failed but keep in the list
          setHistory((prev) =>
            prev.map((item) =>
              item.id === newTranslation.id
                ? { ...item, pending: false, error: true }
                : item
            )
          );
        });

      return newTranslation;
    },
    [userId]
  );

  // Delete translation from history
  const deleteTranslation = useCallback(
    (id) => {
      // Update local state optimistically
      setHistory((prev) => prev.filter((item) => item.id !== id));

      // Save to localStorage
      try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const allTranslations = JSON.parse(storedData).filter(
            (item) => item.id !== id
          );
          localStorage.setItem(STORAGE_KEY, JSON.stringify(allTranslations));

          // Also notify websocket service
          translationHistoryService.deleteTranslationHistory(id);
        }
      } catch (error) {
        console.error("Failed to delete translation from localStorage:", error);
        // Revert the optimistic update on error
        loadHistory(true);
      }
    },
    [loadHistory]
  );

  // Clear all translation history
  const clearHistory = useCallback(() => {
    // Update local state optimistically
    setHistory([]);

    // Save to localStorage
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const otherUsersTranslations = JSON.parse(storedData).filter(
          (item) => item.userId !== userId
        );
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(otherUsersTranslations)
        );

        // Also notify websocket service
        translationHistoryService.clearAllHistory(userId);
      }
    } catch (error) {
      console.error("Failed to clear history from localStorage:", error);
      // Revert the optimistic update on error
      loadHistory(true);
    }
  }, [userId, loadHistory]);

  // Listen for websocket updates
  useEffect(() => {
    const handleHistoryUpdate = (data) => {
      loadHistory(true);
    };

    // Subscribe to updates
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
    refreshHistory: () => loadHistory(true),
  };
}

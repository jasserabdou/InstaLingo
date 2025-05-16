import React, { useState, useEffect, useRef } from "react";
import { useTranslationHistory } from "../hooks/useTranslationHistory";
import VirtualList from "./VirtualList";
import SkeletonLoader from "./SkeletonLoader";
import TranslationHistoryItem from "./TranslationHistoryItem";
import {
  exportTranslationHistory,
  importTranslationHistory,
} from "../utils/localStorage-init";
import "./TranslationHistory.css";

const TranslationHistory = ({
  userId,
  onReuseTranslation,
  // Allow passing history directly as prop with fallback to hook
  history: historyProp,
  isLoading: isLoadingProp,
  onDelete: onDeleteProp,
  onClearAll: onClearAllProp,
  onRefresh: onRefreshProp,
}) => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const fileInputRef = useRef(null);

  // Use hook or props depending on what's provided
  const {
    history: historyFromHook,
    isLoading: isLoadingFromHook,
    error,
    hasMore,
    loadMore,
    deleteTranslation: deleteFromHook,
    clearHistory: clearFromHook,
    refreshHistory: refreshFromHook,
  } = useTranslationHistory(userId);

  // Use props if provided, otherwise use hook
  const history = historyProp || historyFromHook;
  const isLoading =
    isLoadingProp !== undefined ? isLoadingProp : isLoadingFromHook;
  const deleteTranslation = onDeleteProp || deleteFromHook;
  const clearHistory = onClearAllProp || clearFromHook;
  const refreshHistory = onRefreshProp || refreshFromHook;

  // Add debug logging
  useEffect(() => {
    console.log(
      `TranslationHistory: Rendering with ${
        history?.length || 0
      } items, userId: ${userId}`
    );
  }, [history, userId]);

  const handleReuse = (item) => {
    console.log("Reusing translation:", item);
    if (onReuseTranslation) {
      onReuseTranslation(item);
    }
  };

  const handleDelete = (id) => {
    console.log("Deleting translation:", id);
    deleteTranslation(id);
  };

  const handleClearAll = () => {
    console.log("Clearing all translations");
    clearHistory();
    setShowConfirmClear(false);
  };
  const handleRefresh = () => {
    console.log("Refreshing translation history");
    refreshHistory();
  };

  // Export history to JSON file
  const handleExport = () => {
    console.log("Exporting translation history");
    if (exportTranslationHistory()) {
      setImportSuccess("History exported successfully");
      setTimeout(() => setImportSuccess(""), 3000);
    } else {
      setImportError("Failed to export history");
      setTimeout(() => setImportError(""), 3000);
    }
  };

  // Import history from JSON file
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      console.log("Importing translation history");
      await importTranslationHistory(file);
      setImportSuccess("History imported successfully");
      setTimeout(() => setImportSuccess(""), 3000);
      refreshHistory();
    } catch (error) {
      console.error("Import error:", error);
      setImportError(`Import failed: ${error.message}`);
      setTimeout(() => setImportError(""), 5000);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
          <button className="refresh-button" onClick={handleRefresh}>
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

      {/* Import/Export options */}
      <div className="history-actions">
        <button
          className="export-button"
          onClick={handleExport}
          disabled={history.length === 0}
        >
          Export History
        </button>
        <button className="import-button" onClick={handleImportClick}>
          Import History
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileImport}
          accept=".json"
          style={{ display: "none" }}
        />
      </div>

      {/* Status messages */}
      {importError && <div className="import-error">{importError}</div>}
      {importSuccess && <div className="import-success">{importSuccess}</div>}

      {/* Show count for debugging */}
      <div className="history-count-info">
        {history.length} translation{history.length !== 1 ? "s" : ""}
        {isLoading && " (loading...)"}
      </div>

      {showConfirmClear && (
        <div className="confirm-clear-dialog">
          <p>Are you sure you want to clear all your translation history?</p>
          <div className="confirm-buttons">
            <button className="confirm-clear" onClick={handleClearAll}>
              Yes, Clear All
            </button>
            <button
              className="cancel-clear"
              onClick={() => setShowConfirmClear(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="translation-history-list">
        {isLoading && history.length === 0 ? (
          <SkeletonLoader
            type="card"
            count={5}
            className="history-item-skeleton"
          />
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

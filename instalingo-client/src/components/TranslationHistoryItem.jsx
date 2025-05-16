import React from "react";
import "./TranslationHistoryItem.css";

const TranslationHistoryItem = ({ item, onDelete, onReuse }) => {
  // Handle missing item or timestamp
  if (!item) {
    console.error("TranslationHistoryItem rendered with no item");
    return (
      <div className="translation-history-item error">Invalid item data</div>
    );
  }

  // Format the date, with fallback for invalid timestamps
  let formattedDate = "Unknown date";
  try {
    if (item.timestamp) {
      formattedDate = new Date(item.timestamp).toLocaleString();
    }
  } catch (error) {
    console.error("Error formatting timestamp:", error);
  }

  // Log item for debugging
  console.log("Rendering history item:", item.id, item);

  return (
    <div
      className={`translation-history-item ${item.pending ? "pending" : ""} ${
        item.deleting ? "deleting" : ""
      }`}
    >
      <div className="translation-history-content">
        <div className="translation-text-wrapper">
          <div className="translation-source">
            <span className="language-label">
              {item.sourceLanguage || "Unknown"}
            </span>
            <p>{item.sourceText || "No source text"}</p>
          </div>
          <div className="translation-arrow">→</div>
          <div className="translation-target">
            <span className="language-label">
              {item.targetLanguage || "Unknown"}
            </span>
            <p>{item.translatedText || "No translation"}</p>
          </div>
        </div>

        <div className="translation-metadata">
          <span className="translation-timestamp">{formattedDate}</span>
          {item.pending && <span className="pending-indicator">Saving...</span>}
          {item.deleting && (
            <span className="deleting-indicator">Deleting...</span>
          )}
          {item.error && <span className="error-indicator">Error</span>}
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
          onClick={() => item.id && onDelete(item.id)}
          disabled={item.deleting || !item.id}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TranslationHistoryItem;

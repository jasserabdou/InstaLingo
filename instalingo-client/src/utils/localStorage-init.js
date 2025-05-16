/**
 * Utility to initialize and validate localStorage for translation history
 */

// LocalStorage key for storing translations
export const STORAGE_KEY = "instalingo-translations";

/**
 * Initializes localStorage for translation history
 * Ensures the translation history is properly initialized as an array
 */
export function initializeTranslationStorage() {
  try {
    // Check if storage is initialized
    const storedData = localStorage.getItem(STORAGE_KEY);

    // If not initialized, create an empty array
    if (!storedData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return true;
    }

    // Validate that the stored data is valid JSON
    try {
      const parsed = JSON.parse(storedData);
      if (!Array.isArray(parsed)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      }
      return true;
    } catch (parseError) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return false;
    }
  } catch (error) {
    return false;
  }
}

/**
 * Export translation history to a downloadable JSON file
 * @returns {boolean} Success status
 */
export function exportTranslationHistory() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      console.warn("No translation history to export");
      return false;
    }

    // Parse and format the JSON with indentation for readability
    const translations = JSON.parse(storedData);
    const formattedJson = JSON.stringify(translations, null, 2);

    // Create a blob and download link
    const blob = new Blob([formattedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create an anchor element and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `instalingo-translations-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Failed to export translation history:", error);
    return false;
  }
}

/**
 * Import translation history from a JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<boolean>} Success status
 */
export function importTranslationHistory(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const translations = JSON.parse(content);

        if (!Array.isArray(translations)) {
          reject(
            new Error("Invalid format: Expected an array of translations")
          );
          return;
        }

        // Merge with existing translations
        const existingData = localStorage.getItem(STORAGE_KEY);
        let existingTranslations = [];

        if (existingData) {
          try {
            existingTranslations = JSON.parse(existingData);
          } catch (parseError) {
            console.warn("Could not parse existing translations, overwriting");
          }
        }
        // Append imported translations, checking for duplicates by ID
        const existingIds = new Set(existingTranslations.map((t) => t.id));
        const newTranslations = translations.filter(
          (t) => !existingIds.has(t.id)
        );
        const mergedTranslations = [
          ...existingTranslations,
          ...newTranslations,
        ];

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedTranslations));

        resolve(true);
      } catch (error) {
        console.error("Error importing translations:", error);
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}

export default initializeTranslationStorage;

// LocalStorage key for storing translations
const STORAGE_KEY = "instalingo-translations";

class TranslationHistoryService {
  constructor() {
    this.historyEventType = "translation-history";
  }

  onHistoryUpdate(callback) {
    this.onHistoryUpdateCallback = callback;
  }

  async getTranslationHistory(userId, limit = 50, offset = 0) {
    try {
      // Get from localStorage
      const storedData = localStorage.getItem(STORAGE_KEY);

      let translations = [];
      if (storedData) {
        try {
          translations = JSON.parse(storedData);
        } catch (parseError) {
          localStorage.removeItem(STORAGE_KEY); // Clear corrupted data
          return { translations: [], total: 0, hasMore: false };
        }
      }

      // Filter by userId if provided, otherwise return all
      if (userId) {
        translations = translations.filter((item) => item.userId === userId);
      }

      // Sort by timestamp descending
      translations.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      // Paginate
      const paginatedTranslations = translations.slice(offset, offset + limit);

      return {
        translations: paginatedTranslations,
        total: translations.length,
        hasMore: offset + limit < translations.length,
      };
    } catch (error) {
      return { translations: [], total: 0, hasMore: false };
    }
  }
  saveTranslation(translation) {
    // Create a copy with a proper ID if missing
    const translationToSave = {
      ...translation,
      id: translation.id || `tr_${Date.now()}`,
    };

    // Save to localStorage
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      const allTranslations = storedData ? JSON.parse(storedData) : [];
      // Add new translation at the beginning of the array
      allTranslations.unshift(translationToSave);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(allTranslations));
    } catch (error) {
      // Just fail silently if localStorage is not available
    }

    return Promise.resolve({ success: true, translation: translationToSave });
  }

  deleteTranslationHistory(id) {
    // Delete from localStorage
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const allTranslations = JSON.parse(storedData).filter(
          (item) => item.id !== id
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allTranslations));
      }
    } catch (error) {
      // Just fail silently if localStorage is not available
    }

    return Promise.resolve({ success: true });
  }

  clearAllHistory(userId) {
    // Clear from localStorage (only for specified user)
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
      }
    } catch (error) {
      // Just fail silently if localStorage is not available
    }

    return Promise.resolve({ success: true });
  }
}

export const translationHistoryService = new TranslationHistoryService();
export default translationHistoryService;

import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

// Create a client-side translation cache
const translationCache = new Map();

// Clear expired cache entries
const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, { timestamp }] of translationCache.entries()) {
    if (now - timestamp > CACHE_DURATION) {
      translationCache.delete(key);
    }
  }
};

// Clean cache every 5 minutes
setInterval(clearExpiredCache, 1000 * 60 * 5);

/**
 * Translates text using the backend translation API with client-side caching
 * @param {string} text - Text to translate
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @returns {Promise<Object>} - Translation result object
 */
export const translateText = async (text, sourceLang, targetLang) => {
  // Don't translate empty text
  if (!text.trim()) {
    return { translated_text: "", processing_time: 0 };
  }

  // Generate cache key
  const cacheKey = `${text}|${sourceLang}|${targetLang}`;

  // Check cache first
  if (translationCache.has(cacheKey)) {
    const { data, timestamp } = translationCache.get(cacheKey);
    // If cache entry is still valid, use it
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }

  try {
    const response = await axios.post(
      `${API_URL}/translate`,
      {
        text,
        source_lang: sourceLang,
        target_lang: targetLang,
      },
      {
        // Add timeout to prevent hanging requests
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Cache the successful response
    translationCache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now(),
    });

    return response.data;
  } catch (error) {
    console.error("Translation error:", error);

    // Provide more helpful error messages based on error type
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const serverError = error.response.data?.error || "Server error";
      throw new Error(`Translation failed: ${serverError}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error(
        "Network error: The translation server is not responding"
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`Request error: ${error.message}`);
    }
  }
};

/**
 * Fetches available languages from the API
 * @returns {Promise<string[]>} Array of available languages
 */
export const getLanguages = async () => {
  try {
    // Try to get languages from the API
    const response = await axios.get(`${API_URL}/api/languages`);
    return response.data.languages.map((lang) => lang.name);
  } catch (error) {
    console.error("Failed to fetch languages from API:", error);
    // Fallback to hardcoded languages if API fails
    return [
      "English",
      "Spanish",
      "French",
      "German",
      "Italian",
      "Chinese",
      "Japanese",
      "Russian",
      "Arabic",
      "Hindi",
    ];
  }
};

/**
 * Gets the keyboard shortcuts from the API
 * @returns {Promise<Object>} Object containing keyboard shortcuts
 */
export const getKeyboardShortcuts = async () => {
  try {
    const response = await axios.get(`${API_URL}/keyboard-shortcuts`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch keyboard shortcuts:", error);
    return {
      "Ctrl+Enter": "Translate text",
      "Ctrl+Shift+C": "Copy translation",
      "Ctrl+Shift+X": "Swap languages",
      "Ctrl+Shift+S": "Speak translation",
    };
  }
};

/**
 * Gets model status information
 * @returns {Promise<Object>} Object containing model status information
 */
export const getModelStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/model-status`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch model status:", error);
    return { status: "unknown", error: error.message };
  }
};

/**
 * Saves a translation to history
 * @param {Object} translation - Translation to save
 * @param {string} translation.sourceText - Original text
 * @param {string} translation.translatedText - Translated text
 * @param {string} translation.sourceLanguage - Source language
 * @param {string} translation.targetLanguage - Target language
 * @param {string} userId - User ID to associate with the translation
 * @returns {Promise<Object>} - Saved translation object
 */
export const saveTranslationToHistory = async (translation, userId) => {
  try {
    // Import the service here to avoid circular dependencies
    const { translationHistoryService } = await import(
      "./translationHistoryService"
    );

    // Ensure we have a valid userId, defaulting to 'guest' if none provided
    const userIdToUse = userId || "guest";

    const translationToSave = {
      ...translation,
      userId: userIdToUse,
      timestamp: new Date().toISOString(),
      id: translation.id || `tr_${Date.now()}`,
    };

    const result = await translationHistoryService.saveTranslation(
      translationToSave
    );
    return result;
  } catch (error) {
    console.error("Failed to save translation to history:", error);
    throw new Error(`Failed to save translation to history: ${error.message}`);
  }
};

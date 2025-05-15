import axios from 'axios';

const API_URL = 'http://localhost:5000'; 

export const translateText = async (text, sourceLang, targetLang) => {
  try {
    const response = await axios.post(`${API_URL}/translate`, {
      text,
      source_lang: sourceLang,
      target_lang: targetLang
    });
    return response.data;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};

export const getLanguages = async () => {
  // This would be ideal if you expose this from your API
  // For now, we'll hardcode the languages from your Flask app
  return [
    "English", "Spanish", "French", "German", "Italian", 
    "Chinese", "Japanese", "Russian", "Arabic", "Hindi"
  ];
};

export const getKeyboardShortcuts = async () => {
  try {
    const response = await axios.get(`${API_URL}/keyboard-shortcuts`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch keyboard shortcuts:', error);
    return {
      "Ctrl+Enter": "Translate text",
      "Ctrl+Shift+C": "Copy translation",
      "Ctrl+Shift+X": "Swap languages",
      "Ctrl+Shift+S": "Speak translation"
    };
  }
};
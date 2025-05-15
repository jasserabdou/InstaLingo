import React, { useState, useEffect } from 'react';
import { Container, Box, Button, Typography, CircularProgress } from '@mui/material';
import LanguageSelector from './LanguageSelector';
import SpeechRecognition from './SpeechRecognition';
import TextToSpeech from './TextToSpeech';
import { translateText } from '../services/translationService';
import TranslationHistory from './TranslationHistory';
import { useTranslationHistory } from '../hooks/useTranslationHistory';
import { debounce } from '../utils/debounceThrottle';
import NetworkStatusIndicator from './NetworkStatusIndicator';
import './Translator.css';

const Translator = ({ userId }) => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('English');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { addTranslation } = useTranslationHistory(userId);

  // Translation function
  const handleTranslate = async () => {
    if (!sourceText) return;
    
    setIsLoading(true);
    try {
      const result = await translateText(sourceText, sourceLang, targetLang);
      setTranslatedText(result.translated_text);
      
      // Don't auto-save every translation, only explicit saves
    } catch (error) {
      console.error('Translation failed:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce translation to avoid too many API calls
  const debouncedTranslate = debounce(async (text) => {
    if (!text.trim()) {
      setTranslatedText('');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      setTranslatedText(data.translatedText);
      
      // Don't auto-save every translation, only explicit saves
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsLoading(false);
    }
  }, 500);

  const handleTextChange = (e) => {
    const text = e.target.value;
    setSourceText(text);
    debouncedTranslate(text);
  };

  const handleSourceLanguageChange = (e) => {
    setSourceLang(e.target.value);
    if (sourceText) debouncedTranslate(sourceText);
  };

  const handleTargetLanguageChange = (e) => {
    setTargetLang(e.target.value);
    if (sourceText) debouncedTranslate(sourceText);
  };

  const handleSaveTranslation = () => {
    if (sourceText && translatedText) {
      addTranslation({
        sourceText,
        translatedText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang
      });
    }
  };

  const handleReuseTranslation = (item) => {
    setSourceText(item.sourceText);
    setTranslatedText(item.translatedText);
    setSourceLang(item.sourceLanguage);
    setTargetLang(item.targetLanguage);
    setShowHistory(false);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        InstaLingo Translator
      </Typography>
      
      {/* Language selectors */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <LanguageSelector 
          value={sourceLang} 
          onChange={setSourceLang}
          includeAuto
          label="Source Language"
        />
        <LanguageSelector 
          value={targetLang} 
          onChange={setTargetLang}
          label="Target Language"
        />
      </Box>
      
      {/* Main translation interface */}
      <div className="translator-main">
        <div className="language-controls">
          <div className="language-selector">
            <label>From:</label>
            <select value={sourceLang} onChange={handleSourceLanguageChange}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              {/* Add more languages as needed */}
            </select>
          </div>
          
          <button className="swap-languages-btn">↔</button>
          
          <div className="language-selector">
            <label>To:</label>
            <select value={targetLang} onChange={handleTargetLanguageChange}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              {/* Add more languages as needed */}
            </select>
          </div>
        </div>

        <div className="translation-area">
          <div className="input-container">
            <textarea
              value={sourceText}
              onChange={handleTextChange}
              placeholder="Enter text to translate..."
              className="translation-input"
            />
            <div className="character-count">{sourceText.length} characters</div>
          </div>
          
          <div className="output-container">
            <div className={`translated-text ${isLoading ? 'translating' : ''}`}>
              {isLoading ? 'Translating...' : translatedText || 'Translation will appear here'}
            </div>
            {translatedText && (
              <button 
                className="save-translation-btn"
                onClick={handleSaveTranslation}
              >
                Save Translation
              </button>
            )}
          </div>
        </div>
        
        <div className="translator-footer">
          <button 
            className={`history-toggle-btn ${showHistory ? 'active' : ''}`}
            onClick={toggleHistory}
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>
      </div>
      
      {showHistory && (
        <div className="translation-history-wrapper">
          <TranslationHistory 
            userId={userId} 
            onReuseTranslation={handleReuseTranslation} 
          />
        </div>
      )}
      
      <NetworkStatusIndicator />
    </Container>
  );
};

export default Translator;
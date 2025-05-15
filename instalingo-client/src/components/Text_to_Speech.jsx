import React, { useState, useEffect } from 'react';
import { IconButton, Snackbar, Tooltip } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const TextToSpeech = ({ text, language }) => {
  const [voices, setVoices] = useState([]);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Language code mapping
  const languageMap = {
    English: "en-US",
    Spanish: "es-ES",
    French: "fr-FR",
    German: "de-DE",
    Italian: "it-IT",
    Chinese: "zh-CN",
    Japanese: "ja-JP",
    Russian: "ru-RU",
    Arabic: "ar-SA",
    Hindi: "hi-IN",
  };

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    
    // Chrome loads voices asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const findVoiceForLanguage = (langCode) => {
    // Try to find exact match first
    let voice = voices.find(v => v.lang === langCode);
    
    // Try to find a voice that starts with the language code
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
    }
    
    // Fallback to any voice for that language
    if (!voice) {
      voice = voices.find(v => v.lang.includes(langCode.split('-')[0]));
    }
    
    // Last resort fallback to English
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith('en'));
    }
    
    return voice;
  };

  const speakText = () => {
    if (!text) return;
    
    if (!speechSynthesis) {
      setErrorMessage("Speech synthesis not supported in your browser");
      setErrorOpen(true);
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = languageMap[language] || 'en-US';
    const voice = findVoiceForLanguage(langCode);
    
    if (voice) {
      utterance.voice = voice;
    } else {
      // If no suitable voice found, just set the language
      utterance.lang = langCode;
    }
    
    utterance.rate = 1;
    utterance.pitch = 1;
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setErrorMessage(`Speech synthesis error: ${event.error}`);
      setErrorOpen(true);
      setIsSpeaking(false);
    };

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    speechSynthesis.speak(utterance);
  };

  return (
    <>
      <Tooltip title="Listen to translation">
        <IconButton 
          onClick={speakText} 
          disabled={!text || !speechSynthesis}
          color={isSpeaking ? "secondary" : "primary"}
          aria-label="Listen to translation"
        >
          <VolumeUpIcon />
        </IconButton>
      </Tooltip>
      
      <Snackbar
        open={errorOpen}
        autoHideDuration={6000}
        onClose={() => setErrorOpen(false)}
        message={errorMessage}
      />
    </>
  );
};

export default TextToSpeech;
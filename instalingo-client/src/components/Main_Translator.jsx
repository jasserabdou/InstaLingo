import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Box, TextField, MenuItem, IconButton, 
  Paper, Typography, Grid, CircularProgress, Tooltip, 
  Snackbar, Alert
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { SpeechRecognition, TextToSpeech } from './Speech';
import { translateText, getLanguages } from '../services/translationService';

const Translator = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('English');
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detectedLang, setDetectedLang] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Load available languages
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const languageList = await getLanguages();
        setLanguages(languageList);
      } catch (error) {
        console.error('Failed to load languages:', error);
        setError('Failed to load languages. Please refresh the page.');
      }
    };
    
    loadLanguages();
  }, []);
  
  // Debounce function for translation
  const debounce = (func, delay) => {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };
  
  // Translate text with debounce
  const debouncedTranslate = useCallback(
    debounce(async (text, source, target) => {
      if (!text.trim()) {
        setTranslatedText('');
        setDetectedLang('');
        return;
      }
      
      setLoading(true);
      try {
        const result = await translateText(text, source, target);
        setTranslatedText(result.translated_text);
        
        if (source === 'auto' && result.detected_language) {
          setDetectedLang(result.detected_language);
        } else {
          setDetectedLang('');
        }
        setError('');
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText('');
        setError('Translation failed. Please try again or check your connection.');
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );
  
  // Trigger translation when inputs change
  useEffect(() => {
    if (sourceText) {
      debouncedTranslate(sourceText, sourceLang, targetLang);
    }
  }, [sourceText, sourceLang, targetLang, debouncedTranslate]);
  
  // Handle language swap
  const handleSwapLanguages = () => {
    if (sourceLang !== 'auto') {
      const tempLang = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(tempLang);
      
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  };
  
  // Handle speech recognition result
  const handleSpeechResult = (transcript) => {
    setSourceText(transcript);
  };
  
  // Copy translation to clipboard
  const copyToClipboard = () => {
    if (!translatedText) return;
    
    navigator.clipboard.writeText(translatedText)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        setError('Failed to copy to clipboard');
      });
  };
  
  // Clear source text
  const clearText = () => {
    setSourceText('');
    setTranslatedText('');
    setDetectedLang('');
    setError('');
  };

  // Register keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Enter - Force translate
      if (e.ctrlKey && e.key === 'Enter' && sourceText) {
        debouncedTranslate(sourceText, sourceLang, targetLang);
      }
      // Ctrl+Shift+C - Copy translation
      else if (e.ctrlKey && e.shiftKey && e.key === 'C' && translatedText) {
        e.preventDefault();
        copyToClipboard();
      }
      // Ctrl+Shift+X - Swap languages
      else if (e.ctrlKey && e.shiftKey && e.key === 'X' && sourceLang !== 'auto') {
        e.preventDefault();
        handleSwapLanguages();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sourceText, translatedText, sourceLang, targetLang, debouncedTranslate]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" gutterBottom align="center" color="primary" sx={{ fontWeight: 'bold' }}>
        InstaLingo
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        {/* Language selection */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={5}>
            <Box display="flex" alignItems="center">
              <TextField
                select
                fullWidth
                variant="outlined"
                size="small"
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                label="Source Language"
              >
                <MenuItem value="auto">Detect Language</MenuItem>
                {languages.map((lang) => (
                  <MenuItem key={`source-${lang}`} value={lang}>
                    {lang}
                  </MenuItem>
                ))}
              </TextField>
              <SpeechRecognition 
                language={sourceLang === 'auto' ? 'English' : sourceLang}
                onTranscript={handleSpeechResult}
                disabled={loading}
              />
            </Box>
          </Grid>
          
          <Grid item xs={2} sx={{ textAlign: 'center' }}>
            <Tooltip title="Swap languages">
              <IconButton 
                onClick={handleSwapLanguages} 
                disabled={sourceLang === 'auto' || loading}
                aria-label="Swap languages"
              >
                <SwapHorizIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          
          <Grid item xs={5}>
            <TextField
              select
              fullWidth
              variant="outlined"
              size="small"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              label="Target Language"
            >
              {languages.map((lang) => (
                <MenuItem key={`target-${lang}`} value={lang}>
                  {lang}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        
        {/* Text areas */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box position="relative">
              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                placeholder="Enter text to translate"
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                InputProps={{
                  endAdornment: sourceText && (
                    <IconButton 
                      onClick={clearText}
                      aria-label="Clear text"
                      sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )
                }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box position="relative">
              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                placeholder="Translation"
                value={loading ? 'Translating...' : translatedText}
                disabled
                InputProps={{
                  endAdornment: translatedText && (
                    <Box sx={{ position: 'absolute', right: 8, top: 8, display: 'flex' }}>
                      <Tooltip title="Copy translation">
                        <IconButton 
                          onClick={copyToClipboard}
                          aria-label="Copy translation"
                        >
                          {copySuccess ? <CheckIcon color="success" /> : <ContentCopyIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <TextToSpeech 
                        text={translatedText} 
                        language={targetLang} 
                      />
                    </Box>
                  ),
                  startAdornment: loading && (
                    <CircularProgress 
                      size={20} 
                      sx={{ 
                        position: 'absolute', 
                        left: 8, 
                        top: 8 
                      }} 
                    />
                  )
                }}
              />
            </Box>
          </Grid>
        </Grid>
        
        {/* Detected language */}
        {detectedLang && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Detected language: {detectedLang}
          </Typography>
        )}

        {/* Keyboard shortcuts info */}
        <Typography variant="caption" sx={{ mt: 2, display: 'block', textAlign: 'center', color: 'text.secondary' }}>
          Keyboard shortcuts: Ctrl+Enter (Translate), Ctrl+Shift+C (Copy), Ctrl+Shift+X (Swap)
        </Typography>
      </Paper>

      {/* Error snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Translator;
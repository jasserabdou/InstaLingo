import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Container,
  Box,
  TextField,
  MenuItem,
  IconButton,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert,
  Button,
  Chip,
  Collapse,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import HistoryIcon from "@mui/icons-material/History";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { SpeechRecognition, TextToSpeech } from "./Speech";
import {
  translateText,
  getLanguages,
  getModelStatus,
} from "../services/translationService";
import { useDebounce } from "../hooks/useDebounce";
import { useTranslationHistory } from "../hooks/useTranslationHistory";
import { Link } from "react-router-dom";
import "./Main_Translator.css";

const Translator = () => {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("English");
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detectedLang, setDetectedLang] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState("");
  const [modelStatus, setModelStatus] = useState({ status: "loading" });
  const [showModelInfo, setShowModelInfo] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const sourceTextRef = useRef(null); // Get translation history
  const { addTranslation } = useTranslationHistory("guest");

  // Debounced source text for translation
  const debouncedText = useDebounce(sourceText, 600);

  // Load available languages
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const languageList = await getLanguages();
        setLanguages(languageList);
      } catch (error) {
        console.error("Failed to load languages:", error);
        setError("Failed to load languages. Please refresh the page.");
      }
    };

    loadLanguages();
  }, []);
  // Check model status periodically
  useEffect(() => {
    const checkModelStatus = async () => {
      try {
        const status = await getModelStatus();
        setModelStatus(status);
      } catch (error) {
        console.error("Failed to check model status:", error);
      }
    };

    // Check immediately and then every 60 seconds
    checkModelStatus();
    const interval = setInterval(checkModelStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  // Update character count
  useEffect(() => {
    setCharCount(sourceText.length);
  }, [sourceText]);

  // Main translation function
  const performTranslation = useCallback(async (text, source, target) => {
    if (!text.trim()) {
      setTranslatedText("");
      setDetectedLang("");
      return;
    }

    setLoading(true);
    try {
      const result = await translateText(text, source, target);
      setTranslatedText(result.translated_text);

      if (source === "auto" && result.detected_language) {
        setDetectedLang(result.detected_language);
      } else {
        setDetectedLang("");
      }
      setError("");
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedText("");
      setError(error.message || "Translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger translation when debounced text changes
  useEffect(() => {
    if (debouncedText) {
      performTranslation(debouncedText, sourceLang, targetLang);
    } else {
      setTranslatedText("");
      setDetectedLang("");
    }
  }, [debouncedText, sourceLang, targetLang, performTranslation]);
  // Handle language swap
  const handleSwapLanguages = useCallback(() => {
    if (sourceLang !== "auto") {
      const tempLang = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(tempLang);

      // Set source text to translated text
      setSourceText(translatedText);
    }
  }, [sourceLang, targetLang, translatedText]);

  // Handle speech recognition result
  const handleSpeechResult = (transcript) => {
    setSourceText(transcript);
  };
  // Copy translation to clipboard
  const copyToClipboard = useCallback(() => {
    if (!translatedText) return;

    navigator.clipboard
      .writeText(translatedText)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        setError("Failed to copy to clipboard");
      });
  }, [translatedText]);

  // Clear source text
  const clearText = () => {
    setSourceText("");
    setTranslatedText("");
    setDetectedLang("");
    setError("");
    // Focus the source text field after clearing
    if (sourceTextRef.current) {
      sourceTextRef.current.focus();
    }
  };

  // Save translation to history
  const saveTranslation = () => {
    if (sourceText && translatedText) {
      // Create a translation object with all necessary fields
      const translation = {
        sourceText,
        translatedText,
        sourceLanguage:
          sourceLang === "auto" ? detectedLang || "Auto" : sourceLang,
        targetLanguage: targetLang,
        timestamp: new Date().toISOString(),
        id: `tr_${Date.now()}`, // Add a unique ID
      };

      try {
        // Save using the hook
        addTranslation(translation);

        // Show success message
        setError("Translation saved to history");
        setTimeout(() => setError(""), 2000);

        // If we have a history link available, highlight it or animate it
        const historyLink = document.querySelector('a[href="/history"]');
        if (historyLink) {
          historyLink.classList.add("history-updated");
          setTimeout(
            () => historyLink.classList.remove("history-updated"),
            3000
          );
        }
      } catch (saveError) {
        console.error("Failed to save translation:", saveError);
        setError("Error saving to history. Please try again.");
        setTimeout(() => setError(""), 3000);
      }
    } else {
      setError("Cannot save empty translation");
      setTimeout(() => setError(""), 2000);
    }
  };

  // Register keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Enter - Force translate
      if (e.ctrlKey && e.key === "Enter" && sourceText) {
        e.preventDefault();
        performTranslation(sourceText, sourceLang, targetLang);
      }
      // Ctrl+Shift+C - Copy translation
      else if (e.ctrlKey && e.shiftKey && e.key === "c" && translatedText) {
        e.preventDefault();
        copyToClipboard();
      }
      // Ctrl+Shift+X - Swap languages
      else if (
        e.ctrlKey &&
        e.shiftKey &&
        e.key === "x" &&
        sourceLang !== "auto"
      ) {
        e.preventDefault();
        handleSwapLanguages();
      }
      // Escape - Clear text
      else if (e.key === "Escape" && (sourceText || translatedText)) {
        e.preventDefault();
        clearText();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    sourceText,
    translatedText,
    sourceLang,
    targetLang,
    performTranslation,
    copyToClipboard,
    handleSwapLanguages,
  ]);

  return (
    <Container
      maxWidth="lg"
      sx={{ mt: 3, mb: 4 }}
      className="translator-container"
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        color="primary"
        sx={{ fontWeight: "bold", mb: 3 }}
      >
        InstaLingo Translator
      </Typography>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 2 }}>
        {/* Model status indicator */}
        <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
          <Tooltip title="View model information">
            <Button
              size="small"
              startIcon={<InfoOutlinedIcon />}
              onClick={() => setShowModelInfo(!showModelInfo)}
              aria-expanded={showModelInfo}
            >
              {modelStatus.status === "loaded" ? "Model Ready" : "Model Status"}
            </Button>
          </Tooltip>
        </Box>

        <Collapse in={showModelInfo}>
          <Paper
            variant="outlined"
            sx={{ p: 2, mb: 2, bgcolor: "background.default" }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Translation Model Status
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Chip
                label={`Status: ${modelStatus.status || "checking..."}`}
                color={modelStatus.status === "loaded" ? "success" : "default"}
                size="small"
              />
              {modelStatus.load_time && (
                <Chip
                  label={`Loaded: ${new Date(
                    modelStatus.load_time
                  ).toLocaleTimeString()}`}
                  size="small"
                />
              )}
              {modelStatus.memory_usage && (
                <Chip
                  label={`Memory: ${modelStatus.memory_usage}`}
                  size="small"
                />
              )}
            </Box>
          </Paper>
        </Collapse>

        {/* Language selection */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={5}>
            <Box display="flex" alignItems="center">
              <TextField
                select
                fullWidth
                variant="outlined"
                size="small"
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                label="Source Language"
                id="source-language-select"
                aria-label="Source language"
              >
                <MenuItem value="auto">Detect Language</MenuItem>
                {languages.map((lang) => (
                  <MenuItem key={`source-${lang}`} value={lang}>
                    {lang}
                  </MenuItem>
                ))}
              </TextField>
              <SpeechRecognition
                language={sourceLang === "auto" ? "English" : sourceLang}
                onTranscript={handleSpeechResult}
                disabled={loading}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={2} sx={{ textAlign: "center" }}>
            <Tooltip
              title={
                sourceLang === "auto"
                  ? "Cannot swap when using auto-detect"
                  : "Swap languages"
              }
            >
              <span>
                <IconButton
                  onClick={handleSwapLanguages}
                  disabled={sourceLang === "auto" || loading}
                  aria-label="Swap languages"
                  color="primary"
                >
                  <SwapHorizIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Grid>

          <Grid item xs={12} md={5}>
            <TextField
              select
              fullWidth
              variant="outlined"
              size="small"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              label="Target Language"
              id="target-language-select"
              aria-label="Target language"
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
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Source Text
            </Typography>
            <Box position="relative" className="text-area-container">
              <TextField
                fullWidth
                multiline
                rows={8}
                variant="outlined"
                placeholder="Enter text to translate"
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                inputRef={sourceTextRef}
                InputProps={{
                  endAdornment: sourceText && (
                    <IconButton
                      onClick={clearText}
                      aria-label="Clear text"
                      sx={{ position: "absolute", right: 8, top: 8 }}
                      size="small"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
                inputProps={{
                  maxLength: 5000,
                  "aria-label": "Text to translate",
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 1,
                }}
              >
                <Typography
                  variant="caption"
                  color={charCount > 4000 ? "error" : "text.secondary"}
                >
                  {charCount}/5000 characters
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  disabled={!sourceText || loading}
                  onClick={() =>
                    performTranslation(sourceText, sourceLang, targetLang)
                  }
                >
                  Translate
                </Button>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Translation
              {detectedLang && sourceLang === "auto" && (
                <Chip
                  label={`Detected: ${detectedLang}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <Box position="relative" className="text-area-container">
              <Box sx={{ position: "relative" }}>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  variant="outlined"
                  placeholder="Translation will appear here"
                  value={loading ? "Translating..." : translatedText}
                  disabled
                  InputProps={{
                    readOnly: true,
                    "aria-readonly": true,
                    "aria-live": "polite",
                    "aria-label": "Translated text",
                  }}
                />
                {loading && (
                  <CircularProgress
                    size={24}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: "-12px",
                      marginLeft: "-12px",
                    }}
                  />
                )}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1,
                  mt: 1,
                }}
              >
                {translatedText && (
                  <>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={
                        copySuccess ? (
                          <CheckIcon color="success" />
                        ) : (
                          <ContentCopyIcon />
                        )
                      }
                      onClick={copyToClipboard}
                      color={copySuccess ? "success" : "primary"}
                    >
                      {copySuccess ? "Copied" : "Copy"}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<HistoryIcon />}
                      onClick={saveTranslation}
                    >
                      Save
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      component={Link}
                      to="/history"
                      id="history-view-link"
                    >
                      View History
                    </Button>

                    <TextToSpeech text={translatedText} language={targetLang} />
                  </>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Keyboard shortcuts info */}
        <Box
          sx={{ mt: 3, bgcolor: "background.default", p: 2, borderRadius: 1 }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Keyboard Shortcuts
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" display="block">
                <strong>Ctrl+Enter:</strong> Translate
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" display="block">
                <strong>Ctrl+Shift+C:</strong> Copy
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" display="block">
                <strong>Ctrl+Shift+X:</strong> Swap languages
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" display="block">
                <strong>Esc:</strong> Clear input
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button
              component={Link}
              to="/history"
              startIcon={<HistoryIcon />}
              size="small"
            >
              View Translation History
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Error/success snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setError("")}
          severity={
            error.includes("saved") || error.includes("Copied")
              ? "success"
              : "error"
          }
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Translator;

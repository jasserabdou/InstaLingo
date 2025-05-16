import React, { useState, useEffect } from "react";
import { IconButton, Tooltip } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

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

export const SpeechRecognition = ({ language, onTranscript, disabled }) => {
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  useEffect(() => {
    // Initialize speech recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setListening(false);
      };

      recognitionInstance.onend = () => {
        setListening(false);
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [onTranscript, recognition]);

  // Update language when it changes
  useEffect(() => {
    if (recognition && language) {
      // Use correct language code or fallback to English
      recognition.lang = languageMap[language] || "en-US";
    }
  }, [language, recognition]);

  const startListening = () => {
    if (recognition) {
      try {
        recognition.start();
        setListening(true);
      } catch (error) {
        console.error("Could not start recognition:", error);
      }
    }
  };

  return (
    <Tooltip title="Record speech for translation">
      <IconButton
        onClick={startListening}
        disabled={disabled || listening || !recognition}
        color={listening ? "secondary" : "primary"}
        aria-label="Record speech for translation"
      >
        <MicIcon />
      </IconButton>
    </Tooltip>
  );
};

export const TextToSpeech = ({ text, language }) => {
  const [voices, setVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

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
    let voice = voices.find((v) => v.lang === langCode);

    // Try to find a voice that starts with the language code
    if (!voice) {
      voice = voices.find((v) => v.lang.startsWith(langCode.split("-")[0]));
    }

    // Fallback to any voice for that language
    if (!voice) {
      voice = voices.find((v) => v.lang.includes(langCode.split("-")[0]));
    }

    // Last resort fallback to English
    if (!voice) {
      voice = voices.find((v) => v.lang.startsWith("en"));
    }

    return voice;
  };

  const speakText = () => {
    if (!text || !speechSynthesis) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = languageMap[language] || "en-US";
    const voice = findVoiceForLanguage(langCode);

    if (voice) {
      utterance.voice = voice;
    } else {
      // If no suitable voice found, just set the language
      utterance.lang = langCode;
    }

    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  };

  return (
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
  );
};

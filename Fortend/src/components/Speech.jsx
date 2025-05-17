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
  Arabic: "ar",
  Hindi: "hi-IN",
};

export const SpeechRecognition = ({ language, onTranscript, disabled }) => {
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    // Initialize speech recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      try {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognition();

        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;

        recognitionInstance.onresult = (event) => {
          const lastResult = event.results.length - 1;
          const transcript = event.results[lastResult][0].transcript;

          // Check if it's a final result
          if (event.results[lastResult].isFinal) {
            console.log("Final transcript:", transcript);
            onTranscript(transcript);
            setListening(false);
          }
        };

        recognitionInstance.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          setErrorMessage(`Speech recognition error: ${event.error}`);
          setListening(false);
        };

        recognitionInstance.onend = () => {
          setListening(false);
        };

        setRecognition(recognitionInstance);
        setErrorMessage(null);
      } catch (error) {
        console.error("Error initializing speech recognition:", error);
        setErrorMessage("Failed to initialize speech recognition");
      }
    } else {
      setErrorMessage("Speech recognition not supported in this browser");
    }

    return () => {
      if (recognition) {
        try {
          recognition.abort();
        } catch (err) {
          console.error("Error aborting recognition:", err);
        }
      }
    };
  }, [onTranscript]);
  // Update language when it changes
  useEffect(() => {
    if (recognition && language) {
      // Use correct language code or fallback to English
      const langCode = languageMap[language] || "en-US";
      recognition.lang = langCode;
      console.log(
        `Speech recognition language updated to: ${langCode} (${language})`
      );
    }
  }, [language, recognition]);
  const startListening = () => {
    if (recognition) {
      try {
        // Stop any existing session first to avoid errors
        try {
          recognition.stop();
        } catch (e) {
          // Ignore errors when stopping, as it might not be active
        }

        // Set the language before starting
        if (language) {
          recognition.lang = languageMap[language] || "en-US";
          console.log(
            `Setting speech recognition language to: ${recognition.lang}`
          );
        }

        // Short timeout to ensure any previous session is fully stopped
        setTimeout(() => {
          try {
            recognition.start();
            setListening(true);
            setErrorMessage(null);
            console.log("Speech recognition started");
          } catch (startError) {
            console.error("Could not start recognition:", startError);
            setErrorMessage(`Failed to start: ${startError.message}`);
          }
        }, 100);
      } catch (error) {
        console.error("Error preparing recognition:", error);
        setErrorMessage(`Error preparing speech recognition: ${error.message}`);
      }
    } else {
      setErrorMessage("Speech recognition not available");
    }
  };
  return (
    <Tooltip
      title={
        errorMessage ||
        (listening ? "Recording..." : "Record speech for translation")
      }
    >
      <span>
        <IconButton
          onClick={startListening}
          disabled={disabled || listening || !recognition}
          color={errorMessage ? "error" : listening ? "secondary" : "primary"}
          aria-label="Record speech for translation"
        >
          <MicIcon />
        </IconButton>
      </span>
    </Tooltip>
  );
};

export const TextToSpeech = ({ text, language }) => {
  const [voices, setVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      try {
        const synth = window.speechSynthesis;
        const availableVoices = synth.getVoices();

        console.log(
          "Available voices:",
          availableVoices.map((v) => ({
            name: v.name,
            lang: v.lang,
            default: v.default,
          }))
        );

        // Log Arabic voices specifically
        const arabicVoices = availableVoices.filter(
          (v) =>
            v.lang === "ar" ||
            v.lang.startsWith("ar-") ||
            v.lang.includes("Arab")
        );

        if (arabicVoices.length > 0) {
          console.log(
            "Arabic voices available:",
            arabicVoices.map((v) => v.name)
          );
        } else {
          console.log("No Arabic voices found");
        }

        setVoices(availableVoices);
      } catch (error) {
        console.error("Error loading voices:", error);
      }
    };

    if (window.speechSynthesis) {
      loadVoices();

      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    } else {
      console.error("Speech synthesis not supported in this browser");
    }
  }, []);
  const findVoiceForLanguage = (langCode) => {
    console.log(
      `Finding voice for language code: ${langCode}, available voices:`,
      voices
    );

    // Special handling for Arabic
    if (langCode === "ar" || langCode.startsWith("ar-")) {
      // Try to find any Arabic voice
      const arabicVoice = voices.find(
        (v) =>
          v.lang === "ar" ||
          v.lang === "ar-SA" ||
          v.lang.startsWith("ar-") ||
          v.lang.includes("Arab")
      );

      if (arabicVoice) {
        console.log(`Found Arabic voice: ${arabicVoice.name}`);
        return arabicVoice;
      }
    }

    // Try to find exact match first
    let voice = voices.find((v) => v.lang === langCode);
    if (voice) {
      console.log(`Found exact match voice: ${voice.name}`);
      return voice;
    }

    // Try to find a voice that starts with the language code
    voice = voices.find((v) => v.lang.startsWith(langCode.split("-")[0]));
    if (voice) {
      console.log(`Found voice with matching prefix: ${voice.name}`);
      return voice;
    }

    // Fallback to any voice for that language
    voice = voices.find((v) => v.lang.includes(langCode.split("-")[0]));
    if (voice) {
      console.log(`Found voice containing language code: ${voice.name}`);
      return voice;
    }

    // Last resort fallback to English
    voice = voices.find((v) => v.lang.startsWith("en"));
    if (voice) {
      console.log(`Using English fallback voice: ${voice.name}`);
      return voice;
    }

    console.log("No suitable voice found");
    return null;
  };
  const speakText = () => {
    if (!text || !speechSynthesis) {
      console.error(
        "Cannot speak: text is empty or speech synthesis not available"
      );
      return;
    }

    try {
      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const langCode = languageMap[language] || "en-US";
      console.log(`Speaking text in language: ${language} (code: ${langCode})`);

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = findVoiceForLanguage(langCode);

      if (voice) {
        utterance.voice = voice;
        console.log(`Using voice: ${voice.name} (${voice.lang})`);
      } else {
        // If no suitable voice found, just set the language
        utterance.lang = langCode;
        console.log(
          `No specific voice found, using language code: ${langCode}`
        );
      }

      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        console.log("Speech started");
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        console.log("Speech ended normally");
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsSpeaking(false);
      };

      // Ensure speech synthesis is ready before speaking
      if (speechSynthesis.speaking) {
        console.log("Speech synthesis is already speaking, cancelling first");
        speechSynthesis.cancel();
        // Small delay to ensure cancellation completes
        setTimeout(() => {
          speechSynthesis.speak(utterance);
        }, 100);
      } else {
        speechSynthesis.speak(utterance);
      }

      // Chrome sometimes pauses after 15 seconds
      // This is a workaround for the Chrome bug
      const chromeWorkaround = setInterval(() => {
        if (!speechSynthesis.speaking) {
          clearInterval(chromeWorkaround);
          return;
        }
        speechSynthesis.pause();
        speechSynthesis.resume();
      }, 14000);
    } catch (error) {
      console.error("Error during speech synthesis:", error);
      setIsSpeaking(false);
    }
  };
  const [speakError, setSpeakError] = useState(null);

  // Reset error state after 5 seconds
  useEffect(() => {
    if (speakError) {
      const timer = setTimeout(() => setSpeakError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [speakError]);

  const handleSpeakClick = () => {
    try {
      setSpeakError(null);
      speakText();
    } catch (err) {
      console.error("Error in speak handler:", err);
      setSpeakError("Failed to speak text");
    }
  };

  return (
    <Tooltip
      title={
        speakError || (isSpeaking ? "Speaking..." : "Listen to translation")
      }
    >
      <span>
        <IconButton
          onClick={handleSpeakClick}
          disabled={!text || (!speechSynthesis && !window.speechSynthesis)}
          color={speakError ? "error" : isSpeaking ? "secondary" : "primary"}
          aria-label="Listen to translation"
        >
          <VolumeUpIcon />
        </IconButton>
      </span>
    </Tooltip>
  );
};

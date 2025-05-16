import React, { useState, useMemo, lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Layout from "./components/Layout";
import LoadingIndicator from "./components/LoadingIndicator";
import ErrorFallback from "./components/ErrorFallback";
import initializeTranslationStorage from "./utils/localStorage-init";
import "./App.css";

// Lazy load components for code splitting
const Translator = lazy(() => import("./components/Main_Translator"));
const NotFound = lazy(() => import("./components/Not_Found"));
const TranslationHistory = lazy(() =>
  import("./components/TranslationHistory")
);
const AboutPage = lazy(() => import("./pages/AboutPage"));
const KeyboardShortcutsPage = lazy(() =>
  import("./pages/KeyboardShortcutsPage")
);

function App() {
  // Use state for theme instead of system preference for toggle support
  const [mode, setMode] = useState(() => {
    // Initialize from localStorage with fallback to system preference
    const savedMode = localStorage.getItem("theme");
    if (savedMode) return savedMode;

    // Use system preference as fallback
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Initialize translation history storage when the app starts
  useEffect(() => {
    initializeTranslationStorage();
  }, []);

  // Save theme preference to localStorage
  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("theme", newMode);
  };

  // Create theme based on current mode with better accessibility standards
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#4285f4",
            light: "#7baaf7",
            dark: "#2a67c9",
            contrastText: "#ffffff",
          },
          secondary: {
            main: "#34a853",
            light: "#5ebb7a",
            dark: "#217537",
            contrastText: "#ffffff",
          },
          error: {
            main: "#ea4335",
          },
          background: {
            default: mode === "light" ? "#f5f5f5" : "#121212",
            paper: mode === "light" ? "#ffffff" : "#1e1e1e",
          },
          text: {
            primary:
              mode === "light"
                ? "rgba(0, 0, 0, 0.87)"
                : "rgba(255, 255, 255, 0.87)",
            secondary:
              mode === "light"
                ? "rgba(0, 0, 0, 0.6)"
                : "rgba(255, 255, 255, 0.6)",
          },
        },
        typography: {
          fontFamily: "'Roboto', 'Segoe UI', 'Helvetica Neue', sans-serif",
          h3: {
            fontWeight: 600,
          },
          button: {
            fontWeight: 500,
          },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 500,
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderWidth: 2,
                  },
                },
              },
            },
          },
          // Add focus visible styles for better accessibility
          MuiCssBaseline: {
            styleOverrides: {
              "*:focus-visible": {
                outline: `2px solid ${
                  mode === "light" ? "#4285f4" : "#7baaf7"
                } !important`,
                outlineOffset: "2px !important",
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Layout toggleTheme={toggleTheme} isDarkMode={mode === "dark"} />
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<LoadingIndicator />}>
                  <Translator />
                </Suspense>
              }
            />
            <Route
              path="history"
              element={
                <Suspense fallback={<LoadingIndicator />}>
                  <TranslationHistory userId="guest" />
                </Suspense>
              }
            />
            <Route
              path="shortcuts"
              element={
                <Suspense fallback={<LoadingIndicator />}>
                  <KeyboardShortcutsPage />
                </Suspense>
              }
            />
            <Route
              path="about"
              element={
                <Suspense fallback={<LoadingIndicator />}>
                  <AboutPage />
                </Suspense>
              }
            />
            <Route
              path="*"
              element={
                <Suspense fallback={<LoadingIndicator />}>
                  <NotFound />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

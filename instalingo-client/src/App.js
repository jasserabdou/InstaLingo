import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import Translator from './components/Main_Translator';
import NotFound from './components/Not_Found';
import './App.css';

function App() {
  // Use state for theme instead of system preference for toggle support
  const [mode, setMode] = useState(localStorage.getItem('theme') || 'light');
  
  // Save theme preference to localStorage
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme', newMode);
  };
  
  // Create theme based on current mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#4285f4',
          },
          secondary: {
            main: '#34a853',
          },
          background: {
            default: mode === 'light' ? '#f5f5f5' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
        typography: {
          fontFamily: "'Roboto', 'Segoe UI', 'Helvetica Neue', sans-serif",
          h3: {
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout toggleTheme={toggleTheme} isDarkMode={mode === 'dark'} />}>
            <Route index element={<Translator />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
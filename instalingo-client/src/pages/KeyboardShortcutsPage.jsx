import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Skeleton,
  Divider,
} from "@mui/material";
import { getKeyboardShortcuts } from "../services/translationService";

const KeyboardShortcutsPage = () => {
  const [shortcuts, setShortcuts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchShortcuts = async () => {
      try {
        setIsLoading(true);
        const data = await getKeyboardShortcuts();
        setShortcuts(data);
        setError("");
      } catch (error) {
        console.error("Failed to fetch keyboard shortcuts:", error);
        setError("Failed to load keyboard shortcuts. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchShortcuts();
  }, []);

  const additionalShortcuts = {
    Escape: "Clear text input",
    Tab: "Navigate between elements",
    "Shift+Tab": "Navigate backward",
    Space: "Activate buttons when focused",
    "/?": "Show this shortcuts page",
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Keyboard Shortcuts
      </Typography>

      <Typography
        variant="body1"
        paragraph
        align="center"
        color="text.secondary"
      >
        Use these keyboard shortcuts to navigate and use InstaLingo more
        efficiently.
      </Typography>

      <Paper elevation={2} sx={{ mt: 3, overflow: "hidden", borderRadius: 2 }}>
        <Box
          sx={{ p: 3, bgcolor: "primary.main", color: "primary.contrastText" }}
        >
          <Typography variant="h6">Translation Shortcuts</Typography>
        </Box>

        <TableContainer>
          <Table aria-label="Translation keyboard shortcuts">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Shortcut</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                [...Array(4)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton width={100} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={200} />
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    {error}
                  </TableCell>
                </TableRow>
              ) : (
                // Actual data
                Object.entries(shortcuts).map(([key, action]) => (
                  <TableRow key={key} hover>
                    <TableCell
                      sx={{ fontFamily: "monospace", fontWeight: 500 }}
                    >
                      {key}
                    </TableCell>
                    <TableCell>{action}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper elevation={2} sx={{ mt: 4, overflow: "hidden", borderRadius: 2 }}>
        <Box
          sx={{
            p: 3,
            bgcolor: "secondary.main",
            color: "secondary.contrastText",
          }}
        >
          <Typography variant="h6">General Navigation Shortcuts</Typography>
        </Box>

        <TableContainer>
          <Table aria-label="General navigation shortcuts">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Shortcut</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(additionalShortcuts).map(([key, action]) => (
                <TableRow key={key} hover>
                  <TableCell sx={{ fontFamily: "monospace", fontWeight: 500 }}>
                    {key}
                  </TableCell>
                  <TableCell>{action}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Keyboard shortcuts improve efficiency and accessibility. They provide
          alternative ways to perform actions without using a mouse.
        </Typography>
      </Box>
    </Container>
  );
};

export default KeyboardShortcutsPage;

import React from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      p={2}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          width: "100%",
          textAlign: "center",
          borderRadius: 2,
        }}
      >
        <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />

        <Typography variant="h5" component="h2" gutterBottom color="error">
          Something went wrong
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          {error.message || "An unexpected error occurred"}
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={resetErrorBoundary}
            sx={{ mr: 2 }}
          >
            Try again
          </Button>

          <Button
            variant="outlined"
            onClick={() => (window.location.href = "/")}
          >
            Go to homepage
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ErrorFallback;

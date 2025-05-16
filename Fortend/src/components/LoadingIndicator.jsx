import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingIndicator = ({ message = "Loading..." }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="300px"
      textAlign="center"
      p={3}
    >
      <CircularProgress color="primary" size={40} thickness={4} />
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingIndicator;

import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        flexDirection: 'column',
        minHeight: '60vh'
      }}
    >
      <Paper elevation={3} sx={{ p: 5, borderRadius: 2, maxWidth: 500, textAlign: 'center' }}>
        <ErrorIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" paragraph>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          to="/"
          sx={{ mt: 2 }}
        >
          Return to Translator
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound;
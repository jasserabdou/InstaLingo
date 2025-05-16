import React from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Divider,
  Card,
  CardContent,
  Link as MuiLink,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import TranslateIcon from "@mui/icons-material/Translate";
import SpeedIcon from "@mui/icons-material/Speed";
import SecurityIcon from "@mui/icons-material/Security";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import GitHubIcon from "@mui/icons-material/GitHub";

const AboutPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        About InstaLingo
      </Typography>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Our Mission
        </Typography>
        <Typography variant="body1" paragraph>
          InstaLingo is an advanced, open-source translation application
          designed to break down language barriers and make communication
          accessible to everyone around the globe. We leverage cutting-edge AI
          models to provide accurate, fast translations across multiple
          languages.
        </Typography>
        <Typography variant="body1" paragraph>
          Our mission is to connect people worldwide through seamless language
          translation, making the internet and global communication more
          inclusive and accessible.
        </Typography>
      </Paper>

      <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
        Key Features
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TranslateIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6">Advanced Translation</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Powered by the M2M100 model, InstaLingo provides high-quality
                translations between many language pairs with nuanced
                understanding of context and meaning.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SpeedIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6">Optimized Performance</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Our application uses model quantization, caching, and lazy
                loading to ensure fast translations with minimal resource usage,
                even on lower-end devices.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccessibilityNewIcon
                  color="primary"
                  sx={{ mr: 1, fontSize: 28 }}
                />
                <Typography variant="h6">Accessibility</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                InstaLingo is designed with accessibility in mind, featuring
                keyboard navigation, screen reader support, and a responsive
                interface that works on all devices.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SecurityIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6">Privacy-Focused</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                We respect your privacy. Your translations are not stored on our
                servers unless you explicitly save them, and we use client-side
                caching to improve performance.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box textAlign="center" sx={{ my: 4 }}>
        <Typography variant="h5" gutterBottom>
          Technology Stack
        </Typography>
        <Typography variant="body1" paragraph>
          InstaLingo is built with modern web technologies:
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 1,
            mb: 3,
          }}
        >
          {[
            "React",
            "Flask",
            "PyTorch",
            "Transformers",
            "Material UI",
            "Python",
            "JavaScript",
          ].map((tech) => (
            <Chip key={tech} label={tech} />
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box textAlign="center">
        <Typography variant="h6" gutterBottom>
          Ready to translate?
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          color="primary"
          size="large"
          sx={{ mr: 2, mb: 2 }}
        >
          Go to Translator
        </Button>

        <Button
          href="https://github.com/jasserabdou/Translation-app"
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          startIcon={<GitHubIcon />}
          sx={{ mb: 2 }}
        >
          View on GitHub
        </Button>
      </Box>
    </Container>
  );
};

// Component for technology chips
const Chip = ({ label }) => (
  <Box
    component="span"
    sx={{
      display: "inline-block",
      px: 2,
      py: 1,
      borderRadius: 4,
      bgcolor: "background.paper",
      border: "1px solid",
      borderColor: "primary.light",
      color: "primary.main",
      fontWeight: 500,
      fontSize: "0.875rem",
    }}
  >
    {label}
  </Box>
);

export default AboutPage;

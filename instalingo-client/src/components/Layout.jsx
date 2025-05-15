import React, { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Typography, IconButton, 
  Box, useMediaQuery, Drawer, List, ListItem, 
  ListItemIcon, ListItemText, Container, Divider,
  useTheme
} from '@mui/material';
import { Outlet } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import TranslateIcon from '@mui/icons-material/Translate';
import InfoIcon from '@mui/icons-material/Info';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import GitHubIcon from '@mui/icons-material/GitHub';

const Layout = ({ toggleTheme, isDarkMode }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleKeyPress = (e) => {
    if (e.key === '?') {
      // Show/hide keyboard shortcuts
      console.log('Show keyboard shortcuts');
      // This would typically open a modal with keyboard shortcuts
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const drawerItems = [
    { text: 'Translator', icon: <TranslateIcon />, path: '/' },
    { text: 'Keyboard Shortcuts', icon: <KeyboardIcon />, path: '/shortcuts' },
    { text: 'About', icon: <InfoIcon />, path: '/about' },
    { text: 'GitHub', icon: <GitHubIcon />, path: 'https://github.com/jasserabdou/Translation-app', external: true }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            InstaLingo
          </Typography>
          
          <IconButton color="inherit" onClick={toggleTheme} aria-label="toggle theme">
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer}
          onKeyDown={toggleDrawer}
        >
          <List>
            {drawerItems.map((item) => (
              <ListItem 
                button 
                key={item.text} 
                component={item.external ? 'a' : 'button'} 
                href={item.external ? item.path : undefined} 
                onClick={!item.external ? () => window.location.href = item.path : undefined}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      
      <Container component="main" sx={{ flexGrow: 1, pt: 2, pb: 4 }}>
        <Outlet />
      </Container>
      
      <Box component="footer" sx={{ py: 2, textAlign: 'center', mt: 'auto' }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} InstaLingo | Made with React + Flask
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;
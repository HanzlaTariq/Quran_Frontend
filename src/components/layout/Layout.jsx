import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      {/* Yeh Toolbar space create karega navbar ke height ke barabar */}
      <Toolbar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 2
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
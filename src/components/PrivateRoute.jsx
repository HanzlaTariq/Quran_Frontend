// frontend/src/components/PrivateRoute.jsx - Add admin checks

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CircularProgress,
  Box,
  Container,
  Paper,
  Typography,
  Button,
} from '@mui/material';
import { AdminPanelSettings, Security } from '@mui/icons-material';
import Layout from './layout/Layout';

const PrivateRoute = ({ allowedRoles, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if route requires admin access
  if (requireAdmin && user.role !== 'admin') {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Security sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" paragraph>
            This area is restricted to administrators only.
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            You don't have the necessary permissions to access this page.
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.history.back()}
            sx={{ mr: 2 }}
          >
            Go Back
          </Button>
          <Button variant="outlined" href="/">
            Go to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  // Check if user role is allowed 123
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role
    let redirectPath = '/login';
    
    switch (user.role) {
      case 'student':
        redirectPath = '/student/dashboard';
        break;
      case 'ulma':
        redirectPath = '/ulma/dashboard';
        break;
      case 'admin':
        redirectPath = '/admin/dashboard';
        break;
      default:
        redirectPath = '/login';
    }
    
    return <Navigate to={redirectPath} replace />;
  }

  return <Layout><Outlet /></Layout>;
};

export default PrivateRoute;
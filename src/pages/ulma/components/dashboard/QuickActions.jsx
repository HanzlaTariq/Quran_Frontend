import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Button,
} from '@mui/material';
import {
  Add,
  Videocam,
  Schedule,
  TrendingUp,
  Book,
  MonetizationOn,
  Settings,
  People,
  Assessment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Add Class',
      icon: <Add />,
      color: 'primary',
      onClick: () => navigate('/ulma/schedule/create'),
    },
    {
      label: 'Live Classes',
      icon: <Videocam />,
      color: 'secondary',
      onClick: () => navigate('/ulma/live-class'),
    },
    {
      label: 'Availability',
      icon: <Schedule />,
      color: 'info',
      onClick: () => navigate('/ulma/availability'),
    },
    {
      label: 'Performance',
      icon: <TrendingUp />,
      color: 'success',
      onClick: () => navigate('/ulma/performance'),
    },
    {
      label: 'Quizzes',
      icon: <Book />,
      color: 'warning',
      onClick: () => navigate('/ulma/quizzes'),
    },
    {
      label: 'Earnings',
      icon: <MonetizationOn />,
      color: 'error',
      onClick: () => navigate('/ulma/earnings'),
    },
    {
      label: 'Settings',
      icon: <Settings />,
      color: 'default',
      onClick: () => navigate('/ulma/settings'),
    },
    {
      label: 'Students',
      icon: <People />,
      color: 'primary',
      onClick: () => navigate('/ulma/students'),
    },
    {
      label: 'Reports',
      icon: <Assessment />,
      color: 'secondary',
      onClick: () => navigate('/ulma/reports'),
    },
  ];

  return (
    <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 3 } }}>
      <Typography variant="h6" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={{ xs: 1, sm: 2 }}>
        {actions.map((action, index) => (
          <Grid item xs={6} key={index}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={action.icon}
              onClick={action.onClick}
              color={action.color}
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                height: '100%',
                minHeight: 48,
              }}
            >
              {action.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default QuickActions;
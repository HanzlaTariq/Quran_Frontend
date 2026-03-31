import React from 'react';
import {
  Paper,
  Typography,
  Stack,
  Box,
  Chip,
} from '@mui/material';
import { Star, AccessTime, Groups, School } from '@mui/icons-material';

const QuickStats = ({ profile = {} }) => {
  const stats = [
    {
      label: 'Hourly Rate',
      value: `$${profile?.hourlyRate || 0}/hour`,
      icon: '💵',
      color: 'primary',
    },
    {
      label: 'Total Classes',
      value: profile?.totalClassesConducted || 0,
      icon: <School fontSize="small" />,
      color: 'secondary',
    },
    {
      label: 'Experience',
      value: `${profile?.experience || 0} years`,
      icon: <AccessTime fontSize="small" />,
      color: 'info',
    },
    {
      label: 'Student Satisfaction',
      value: `${profile?.rating?.average?.toFixed(1) || '0.0'} ⭐`,
      icon: <Star fontSize="small" />,
      color: 'warning',
    },
  ];

  return (
    <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 3 } }}>
      <Typography variant="h6" gutterBottom>
        Quick Stats
      </Typography>
      <Stack spacing={2}>
        {stats.map((stat, index) => (
          <Box 
            key={index} 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center"
            sx={{
              p: 1,
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ color: `${stat.color}.main` }}>
                {stat.icon}
              </Box>
              <Typography variant="body2">{stat.label}</Typography>
            </Box>
            <Typography variant="body1" fontWeight="bold" color={`${stat.color}.main`}>
              {stat.value}
            </Typography>
          </Box>
        ))}
        
        {/* Expertise */}
        <Box>
          <Typography variant="body2" gutterBottom>
            Expertise
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={0.5}>
            {profile?.expertise?.slice(0, 4).map((exp, idx) => (
              <Chip 
                key={idx} 
                label={exp.charAt(0).toUpperCase() + exp.slice(1)}
                size="small" 
                color="primary"
                variant="outlined"
              />
            ))}
            {profile?.expertise?.length > 4 && (
              <Chip 
                label={`+${profile.expertise.length - 4}`} 
                size="small" 
              />
            )}
            {(!profile?.expertise || profile.expertise.length === 0) && (
              <Typography variant="caption" color="textSecondary">
                Add your expertise in settings
              </Typography>
            )}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
};

export default QuickStats;
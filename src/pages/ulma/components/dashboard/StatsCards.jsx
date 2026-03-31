import React from 'react';
import { Grid, Box, useMediaQuery, useTheme } from '@mui/material';
import { Groups, Schedule, Star, MonetizationOn } from '@mui/icons-material';
import StatCard from '../common/StatCard';

const StatsCards = ({ data, todaysClasses }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Responsive spacing based on device
  const getSpacing = () => {
    if (isMobile) return { xs: 1, sm: 1.5 };
    if (isTablet) return { xs: 1.5, sm: 2, md: 2.5 };
    return { xs: 2, sm: 3, md: 3 };
  };

  // Responsive margin bottom
  const getMarginBottom = () => {
    if (isMobile) return { xs: 1.5, sm: 2 };
    if (isTablet) return { xs: 2, sm: 2.5, md: 3 };
    return { xs: 3, sm: 4, md: 4 };
  };

  // Responsive grid item sizes
  const getGridSizes = () => {
    if (isMobile) {
      return { xs: 12, sm: 6 }; // Full width on mobile, 2 per row on small
    }
    if (isTablet) {
      return { xs: 12, sm: 6, md: 3 }; // 2 per row on tablet, 4 on desktop
    }
    return { xs: 12, sm: 6, md: 3 }; // Default responsive behavior
  };

  const gridSizes = getGridSizes();

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Grid 
        container 
        spacing={getSpacing()} 
        sx={{ 
          mb: getMarginBottom(),
          // Ensure no horizontal scroll on mobile
          '& .MuiGrid-item': {
            display: 'flex',
            alignItems: 'stretch',
          }
        }}
      >
        <Grid item {...gridSizes}>
          <StatCard
            title="Total Students"
            value={data?.students?.length || 0}
            icon={<Groups />}
            color="primary"
            subtitle="Active enrollments"
          />
        </Grid>
        <Grid item {...gridSizes}>
          <StatCard
            title="Today's Classes"
            value={todaysClasses.length}
            icon={<Schedule />}
            color="secondary"
            subtitle={`${todaysClasses.filter(c => c.status === 'completed').length} completed`}
          />
        </Grid>
        <Grid item {...gridSizes}>
          <StatCard
            title="Rating"
            value={data?.stats?.rating?.toFixed(1) || '0.0'}
            icon={<Star />}
            color="warning"
            subtitle={`${data?.stats?.totalReviews || 0} reviews`}
          />
        </Grid>
        <Grid item {...gridSizes}>
          <StatCard
            title="Monthly Earnings"
            value={`$${data?.stats?.monthlyEarnings || 0}`}
            icon={<MonetizationOn />}
            color="success"
            subtitle="This month"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatsCards;
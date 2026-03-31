import React from 'react';
import { Paper, Grid, Typography, Button, Box, Avatar, Chip, alpha, useTheme, useMediaQuery } from '@mui/material';
import { Videocam, School, EmojiEmotions, TrendingUp, CalendarToday, MenuBook, Stars, Bolt } from '@mui/icons-material';

const WelcomeHeader = ({ 
  user, 
  stats, 
  activeEnrollment, 
  upcomingClass, 
  onJoinClass 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Agar koi live class chal rahi hai to join button dikhao
  const hasLiveClass = upcomingClass?.status === 'ongoing';
  
  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get motivational message based on progress
  const getMotivationalMessage = () => {
    if (stats.progressPercentage >= 75) {
      return "You're almost there! Keep up the amazing work! 🌟";
    } else if (stats.progressPercentage >= 50) {
      return "Halfway there! You're doing great! 💪";
    } else if (stats.progressPercentage >= 25) {
      return "Great start! Consistency is key! 📚";
    } else {
      return "Every journey begins with a single step. Let's begin! 🚀";
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        mb: { xs: 2, sm: 3 },
        borderRadius: { xs: 3, sm: 4 },
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.12)}`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        },
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: { xs: 150, sm: 200, md: 250 },
          height: { xs: 150, sm: 200, md: 250 },
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`,
          borderRadius: '50%',
          pointerEvents: 'none',
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
            '50%': { transform: 'translate(-20px, 20px) rotate(5deg)' },
          },
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: { xs: 120, sm: 150, md: 180 },
          height: { xs: 120, sm: 150, md: 180 },
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.06)} 0%, transparent 70%)`,
          borderRadius: '50%',
          pointerEvents: 'none',
          animation: 'floatReverse 8s ease-in-out infinite',
          '@keyframes floatReverse': {
            '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
            '50%': { transform: 'translate(20px, -20px) rotate(-5deg)' },
          },
        }}
      />

      <Grid container spacing={3} alignItems="center" justifyContent="space-between" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid item xs={12} md={8}>
          <Box display="flex" alignItems="center" gap={{ xs: 2, sm: 3 }} flexWrap="wrap">
            {/* Animated Avatar */}
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                sx={{ 
                  width: { xs: 64, sm: 72, md: 80 }, 
                  height: { xs: 64, sm: 72, md: 80 }, 
                  bgcolor: 'primary.main',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                  animation: 'pulseGlow 2s ease-in-out infinite',
                  '@keyframes pulseGlow': {
                    '0%, 100%': { 
                      boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                      transform: 'scale(1)'
                    },
                    '50%': { 
                      boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                      transform: 'scale(1.02)'
                    },
                  },
                }}
              >
                <Typography variant="h4" fontWeight="bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </Typography>
              </Avatar>
              
              {/* Decorative Ring */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -3,
                  left: -3,
                  right: -3,
                  bottom: -3,
                  borderRadius: '50%',
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  animation: 'rotate 8s linear infinite',
                  '@keyframes rotate': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
            </Box>
            
            <Box>
              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={0.5}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {getGreeting()}, {user?.name}!
                </Typography>
                <EmojiEmotions 
                  sx={{ 
                    color: theme.palette.warning.main,
                    fontSize: { xs: 28, sm: 32 },
                    animation: 'wave 1.5s ease-in-out infinite',
                    '@keyframes wave': {
                      '0%, 100%': { transform: 'rotate(0deg)' },
                      '25%': { transform: 'rotate(15deg)' },
                      '75%': { transform: 'rotate(-10deg)' },
                    },
                  }} 
                />
              </Box>
              
              {/* Enrollment Info with Icon */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  mb: 1.5,
                  flexWrap: 'wrap',
                }}
              >
                <MenuBook sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                <Typography variant="body2" color="textSecondary">
                  {activeEnrollment ? (
                    <>
                      Currently enrolled in <strong style={{ color: theme.palette.primary.main }}>{activeEnrollment.course?.name}</strong> with{' '}
                      <strong style={{ color: theme.palette.secondary.main }}>{activeEnrollment.ulma?.user?.name}</strong>
                    </>
                  ) : (
                    'Ready to start your learning journey? Explore our courses!'
                  )}
                </Typography>
              </Box>
              
              {/* Motivational Message Chip */}
              <Chip
                icon={<Stars sx={{ fontSize: 16 }} />}
                label={getMotivationalMessage()}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.text.primary,
                  fontWeight: 500,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  '& .MuiChip-icon': {
                    color: theme.palette.warning.main,
                  },
                }}
              />
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
            {hasLiveClass ? (
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<Videocam />}
                onClick={() => onJoinClass(upcomingClass._id)}
                sx={{
                  borderRadius: 3,
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1, sm: 1.2 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, #4caf50, #45a049)`,
                  boxShadow: `0 8px 16px ${alpha('#4caf50', 0.3)}`,
                  animation: 'pulse 1.5s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { 
                      transform: 'scale(1)',
                      boxShadow: `0 8px 16px ${alpha('#4caf50', 0.3)}`
                    },
                    '50%': { 
                      transform: 'scale(1.05)',
                      boxShadow: `0 12px 24px ${alpha('#4caf50', 0.4)}`
                    },
                  },
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: `0 12px 24px ${alpha('#4caf50', 0.4)}`,
                  },
                }}
              >
                <Bolt sx={{ mr: 1, animation: 'sparkle 1s infinite' }} />
                Join Live Class Now!
              </Button>
            ) : (
              <Button
                variant="outlined"
                startIcon={<CalendarToday />}
                disabled
                sx={{
                  borderRadius: 3,
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1, sm: 1.2 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  borderWidth: 2,
                  opacity: 0.7,
                  '&:hover': {
                    borderWidth: 2,
                  },
                }}
              >
                No Live Class at the Moment
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Stats Cards - Enhanced Design */}
      <Box 
        sx={{ 
          display: 'flex', 
          gap: { xs: 1.5, sm: 2 },
          mt: { xs: 2, sm: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        {/* Achievement Card - Shows if progress is high */}
        {stats.progressPercentage >= 50 && (
          <Box
            sx={{
              flex: 1,
              p: { xs: 1.5, sm: 2 },
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.05)})`,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&:hover': {
                transform: 'translateY(-2px)',
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.15)}, ${alpha(theme.palette.warning.main, 0.08)})`,
              },
            }}
          >
            <Stars sx={{ fontSize: 40, color: theme.palette.warning.main }} />
            <Box>
              <Typography variant="body2" fontWeight={500} color="warning.main">
                Achievement Unlocked!
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {stats.progressPercentage >= 75 ? 'Excellent Progress' : 'Great Dedication'}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Decorative Divider */}
      <Box
        sx={{
          mt: 2,
          pt: 1,
          display: 'flex',
          justifyContent: 'center',
          gap: 0.8,
        }}
      >
        {[...Array(5)].map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.3 + i * 0.1),
              animation: `fadeInOut ${1 + i * 0.2}s infinite`,
              '@keyframes fadeInOut': {
                '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
                '50%': { opacity: 1, transform: 'scale(1.3)' },
              },
            }}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default WelcomeHeader;
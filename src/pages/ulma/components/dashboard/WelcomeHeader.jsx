import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Avatar, 
  useMediaQuery, 
  useTheme,
  alpha,
  Chip
} from '@mui/material';
import { 
  School, 
  EmojiEmotions,
  Brightness1,
  Mosque,
  MenuBook,
  Star
} from '@mui/icons-material';

const WelcomeHeader = ({ userName }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get beautiful Arabic calligraphy style greeting
  const getArabicGreeting = () => {
    return "السلام عليكم";
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 4, md: 5 },
        mb: { xs: 3, sm: 4 },
        borderRadius: { xs: 3, sm: 4, md: 5 },
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        },
      }}
    >
      {/* Decorative Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: { xs: 150, sm: 200, md: 300 },
          height: { xs: 150, sm: 200, md: 300 },
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
          borderRadius: '50%',
          pointerEvents: 'none',
          animation: 'float 8s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translate(0, 0)' },
            '50%': { transform: 'translate(-20px, 20px)' },
          },
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: { xs: 120, sm: 150, md: 200 },
          height: { xs: 120, sm: 150, md: 200 },
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.08)} 0%, transparent 70%)`,
          borderRadius: '50%',
          pointerEvents: 'none',
          animation: 'floatReverse 10s ease-in-out infinite',
          '@keyframes floatReverse': {
            '0%, 100%': { transform: 'translate(0, 0)' },
            '50%': { transform: 'translate(20px, -20px)' },
          },
        }}
      />

      {/* Main Content */}
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'center', sm: 'flex-start' }}
        justifyContent="space-between"
        gap={{ xs: 3, sm: 4 }}
        sx={{ position: 'relative', zIndex: 1 }}
      >
        {/* Left Section - User Info */}
        <Box
          display="flex"
          alignItems="center"
          gap={{ xs: 2, sm: 3 }}
          flex={1}
        >
          {/* Animated Avatar */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: { xs: 70, sm: 85, md: 100 },
                height: { xs: 70, sm: 85, md: 100 },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                animation: 'pulse 3s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)', boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.3)}` },
                  '50%': { transform: 'scale(1.05)', boxShadow: `0 15px 35px ${alpha(theme.palette.primary.main, 0.4)}` },
                },
                '& .MuiSvgIcon-root': {
                  fontSize: { xs: 40, sm: 45, md: 55 },
                },
              }}
            >
              <Mosque />
            </Avatar>
            
            {/* Decorative Ring */}
            <Box
              sx={{
                position: 'absolute',
                top: -5,
                left: -5,
                right: -5,
                bottom: -5,
                borderRadius: '50%',
                border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                animation: 'rotate 10s linear infinite',
                '@keyframes rotate': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
          </Box>
          
          <Box>
            {/* Arabic Greeting */}
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                color: alpha(theme.palette.primary.main, 0.7),
                fontWeight: 600,
                mb: 0.5,
                fontFamily: '"Amiri", "Traditional Arabic", serif',
                letterSpacing: '1px',
              }}
            >
              {getArabicGreeting()}
            </Typography>
            
            {/* English Greeting with Name */}
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={1}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  letterSpacing: '-0.5px',
                }}
              >
                {getGreeting()}, Sheikh {userName}
              </Typography>
              <EmojiEmotions 
                sx={{ 
                  color: theme.palette.warning.main,
                  fontSize: { xs: 28, sm: 32, md: 36 },
                  animation: 'wave 2s ease-in-out infinite',
                  '@keyframes wave': {
                    '0%, 100%': { transform: 'rotate(0deg)' },
                    '25%': { transform: 'rotate(15deg)' },
                    '75%': { transform: 'rotate(-10deg)' },
                  },
                }} 
              />
            </Box>
            
            {/* Welcome Message with Icons */}
            <Box 
              display="flex" 
              alignItems="center" 
              gap={1} 
              flexWrap="wrap"
              sx={{ mb: 1.5 }}
            >
              <School sx={{ fontSize: 16, color: theme.palette.primary.main }} />
              <Typography 
                color="textSecondary"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 500,
                }}
              >
                Your sacred journey of knowledge continues
              </Typography>
              <MenuBook sx={{ fontSize: 16, color: theme.palette.secondary.main }} />
            </Box>
            
            {/* Motivational Quote */}
            <Chip
              icon={<Brightness1 sx={{ fontSize: 12 }} />}
              label="✨ Seek knowledge from the cradle to the grave ✨"
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.text.secondary,
                fontWeight: 500,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                '& .MuiChip-icon': {
                  color: theme.palette.primary.main,
                },
              }}
            />
          </Box>
        </Box>

        {/* Right Section - Decorative Stats Badge */}
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            position: 'relative',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 3,
              px: 2,
              py: 1.5,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Star sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Teaching Excellence
            </Typography>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: theme.palette.success.main,
                animation: 'blink 1.5s infinite',
                '@keyframes blink': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.3 },
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Decorative Divider with Pattern */}
      <Box
        sx={{
          mt: 3,
          pt: 2,
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        {[...Array(5)].map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.3 + i * 0.1),
              animation: `fadeInOut ${1.5 + i * 0.3}s infinite`,
              '@keyframes fadeInOut': {
                '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
                '50%': { opacity: 1, transform: 'scale(1.2)' },
              },
            }}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default WelcomeHeader;
import React from 'react';
import {
  Box,
  Container,
  Grid,
  Chip,
  Typography,
  Stack,
  Button,
  Zoom,
  Fade,
  Slide,
  useMediaQuery,
  useTheme,
  Paper,
  alpha,
} from '@mui/material';
import {
  Star,
  EmojiEvents,
  Public,
  TrendingUp,
  PlayCircle,
  MenuBook,
  AutoAwesome,
  School,
  Verified,
  Security,
  Speed,
  WbSunny,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSystemSettings } from '../../../context/SystemSettingsContext';

const HeroSection = ({ heroRef, heroInView, navigate }) => {
  const { settings } = useSystemSettings();
  const siteName = settings?.general?.siteName || 'Quran Academy';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const stats = [
    { icon: <Star sx={{ fontSize: 18 }} />, label: 'Rated 4.9 by Families', color: '#f4c95d' },
    { icon: <Verified sx={{ fontSize: 18 }} />, label: 'Ijazah Certified Ulama', color: '#49b88f' },
    { icon: <Public sx={{ fontSize: 18 }} />, label: 'Students in 35+ Countries', color: '#8fd3c1' },
    { icon: <TrendingUp sx={{ fontSize: 18 }} />, label: '99% Progress Completion', color: '#ff9f6e' },
  ];

  const floatingShapes = [
    { top: '8%', left: '6%', size: 160, delay: 0 },
    { top: '12%', right: '8%', size: 220, delay: 0.4 },
    { bottom: '10%', left: '10%', size: 180, delay: 0.8 },
    { bottom: '14%', right: '14%', size: 140, delay: 1.2 },
  ];

  return (
    <Box
      ref={heroRef}
      sx={{
        minHeight: { xs: 'auto', md: '100vh' },
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        py: { xs: 10, md: 8 },
        background:
          'radial-gradient(1200px 600px at 90% 0%, rgba(196,149,66,0.22) 0%, rgba(196,149,66,0) 60%), linear-gradient(140deg, #0e2a24 0%, #12372f 50%, #0a1f1a 100%)',
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {floatingShapes.map((shape, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: [0.15, 0.28, 0.15], scale: [1, 1.08, 1], y: [0, -12, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: shape.delay,
            }}
            style={{
              position: 'absolute',
              top: shape.top,
              right: shape.right,
              bottom: shape.bottom,
              left: shape.left,
              width: `${shape.size}px`,
              height: `${shape.size}px`,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(244,201,93,0.18) 0%, rgba(244,201,93,0) 72%)',
            }}
          />
        ))}

        {[...Array(22)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            initial={{ opacity: 0.2, y: 10 }}
            animate={{ opacity: [0.1, 0.42, 0.1], y: [10, -240, 10] }}
            transition={{
              duration: 5 + (i % 4),
              repeat: Infinity,
              delay: i * 0.25,
            }}
            style={{
              position: 'absolute',
              left: `${(i * 7) % 100}%`,
              bottom: '-50px',
              width: '2px',
              height: '10px',
              borderRadius: '50%',
              background: 'linear-gradient(to top, rgba(143,211,193,0.1), rgba(143,211,193,0.7))',
            }}
          />
        ))}
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center">
          <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 1 } }}>
            <Fade in={heroInView} timeout={800}>
              <Box>
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <Chip
                    icon={<AutoAwesome sx={{ color: '#FFD700' }} />}
                    label={`Elite One-on-One ${siteName}`}
                    sx={{
                      bgcolor: 'rgba(244,201,93,0.15)',
                      color: '#f4c95d',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      mb: 3,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(244,201,93,0.45)',
                      letterSpacing: '0.3px',
                      '& .MuiChip-icon': {
                        color: '#f4c95d',
                      },
                    }}
                  />
                </motion.div>

                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '2.1rem', sm: '2.8rem', md: '3.2rem', lg: '4rem' },
                    lineHeight: 1.12,
                    mb: 2.3,
                    color: '#f8f8f2',
                    maxWidth: '16ch',
                  }}
                >
                  Learn Quran with
                  <br />
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(135deg, #f4c95d 0%, #ffd67a 45%, #d39b2d 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      display: 'inline-block',
                    }}
                  >
                    Noor, Nazm, and
                  </Box>
                  <br />
                  Real Progress.
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(235,247,241,0.9)',
                    mb: 4,
                    fontWeight: 400,
                    lineHeight: 1.72,
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    maxWidth: '56ch',
                  }}
                >
                  Certified teachers, structured Tajweed roadmap, and gentle mentorship for kids and adults.
                  From Qaida to Hifz and Tafseer, every lesson is personalized so your family feels confident
                  and spiritually connected.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ width: isMobile ? '100%' : 'auto' }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/register')}
                      fullWidth={isMobile}
                      sx={{
                        background: 'linear-gradient(135deg, #f4c95d 0%, #e5ad3d 100%)',
                        color: '#19332a',
                        fontWeight: 800,
                        fontSize: '1rem',
                        px: 3.4,
                        py: 1.4,
                        borderRadius: '14px',
                        textTransform: 'none',
                        boxShadow: '0 18px 35px -16px rgba(244,201,93,0.65)',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 24px 40px -15px rgba(244,201,93,0.72)',
                        },
                      }}
                      endIcon={<PlayCircle />}
                    >
                      Book Free Trial Class
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ width: isMobile ? '100%' : 'auto' }}
                  >
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/courses')}
                      fullWidth={isMobile}
                      sx={{
                        borderColor: 'rgba(235,247,241,0.7)',
                        color: '#ebf7f1',
                        fontWeight: 700,
                        fontSize: '1rem',
                        px: 3.4,
                        py: 1.35,
                        borderRadius: '14px',
                        textTransform: 'none',
                        borderWidth: 2,
                        bgcolor: 'rgba(255,255,255,0.03)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.09)',
                          borderColor: '#f4c95d',
                          borderWidth: 2,
                        },
                      }}
                      endIcon={<MenuBook />}
                    >
                      View Learning Paths
                    </Button>
                  </motion.div>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    mt: 4,
                    flexWrap: 'wrap',
                    gap: 1.5,
                  }}
                >
                  {stats.map((stat, index) => (
                    <Slide
                      key={stat.label}
                      direction="up"
                      in={heroInView}
                      timeout={500 + index * 100}
                    >
                      <Chip
                        icon={stat.icon}
                        label={stat.label}
                        sx={{
                          bgcolor: alpha(stat.color, 0.12),
                          color: stat.color,
                          fontWeight: 600,
                          backdropFilter: 'blur(6px)',
                          border: `1px solid ${alpha(stat.color, 0.35)}`,
                          '& .MuiChip-label': {
                            px: 1.3,
                          },
                          '& .MuiChip-icon': {
                            color: stat.color,
                          },
                        }}
                      />
                    </Slide>
                  ))}
                </Stack>
              </Box>
            </Fade>
          </Grid>

          <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 2 } }}>
            <Zoom in={heroInView} timeout={1000}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  pl: { xs: 0, md: 2 },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    width: '92%',
                    height: '92%',
                    background: 'radial-gradient(circle, rgba(244,201,93,0.24) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(55px)',
                  }}
                />

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ width: '100%', maxWidth: 560, position: 'relative', zIndex: 2 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: '26px',
                      overflow: 'hidden',
                      position: 'relative',
                      background: 'rgba(13,41,34,0.72)',
                      backdropFilter: 'blur(9px)',
                      border: '1px solid rgba(235,247,241,0.22)',
                      boxShadow: '0 34px 70px -24px rgba(5,12,10,0.9)',
                    }}
                  >
                    <Box
                      component="img"
                      src="https://i.pinimg.com/736x/d9/f8/46/d9f846cf0b450e5ac66340c7e47cada5.jpg"
                      alt="Holy Quran"
                      sx={{
                        width: '100%',
                        height: { xs: 300, sm: 360, md: 430 },
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: '26px',
                        transition: 'transform 0.5s ease',
                        '&:hover': {
                          transform: 'scale(1.03)',
                        },
                      }}
                    />

                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(8,24,20,0.95), rgba(8,24,20,0.2), transparent)',
                        p: 3,
                        textAlign: 'left',
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color:"#ebf7f1",
                          fontWeight: 700,
                          fontFamily: '"Amiri", "Traditional Arabic", serif',
                          fontSize: { xs: '2rem', md: '2rem' },
                          letterSpacing: '1px',
                        }}
                      >
                        ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(235,247,241,0.88)',
                          display: 'block',
                          mt: 0.8,
                          fontSize: '0.83rem',
                        }}
                      >
                        "Read! In the Name of your Lord" - Surah Al-Alaq 96:1
                      </Typography>
                    </Box>
                  </Paper>

                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    style={{
                      position: 'absolute',
                      top: -18,
                      right: -10,
                      zIndex: 1,
                    }}
                  >
                    <School sx={{ fontSize: 48, color: 'rgba(244,201,93,0.28)' }} />
                  </motion.div>

                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2.8, repeat: Infinity }}
                    style={{
                      position: 'absolute',
                      bottom: -12,
                      left: -10,
                      zIndex: 1,
                    }}
                  >
                    <WbSunny sx={{ fontSize: 38, color: 'rgba(143,211,193,0.35)' }} />
                  </motion.div>

                  <Paper
                    elevation={0}
                    sx={{
                      position: 'absolute',
                      top: { xs: 14, md: 26 },
                      left: { xs: 14, md: -18 },
                      px: 1.6,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: 'rgba(13,41,34,0.86)',
                      border: '1px solid rgba(244,201,93,0.35)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      position: 'absolute',
                      right: { xs: 12, md: -22 },
                      bottom: { xs: 16, md: 24 },
                      px: 1.6,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: 'rgba(13,41,34,0.86)',
                      border: '1px solid rgba(143,211,193,0.4)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Speed sx={{ color: '#8fd3c1', fontSize: 20 }} />
                      <Typography sx={{ color: '#ebf7f1', fontWeight: 700, fontSize: '0.82rem' }}>
                        Fast Weekly Progress
                      </Typography>
                    </Stack>
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      mt: 2.3,
                      p: 1.6,
                      borderRadius: 2.5,
                      bgcolor: 'rgba(11,35,29,0.78)',
                      border: '1px solid rgba(235,247,241,0.16)',
                      backdropFilter: 'blur(6px)',
                    }}
                  >
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.1}>
                      <Chip
                        icon={<Security sx={{ fontSize: 16 }} />}
                        label="Safe one-on-one classrooms"
                        sx={{
                          bgcolor: 'rgba(73,184,143,0.14)',
                          color: '#8fd3c1',
                          border: '1px solid rgba(73,184,143,0.35)',
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        icon={<EmojiEvents sx={{ fontSize: 16 }} />}
                        label="Structured Tajweed pathway"
                        sx={{
                          bgcolor: 'rgba(244,201,93,0.14)',
                          color: '#f4c95d',
                          border: '1px solid rgba(244,201,93,0.35)',
                          fontWeight: 600,
                        }}
                      />
                    </Stack>
                  </Paper>
                </motion.div>
              </Box>
            </Zoom>
          </Grid>
        </Grid>
      </Container>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          position: 'absolute',
          bottom: 22,
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 'pointer',
          zIndex: 8,
        }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <Box
          sx={{
            width: 28,
            height: 45,
            border: '2px solid rgba(235,247,241,0.5)',
            borderRadius: '20px',
            position: 'relative',
          }}
        >
          <Box
            component={motion.div}
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            sx={{
              width: 3,
              height: 8,
              backgroundColor: '#f4c95d',
              borderRadius: '2px',
              position: 'absolute',
              top: 8,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </Box>
      </motion.div>
    </Box>
  );
};

export default HeroSection;
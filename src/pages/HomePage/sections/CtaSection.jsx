import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Paper,
  alpha,
  Grid,
  Chip,
} from '@mui/material';
import {
  Verified,
  ArrowForward,
  School,
  EmojiEvents,
  Speed,
  Security,
  WorkspacePremium,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const CtaSection = ({ navigate }) => {
  const highlights = [
    { icon: <Verified sx={{ fontSize: 18 }} />, text: 'Certified Teachers', color: '#49b88f' },
    { icon: <Security sx={{ fontSize: 18 }} />, text: 'Safe 1-on-1 Classes', color: '#8fd3c1' },
    { icon: <WorkspacePremium sx={{ fontSize: 18 }} />, text: 'Free Trial Session', color: '#f4c95d' },
    { icon: <Speed sx={{ fontSize: 18 }} />, text: 'Weekly Progress Reports', color: '#ffb07a' },
  ];

  const stats = [
    { value: '15K+', label: 'Students Taught', icon: <School />, color: '#49b88f' },
    { value: '99%', label: 'Parent Satisfaction', icon: <EmojiEvents />, color: '#f4c95d' },
    { value: '24/7', label: 'Support Team', icon: <Security />, color: '#8fd3c1' },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 11 },
        position: 'relative',
        overflow: 'hidden',
        background:
          'radial-gradient(1000px 380px at 5% 5%, rgba(244,201,93,0.15) 0%, rgba(244,201,93,0) 60%), linear-gradient(145deg, #0d2b24 0%, #133b32 52%, #0b221c 100%)',
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[...Array(18)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.15, 0.4, 0.15], y: [0, -40, 0] }}
            transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.2 }}
            style={{
              position: 'absolute',
              left: `${(i * 7) % 100}%`,
              top: `${(i * 9) % 100}%`,
              width: 2,
              height: 12,
              borderRadius: 20,
              background: 'linear-gradient(to top, rgba(143,211,193,0.1), rgba(143,211,193,0.7))',
            }}
          />
        ))}
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: { xs: 4, md: 5 },
            bgcolor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.14)',
            backdropFilter: 'blur(7px)',
          }}
        >
          <Stack spacing={2.2} alignItems="center" textAlign="center">
            <Chip
              label="FREE TRIAL OPEN NOW"
              sx={{
                bgcolor: 'rgba(244,201,93,0.2)',
                color: '#f4c95d',
                fontWeight: 800,
                border: '1px solid rgba(244,201,93,0.4)',
                letterSpacing: '0.5px',
              }}
            />

            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.9rem', sm: '2.4rem', md: '3.2rem' },
                lineHeight: 1.15,
                color: '#f5fbf8',
                maxWidth: '20ch',
              }}
            >
              Start Your Quran Journey with Confidence
            </Typography>

            <Typography sx={{ color: 'rgba(235,247,241,0.9)', maxWidth: 760, lineHeight: 1.75 }}>
              Learn with experienced Ulama, personalized planning, and a spiritual-first learning path.
              Your first class is completely free.
            </Typography>

            <Grid container spacing={1.2} justifyContent="center" sx={{ mt: 1 }}>
              {highlights.map((item, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                      py: 1,
                      px: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(item.color, 0.14),
                      color: item.color,
                      border: `1px solid ${alpha(item.color, 0.35)}`,
                    }}
                  >
                    {item.icon}
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>{item.text}</Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                endIcon={<ArrowForward />}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3.5,
                  py: 1.2,
                  fontWeight: 800,
                  bgcolor: '#f4c95d',
                  color: '#173a2f',
                  '&:hover': {
                    bgcolor: '#e5b84e',
                  },
                }}
              >
                Claim Free Trial Class
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/courses')}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3.5,
                  py: 1.2,
                  fontWeight: 700,
                  borderColor: 'rgba(235,247,241,0.6)',
                  color: '#ebf7f1',
                  '&:hover': {
                    borderColor: '#f4c95d',
                    bgcolor: 'rgba(255,255,255,0.08)',
                  },
                }}
              >
                Browse Programs
              </Button>
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.2}
              sx={{ width: '100%', mt: 2.2 }}
              justifyContent="center"
            >
              {stats.map((item, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    px: 2,
                    py: 1.4,
                    minWidth: { xs: '100%', sm: 180 },
                    textAlign: 'center',
                    bgcolor: alpha(item.color, 0.12),
                    border: `1px solid ${alpha(item.color, 0.34)}`,
                    color: item.color,
                    borderRadius: 2.5,
                  }}
                >
                  <Box sx={{ mb: 0.5 }}>{item.icon}</Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.2 }}>{item.value}</Typography>
                  <Typography sx={{ fontSize: '0.76rem', color: 'rgba(235,247,241,0.88)', fontWeight: 600 }}>
                    {item.label}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default CtaSection;
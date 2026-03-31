import React from 'react';
import { Container, Box, Chip, Typography, Grid, Paper, Stack, Avatar, alpha } from '@mui/material';
import { Star, FormatQuote } from '@mui/icons-material';
import { motion } from 'framer-motion';

const TestimonialsSection = ({ testimonialsRef, testimonials }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 34, scale: 0.97 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.62,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <Box
      ref={testimonialsRef}
      sx={{
        py: { xs: 8, md: 12 },
        background:
          'radial-gradient(900px 380px at 15% 10%, rgba(143,211,193,0.13) 0%, rgba(143,211,193,0) 60%), #ffffff',
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{ textAlign: 'center', mb: 6 }}
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
        >
          <Chip
            label="Voices of Our Students"
            sx={{
              bgcolor: 'rgba(73,184,143,0.14)',
              color: '#0f5c49',
              fontWeight: 700,
              border: '1px solid rgba(73,184,143,0.35)',
            }}
          />
          <Typography variant="h2" sx={{ fontWeight: 900, fontSize: { xs: '1.9rem', md: '2.8rem' }, mt: 2, color: '#132f25' }}>
            Real Progress, Real Families
          </Typography>
        </Box>

        <Grid
          container
          spacing={3.2}
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {testimonials.map((t, idx) => (
            <Grid item xs={12} md={4} key={idx} component={motion.div} variants={itemVariants}>
              <Paper
                elevation={0}
                sx={{
                  p: 3.2,
                  borderRadius: 4,
                  height: '100%',
                  bgcolor: '#ffffff',
                  border: '1px solid rgba(18,64,50,0.12)',
                  boxShadow: '0 20px 38px -28px rgba(10,30,23,0.45)',
                  transition: '0.3s',
                  '&:hover': {
                    boxShadow: '0 28px 46px -28px rgba(18,64,50,0.4)',
                    transform: 'translateY(-7px)',
                  },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar src={t.image} sx={{ width: 56, height: 56, border: '2px solid rgba(73,184,143,0.3)' }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a3e32', fontSize: '1rem' }}>
                        {t.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#5f7d72', fontWeight: 600 }}>
                        {t.country}
                      </Typography>
                    </Box>
                  </Stack>
                  <FormatQuote sx={{ color: alpha('#1f5a49', 0.3), fontSize: 30 }} />
                </Stack>

                <Box sx={{ display: 'flex', mb: 1.8 }}>
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} sx={{ color: '#f4c95d', fontSize: 19 }} />
                  ))}
                </Box>

                <Typography variant="body1" sx={{ color: '#3d5f53', lineHeight: 1.75, fontStyle: 'italic' }}>
                  "{t.text}"
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default TestimonialsSection;

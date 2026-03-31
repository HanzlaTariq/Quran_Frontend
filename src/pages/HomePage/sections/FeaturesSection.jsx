import React from 'react';
import { Container, Box, Chip, Typography, Grid, Card, alpha } from '@mui/material';
import { motion } from 'framer-motion';

const FeaturesSection = ({ featuresRef, features }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.11,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 34 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.62,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <Box
      ref={featuresRef}
      sx={{
        py: { xs: 8, md: 12 },
        background:
          'radial-gradient(1200px 420px at 20% 0%, rgba(73,184,143,0.08) 0%, rgba(73,184,143,0) 65%), #f7faf8',
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{ textAlign: 'center', mb: 7 }}
          component={motion.div}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55 }}
        >
          <Chip
            label="Why Families Choose IQRA"
            sx={{
              bgcolor: 'rgba(73,184,143,0.14)',
              color: '#0f5c49',
              fontWeight: 700,
              mb: 2,
              border: '1px solid rgba(73,184,143,0.3)',
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.9rem', md: '3rem' },
              color: '#10271f',
              mb: 1.3,
            }}
          >
            A Complete Quran Learning System
          </Typography>
          <Typography sx={{ color: '#3f5e54', maxWidth: 700, mx: 'auto', lineHeight: 1.7 }}>
            Built for real outcomes, spiritual growth, and family peace of mind.
          </Typography>
        </Box>

        <Grid
          container
          spacing={3}
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx} component={motion.div} variants={itemVariants}>
              <Card
                sx={{
                  height: '100%',
                  p: 3,
                  borderRadius: 4,
                  background: '#ffffff',
                  border: `1px solid ${alpha(feature.color, 0.2)}`,
                  boxShadow: '0 20px 38px -28px rgba(18,45,36,0.45)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 26px 42px -24px ${alpha(feature.color, 0.45)}`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 62,
                    height: 62,
                    borderRadius: 3,
                    display: 'grid',
                    placeItems: 'center',
                    color: feature.color,
                    bgcolor: alpha(feature.color, 0.13),
                    mb: 2,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.2, color: '#123027', fontSize: '1.18rem' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" sx={{ color: '#48675d', lineHeight: 1.65 }}>
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturesSection;

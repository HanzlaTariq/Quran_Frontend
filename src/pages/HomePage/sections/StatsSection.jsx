import React from 'react';
import { Box, Container, Grid, Typography, alpha } from '@mui/material';
import { motion } from 'framer-motion';

const StatsSection = ({ stats }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 26, scale: 0.96 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <Box
      sx={{
        py: { xs: 5, md: 6 },
        background:
          'linear-gradient(135deg, #0f2e27 0%, #123a31 55%, #0d2620 100%)',
        borderBottom: '1px solid rgba(244,201,93,0.18)',
        borderTop: '1px solid rgba(244,201,93,0.18)',
      }}
    >
      <Container maxWidth="xl">
        <Grid
          container
          spacing={3}
          justifyContent="center"
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {stats.map((stat, idx) => (
            <Grid item xs={6} sm={4} md={2} key={idx} component={motion.div} variants={itemVariants}>
              <Box
                sx={{
                  textAlign: 'center',
                  borderRadius: 3,
                  py: 1.8,
                  px: 1,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(6px)',
                  transition: 'transform 0.28s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    background: 'rgba(255,255,255,0.07)',
                  },
                }}
              >
                <Box
                  sx={{
                    color: '#f4c95d',
                    width: 52,
                    height: 52,
                    mx: 'auto',
                    mb: 1.2,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    background: alpha('#f4c95d', 0.12),
                    border: '1px solid rgba(244,201,93,0.25)',
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#f7f5ed', fontSize: { xs: '1.6rem', md: '2rem' } }}>
                  {stat.number}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ec4b8', fontWeight: 600 }}>
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default StatsSection;

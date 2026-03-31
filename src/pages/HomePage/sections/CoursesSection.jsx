import React from 'react';
import { Box, Container, Chip, Typography, Grid, Card, CardContent, Stack, Button, alpha } from '@mui/material';
import { motion } from 'framer-motion';

const CoursesSection = ({ coursesRef, popularCourses, navigate }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.58,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background:
          'radial-gradient(1000px 420px at 85% 8%, rgba(244,201,93,0.16) 0%, rgba(244,201,93,0) 60%), linear-gradient(180deg, #f2f8f5 0%, #edf6f3 100%)',
      }}
      ref={coursesRef}
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
            label="Most Loved Programs"
            sx={{
              bgcolor: 'rgba(244,201,93,0.18)',
              color: '#8b6517',
              fontWeight: 700,
              border: '1px solid rgba(244,201,93,0.35)',
            }}
          />
          <Typography
            variant="h2"
            sx={{ fontWeight: 900, fontSize: { xs: '1.9rem', md: '2.8rem' }, mt: 2, color: '#122d24' }}
          >
            Choose the Right Quran Path
          </Typography>
          <Typography sx={{ color: '#426156', mt: 1.2, maxWidth: 700, mx: 'auto' }}>
            Every track includes mentorship, progress milestones, and structured outcomes.
          </Typography>
        </Box>
        <Grid
          container
          spacing={4}
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {popularCourses.map((course, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx} component={motion.div} variants={itemVariants}>
              <Card
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: '#ffffff',
                  border: `1px solid ${alpha(course.color, 0.26)}`,
                  boxShadow: '0 20px 35px -26px rgba(10,30,23,0.55)',
                  transition: '0.35s',
                  '&:hover': {
                    transform: 'scale(1.015) translateY(-8px)',
                    boxShadow: `0 25px 40px -22px ${alpha(course.color, 0.5)}`,
                  },
                }}
              >
                <Box sx={{ bgcolor: alpha(course.color, 0.12), p: 3, textAlign: 'center', borderBottom: `1px solid ${alpha(course.color, 0.18)}` }}>
                  <Box sx={{ color: course.color }}>{course.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mt: 1, color: '#123027' }}>
                    {course.title}
                  </Typography>
                </Box>
                <CardContent sx={{ p: 2.4 }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#5f7d72' }}>
                      Level:
                    </Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#1a3c31' }}>
                      {course.level}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#5f7d72' }}>
                      Duration:
                    </Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#1a3c31' }}>
                      {course.duration}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: '#5f7d72' }}>
                      Students:
                    </Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#1a3c31' }}>
                      {course.students}
                    </Typography>
                  </Stack>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      mt: 2.2,
                      width: '100%',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      bgcolor: '#1f5a49',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#174739',
                        boxShadow: 'none',
                      },
                    }}
                    onClick={() => navigate('/courses')}
                  >
                    Explore Course
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default CoursesSection;

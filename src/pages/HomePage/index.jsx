import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Fab, Toolbar, Stack, Typography } from '@mui/material';
import { useInView } from 'react-intersection-observer';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import {
  Book,
  People,
  TrendingUp,
  Mosque,
  AccessTime,
  Public,
  School,
  Language,
  EmojiEvents,
  MenuBook,
  Psychology,
  Diversity3,
  WorkspacePremium,
  Verified,
  Star,
  KeyboardArrowUp,
} from '@mui/icons-material';

import Navbar from '../../components/layout/Navbar';
import HeroSection from './sections/HeroSection';
import StatsSection from './sections/StatsSection';
import FeaturesSection from './sections/FeaturesSection';
import CoursesSection from './sections/CoursesSection';
import TestimonialsSection from './sections/TestimonialsSection';
import CtaSection from './sections/CtaSection';
import FooterSection from './sections/FooterSection';
import { useSystemSettings } from '../../context/SystemSettingsContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { settings } = useSystemSettings();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 26,
    mass: 0.2,
  });

  const blobOneY = useTransform(scrollY, [0, 1300], [0, -180]);
  const blobTwoY = useTransform(scrollY, [0, 1300], [0, 140]);
  const blobThreeY = useTransform(scrollY, [0, 1300], [0, -90]);
  const glowRotate = useTransform(scrollY, [0, 2000], [0, 18]);

  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [featuresRef] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [coursesRef] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [testimonialsRef] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    const siteName = settings?.general?.siteName || 'Quran Academy';
    const siteUrl = settings?.general?.siteUrl || 'https://quranacademy.com';

    document.title = `${siteName} | Learn Quran with Expert Ulama`;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        `Join ${siteName} - Learn Quran online with certified Ulama. Tajweed, Hifz, Tafseer, Arabic language. Flexible classes, global community, and personalized learning.`
      );
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: siteName,
      url: siteUrl,
      description: 'Premier online Quran learning platform with certified Islamic scholars',
    });
    document.head.appendChild(script);

    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'smooth';

    const onScroll = () => {
      setShowScrollTop(window.scrollY > 460);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
      document.head.removeChild(script);
    };
  }, [settings]);

  const revealVariants = {
    hidden: { opacity: 0, y: 64, scale: 0.985 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.82,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const marqueeItems = [
    'Live 1-on-1 Quran Classes',
    'Certified Ijazah Teachers',
    'Flexible Global Timings',
    'Structured Tajweed Pathway',
    'Weekly Progress Reports',
    'Safe Child-Friendly Sessions',
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features = [
    {
      icon: <Mosque sx={{ fontSize: 42 }} />,
      title: 'Authentic Quranic Learning',
      description: "Learn with Ijazah-certified Ulama who specialize in Qira'at, Tajweed, and Tafseer",
      gradient: 'linear-gradient(135deg, #0f766e20, #0c4a6e20)',
      color: '#0f766e',
    },
    {
      icon: <Verified sx={{ fontSize: 42 }} />,
      title: 'Certified Expert Teachers',
      description: 'Hand-picked scholars from Islamic universities with 10+ years experience',
      gradient: 'linear-gradient(135deg, #8b5cf620, #6d28d920)',
      color: '#8b5cf6',
    },
    {
      icon: <MenuBook sx={{ fontSize: 42 }} />,
      title: 'Comprehensive Curriculum',
      description: 'Structured levels from Noorani Qaida to advanced Tafseer and Arabic linguistics',
      gradient: 'linear-gradient(135deg, #05966920, #04785720)',
      color: '#059669',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 42 }} />,
      title: 'Smart Progress Tracking',
      description: 'Personalized reports and milestone certificates for every learner',
      gradient: 'linear-gradient(135deg, #d9770620, #b4530920)',
      color: '#d97706',
    },
    {
      icon: <AccessTime sx={{ fontSize: 42 }} />,
      title: '24/7 Flexible Scheduling',
      description: 'One-on-one live classes at your convenience in any timezone',
      gradient: 'linear-gradient(135deg, #3b82f620, #2563eb20)',
      color: '#3b82f6',
    },
    {
      icon: <Diversity3 sx={{ fontSize: 42 }} />,
      title: 'Global Muslim Community',
      description: 'Join students from USA, UK, Canada, UAE, Australia and beyond',
      gradient: 'linear-gradient(135deg, #ec489a20, #db277720)',
      color: '#ec489a',
    },
  ];

  const popularCourses = [
    {
      title: 'Tajweed-ul-Quran',
      level: 'All Levels',
      duration: '3-6 Months',
      students: '3,200+',
      icon: <Book sx={{ fontSize: 32 }} />,
      color: '#0f766e',
    },
    {
      title: 'Hifz (Memorization)',
      level: 'Intermediate',
      duration: '2-5 Years',
      students: '1,800+',
      icon: <EmojiEvents sx={{ fontSize: 32 }} />,
      color: '#d97706',
    },
    {
      title: 'Tafseer & Translation',
      level: 'Advanced',
      duration: '8 Months',
      students: '2,500+',
      icon: <Psychology sx={{ fontSize: 32 }} />,
      color: '#8b5cf6',
    },
    {
      title: 'Arabic Language',
      level: 'Beginner to Fluent',
      duration: '12 Months',
      students: '4,100+',
      icon: <Language sx={{ fontSize: 32 }} />,
      color: '#3b82f6',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Ahmed',
      country: 'United Kingdom',
      text: 'My Tajweed improved dramatically in 3 months. The flexibility and professionalism is unmatched.',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      name: 'Mohammed Raza',
      country: 'USA',
      text: 'The teachers are patient, knowledgeable, and truly care about each student progress.',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      name: 'Ayesha Khan',
      country: 'Canada',
      text: 'The structured curriculum and personalized attention helped me understand Quranic Arabic deeply.',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
  ];

  const stats = [
    { number: '15,000+', label: 'Active Students', icon: <People sx={{ fontSize: 28 }} /> },
    { number: '250+', label: 'Certified Ulama', icon: <School sx={{ fontSize: 28 }} /> },
    { number: '45+', label: 'Comprehensive Courses', icon: <MenuBook sx={{ fontSize: 28 }} /> },
    { number: '99%', label: 'Parent Satisfaction', icon: <Star sx={{ fontSize: 28 }} /> },
    { number: '35+', label: 'Countries Served', icon: <Public sx={{ fontSize: 28 }} /> },
    { number: '10+', label: 'Years of Excellence', icon: <WorkspacePremium sx={{ fontSize: 28 }} /> },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', overflowX: 'hidden', position: 'relative' }}>
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          zIndex: 3000,
          background: 'linear-gradient(90deg, #0f766e 0%, #14b8a6 45%, #d4af37 100%)',
          transformOrigin: '0%',
          boxShadow: '0 0 14px rgba(15, 118, 110, 0.45)',
          scaleX: smoothProgress,
        }}
      />

      <Box sx={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div
          style={{
            rotate: glowRotate,
            position: 'absolute',
            width: 520,
            height: 520,
            borderRadius: '50%',
            top: '-16%',
            right: '-8%',
            border: '1px solid rgba(244,201,93,0.25)',
          }}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: 360,
            height: 360,
            borderRadius: '50%',
            bottom: '10%',
            left: '-8%',
            border: '1px dashed rgba(73,184,143,0.24)',
          }}
        />

        <motion.div
          style={{
            y: blobOneY,
            position: 'absolute',
            width: 'min(48vw, 380px)',
            height: 'min(48vw, 380px)',
            borderRadius: '50%',
            top: '18%',
            left: '-8%',
            background: 'radial-gradient(circle, rgba(20,184,166,0.24) 0%, rgba(20,184,166,0.04) 65%, transparent 80%)',
            filter: 'blur(6px)',
          }}
        />
        <motion.div
          style={{
            y: blobTwoY,
            position: 'absolute',
            width: 'min(56vw, 460px)',
            height: 'min(56vw, 460px)',
            borderRadius: '50%',
            top: '56%',
            right: '-10%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.03) 65%, transparent 80%)',
            filter: 'blur(8px)',
          }}
        />
        <motion.div
          style={{
            y: blobThreeY,
            position: 'absolute',
            width: 'min(40vw, 320px)',
            height: 'min(40vw, 320px)',
            borderRadius: '50%',
            bottom: '12%',
            left: '44%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.16) 0%, rgba(59,130,246,0.03) 65%, transparent 80%)',
            filter: 'blur(7px)',
          }}
        />

        {[...Array(18)].map((_, i) => (
          <motion.div
            key={`spark-${i}`}
            animate={{ opacity: [0.08, 0.35, 0.08], y: [0, -24, 0] }}
            transition={{ duration: 3.5 + (i % 3), repeat: Infinity, delay: i * 0.22 }}
            style={{
              position: 'absolute',
              width: 4,
              height: 4,
              borderRadius: '50%',
              left: `${(i * 6) % 100}%`,
              top: `${(i * 9) % 100}%`,
              background: 'rgba(143,211,193,0.55)',
            }}
          />
        ))}
      </Box>

      <Navbar />
      <Toolbar />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <HeroSection heroRef={heroRef} heroInView={heroInView} navigate={navigate} />

        <Box
          sx={{
            py: 1.5,
            borderTop: '1px solid rgba(73,184,143,0.2)',
            borderBottom: '1px solid rgba(73,184,143,0.2)',
            background:
              'linear-gradient(90deg, rgba(11,35,29,0.94) 0%, rgba(16,50,41,0.94) 55%, rgba(11,35,29,0.94) 100%)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'flex', width: 'max-content' }}
          >
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <Stack
                key={`${item}-${index}`}
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ px: 2.2 }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#f4c95d',
                    boxShadow: '0 0 10px rgba(244,201,93,0.6)',
                  }}
                />
                <Typography sx={{ color: '#e7f3ee', fontWeight: 700, fontSize: { xs: '0.78rem', md: '0.88rem' }, letterSpacing: '0.2px' }}>
                  {item}
                </Typography>
              </Stack>
            ))}
          </motion.div>
        </Box>

        <motion.div variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
          <StatsSection stats={stats} />
        </motion.div>

        <motion.div variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          <FeaturesSection featuresRef={featuresRef} features={features} />
        </motion.div>

        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.08 }}
        >
          <CoursesSection coursesRef={coursesRef} popularCourses={popularCourses} navigate={navigate} />
        </motion.div>

        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.1 }}
        >
          <TestimonialsSection testimonialsRef={testimonialsRef} testimonials={testimonials} />
        </motion.div>

        <motion.div variants={revealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          <CtaSection navigate={navigate} />
        </motion.div>

        <FooterSection />
      </Box>

      <Fab
        onClick={scrollToTop}
        aria-label="Scroll to top"
        sx={{
          position: 'fixed',
          right: { xs: 16, md: 28 },
          bottom: { xs: 18, md: 28 },
          zIndex: 2200,
          bgcolor: '#0f766e',
          color: '#ffffff',
          boxShadow: '0 18px 28px -14px rgba(15,118,110,0.8)',
          transform: showScrollTop ? 'translateY(0)' : 'translateY(90px)',
          opacity: showScrollTop ? 1 : 0,
          transition: 'all 0.32s ease',
          '&:hover': {
            bgcolor: '#0d6b64',
            transform: showScrollTop ? 'translateY(-4px)' : 'translateY(90px)',
          },
        }}
      >
        <KeyboardArrowUp />
      </Fab>
    </Box>
  );
};

export default HomePage;

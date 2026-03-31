import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Stack,
  Divider,
  IconButton,
  TextField,
  Button,
  alpha,
  Tooltip,
  Fade,
  Paper,
  Avatar,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  Facebook,
  Instagram,
  YouTube,
  Twitter,
  Email,
  Phone,
  LocationOn,
  School,
  MenuBook,
  Mosque,
  Favorite,
  Send,
  WhatsApp,
  AccessTime,
  Verified,
  Stars,
  Diamond,
  TrendingUp,
  Lightbulb,
  Security,
  FlashOn,
  Chat,
  Copyright,
  GitHub,
  ArrowOutward,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSystemSettings } from '../../../context/SystemSettingsContext';

const FooterSection = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { settings } = useSystemSettings();
  const siteName = settings?.general?.siteName || 'Quran Academy';
  const supportEmail = settings?.general?.contactEmail || 'support@quranacademy.com';

  const quickLinks = [
    { name: 'About Academy', icon: <School sx={{ fontSize: 16 }} />, href: '#' },
    { name: 'Programs', icon: <MenuBook sx={{ fontSize: 16 }} />, href: '#' },
    { name: 'Fee Plans', icon: <Diamond sx={{ fontSize: 16 }} />, href: '#' },
    { name: 'Success Stories', icon: <Stars sx={{ fontSize: 16 }} />, href: '#' },
    { name: 'Our Ulama', icon: <Verified sx={{ fontSize: 16 }} />, href: '#' },
  ];

  const supportLinks = [
    { name: 'Help Center', icon: <Lightbulb sx={{ fontSize: 14 }} />, href: '#' },
    { name: 'FAQs', icon: <Chat sx={{ fontSize: 14 }} />, href: '#' },
    { name: '24/7 Support', icon: <AccessTime sx={{ fontSize: 14 }} />, href: '#', highlight: true },
    { name: 'Privacy Policy', icon: <Security sx={{ fontSize: 14 }} />, href: '#' },
    { name: 'Terms of Service', icon: <FlashOn sx={{ fontSize: 14 }} />, href: '#' },
  ];

  const socialIcons = [
    { icon: Facebook, color: '#1877f2', label: 'Facebook' },
    { icon: Instagram, color: '#e4405f', label: 'Instagram' },
    { icon: YouTube, color: '#ff0000', label: 'YouTube' },
    { icon: Twitter, color: '#1da1f2', label: 'Twitter' },
    { icon: WhatsApp, color: '#25D366', label: 'WhatsApp' },
    { icon: GitHub, color: '#ffffff', label: 'GitHub' },
  ];

  const achievements = [
    { icon: <Verified sx={{ fontSize: 26 }} />, number: '15K+', label: 'Students', color: '#49b88f' },
    { icon: <Stars sx={{ fontSize: 26 }} />, number: '250+', label: 'Ulama', color: '#f4c95d' },
    { icon: <School sx={{ fontSize: 26 }} />, number: '45+', label: 'Courses', color: '#8fd3c1' },
    { icon: <TrendingUp sx={{ fontSize: 26 }} />, number: '99%', label: 'Satisfaction', color: '#ffb07a' },
  ];

  const handleSubscribe = () => {
    if (!email) {
      return;
    }
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 2800);
    setEmail('');
  };

  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        background:
          'radial-gradient(1000px 420px at 95% 0%, rgba(244,201,93,0.16) 0%, rgba(244,201,93,0) 62%), radial-gradient(900px 360px at 5% 100%, rgba(73,184,143,0.16) 0%, rgba(73,184,143,0) 58%), linear-gradient(165deg, #081f19 0%, #0d2f26 52%, #071913 100%)',
        color: '#e9f6f1',
        pt: { xs: 5, md: 7 },
        pb: { xs: 3, md: 3.5 },
        mt: 'auto',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[...Array(14)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.1, 0.3, 0.1], y: [0, -14, 0] }}
            transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.22 }}
            style={{
              position: 'absolute',
              width: 3,
              height: 20,
              left: `${(i * 7) % 100}%`,
              top: `${(i * 9) % 100}%`,
              borderRadius: 999,
              background: 'linear-gradient(to top, rgba(143,211,193,0.05), rgba(143,211,193,0.65))',
            }}
          />
        ))}
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: { xs: 2, md: 2.4 },
            borderRadius: 3,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.14)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1.2} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }}>
                <Chip
                  icon={<Stars sx={{ color: '#f4c95d' }} />}
                  label="Join Weekly Quran Updates"
                  sx={{
                    bgcolor: 'rgba(244,201,93,0.2)',
                    color: '#f4c95d',
                    border: '1px solid rgba(244,201,93,0.35)',
                    fontWeight: 700,
                  }}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      borderRadius: '10px',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.35)' },
                      '&.Mui-focused fieldset': { borderColor: '#8fd3c1' },
                    },
                    '& .MuiInputBase-input': { color: '#ffffff' },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#8fd3c1', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSubscribe}
                  sx={{
                    borderRadius: '10px',
                    px: 2.5,
                    bgcolor: '#f4c95d',
                    color: '#14382d',
                    fontWeight: 800,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#e4b84d' },
                  }}
                >
                  {subscribed ? 'Subscribed' : 'Subscribe'}
                </Button>
              </Stack>
              {subscribed && (
                <Fade in>
                  <Typography variant="caption" sx={{ color: '#8fd3c1', mt: 0.8, display: 'block', fontWeight: 600 }}>
                    JazakAllah Khair. You are subscribed.
                  </Typography>
                </Fade>
              )}
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2} justifyContent="space-between" sx={{ mb: 4.5 }}>
          {achievements.map((item, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <Paper
                  elevation={0}
                  sx={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 3,
                    p: 2,
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <Box sx={{ color: item.color, mb: 1 }}>{item.icon}</Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffffff' }}>
                    {item.number}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#b6d4ca', fontWeight: 700 }}>
                    {item.label}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} md={4.3}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.3} sx={{ mb: 1.6 }}>
                <Mosque sx={{ color: '#f4c95d', fontSize: 42 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#f7f5ed', lineHeight: 1 }}>
                    {siteName.split(' ')[0] || 'Quran'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#a9cfc2', letterSpacing: '1.6px', fontWeight: 700 }}>
                    {siteName.toUpperCase()}
                  </Typography>
                </Box>
              </Stack>

              <Typography sx={{ mb: 2, color: '#c4dfd6', lineHeight: 1.75, maxWidth: 470 }}>
                We help families build a lifelong Quran connection through authentic teaching,
                compassionate mentorship, and beautifully structured learning.
              </Typography>

              <Stack direction="row" spacing={1.1} flexWrap="wrap" useFlexGap>
                {socialIcons.map((social, index) => (
                  <Tooltip key={index} title={social.label} arrow>
                    <IconButton
                      sx={{
                        color: '#d8ede6',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.11)',
                        '&:hover': {
                          backgroundColor: alpha(social.color, 0.22),
                          color: social.color,
                        },
                      }}
                    >
                      <social.icon />
                    </IconButton>
                  </Tooltip>
                ))}
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={6} md={2.2}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.3, color: '#f7f5ed' }}>
              Quick Links
            </Typography>
            <Stack spacing={1.5}>
              {quickLinks.map((link, index) => (
                <Box
                  key={index}
                  component="a"
                  href={link.href}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.9,
                    color: '#b6d4ca',
                    textDecoration: 'none',
                    '&:hover': { color: '#ffffff' },
                  }}
                >
                  {link.icon}
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>{link.name}</Typography>
                  <ArrowOutward sx={{ fontSize: 13, opacity: 0.65 }} />
                </Box>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={6} md={2.2}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.3, color: '#f7f5ed' }}>
              Support
            </Typography>
            <Stack spacing={1.5}>
              {supportLinks.map((link, index) => (
                <Box
                  key={index}
                  component="a"
                  href={link.href}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: link.highlight ? '#f4c95d' : '#b6d4ca',
                    textDecoration: 'none',
                    '&:hover': { color: '#ffffff' },
                  }}
                >
                  {link.icon}
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>{link.name}</Typography>
                </Box>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={3.3}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.3, color: '#f7f5ed' }}>
              Contact
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Avatar sx={{ bgcolor: 'rgba(143,211,193,0.14)', color: '#8fd3c1', width: 36, height: 36 }}>
                  <Email sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography sx={{ color: '#c4dfd6', fontWeight: 600 }}>{supportEmail}</Typography>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Avatar sx={{ bgcolor: 'rgba(143,211,193,0.14)', color: '#8fd3c1', width: 36, height: 36 }}>
                  <Phone sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography sx={{ color: '#c4dfd6', fontWeight: 600 }}>+1 (800) 123-QURAN</Typography>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Avatar sx={{ bgcolor: 'rgba(143,211,193,0.14)', color: '#8fd3c1', width: 36, height: 36 }}>
                  <LocationOn sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography sx={{ color: '#c4dfd6', fontWeight: 600 }}>Online Worldwide</Typography>
              </Stack>

              <Paper
                elevation={0}
                sx={{
                  mt: 0.6,
                  p: 1.3,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Typography sx={{ color: '#eaf6f1', fontWeight: 700, fontSize: '0.88rem' }}>
                  Need help choosing a course?
                </Typography>
                <Typography sx={{ color: '#b6d4ca', fontSize: '0.8rem', mt: 0.4 }}>
                  Our support team is available every day.
                </Typography>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3.5, borderColor: 'rgba(255,255,255,0.12)' }} />

        <Grid container alignItems="center" justifyContent="space-between" sx={{ py: 0.8 }}>
          <Grid item xs={12} md={7}>
            <Typography
              variant="caption"
              sx={{
                color: '#a9cfc2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-start' },
                gap: 0.8,
                fontWeight: 600,
              }}
            >
              <Copyright sx={{ fontSize: 14 }} />
              {currentYear} {siteName}. All rights reserved.
              <Favorite sx={{ fontSize: 12, color: '#f4c95d' }} />
            </Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography
              variant="caption"
              sx={{
                color: '#a9cfc2',
                textAlign: { xs: 'center', md: 'right' },
                display: 'block',
                mt: { xs: 0.7, md: 0 },
                fontWeight: 600,
              }}
            >
              Crafted with care for beautiful Quran learning.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default FooterSection;
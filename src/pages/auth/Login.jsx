import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  alpha,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Paper,
  Container,
  Stack,
  Chip,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Mosque,
  Login as LoginIcon,
  Email,
  Lock,
  AutoAwesome,
  School,
  Person,
  AdminPanelSettings,
  ArrowOutward,
  CheckCircle,
  Celebration,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSystemSettings } from '../../context/SystemSettingsContext';

const demoAccounts = [
  {
    role: 'Student',
    icon: Person,
    email: 'inshaallahebm2005@gmail.com',
    password: '123456',
    color: '#4da0ff',
  },
  {
    role: 'Scholar',
    icon: School,
    email: 'thanzla2005@gmail.com',
    password: '123456',
    color: '#7f86ff',
  },
  {
    role: 'Admin',
    icon: AdminPanelSettings,
    email: 'xiro474747@gmail.com',
    password: '123456',
    color: '#ff9a5f',
  },
];

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { login } = useAuth();
  const { settings } = useSystemSettings();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const siteName = settings?.general?.siteName || 'Quran Academy';
  const supportEmail = settings?.general?.contactEmail || 'support@quranacademy.com';

  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: `${(i * 8) % 100}%`,
        top: `${(i * 13) % 100}%`,
        delay: i * 0.25,
      })),
    []
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Min 6 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    const result = await login(formData.email, formData.password);
    setIsLoading(false);

    if (result.success) {
      const userRole = result.user?.role || 'student';
      const redirectPath =
        userRole === 'admin' ? '/admin/dashboard' : userRole === 'ulma' ? '/ulma/dashboard' : '/student/dashboard';

      setShowSuccess(true);
      setTimeout(() => {
        navigate(redirectPath);
      }, 1300);
      return;
    }

    setErrors({ general: result.error || 'Login failed' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: '', general: '' }));
    }
  };

  const quickLogin = (email, password) => {
    setErrors({});
    setFormData({ email, password });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        background:
          'radial-gradient(1100px 500px at 95% -10%, rgba(126,87,194,0.35) 0%, rgba(126,87,194,0) 58%), radial-gradient(800px 400px at -10% 110%, rgba(66,165,245,0.3) 0%, rgba(66,165,245,0) 60%), linear-gradient(145deg, #0d111a 0%, #111b2e 52%, #0a1423 100%)',
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            animate={{ opacity: [0.15, 0.45, 0.15], y: [0, -14, 0] }}
            transition={{ duration: 3.2 + (particle.id % 4), repeat: Infinity, delay: particle.delay }}
            style={{
              position: 'absolute',
              width: 4,
              height: 4,
              borderRadius: '50%',
              left: particle.left,
              top: particle.top,
              background: 'rgba(173,216,255,0.75)',
            }}
          />
        ))}
      </Box>

      <Container
        maxWidth="xl"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 3, md: 5 },
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 1120,
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(9,14,26,0.7)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' } }}>
            <Box
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                background:
                  'linear-gradient(160deg, rgba(126,87,194,0.24) 0%, rgba(66,165,245,0.2) 52%, rgba(126,87,194,0.16) 100%)',
                borderRight: { xs: 'none', md: '1px solid rgba(255,255,255,0.12)' },
                borderBottom: { xs: '1px solid rgba(255,255,255,0.12)', md: 'none' },
              }}
            >
              <Stack spacing={2.5}>
                <Stack direction="row" alignItems="center" spacing={1.3}>
                  <Mosque sx={{ color: '#f8d078', fontSize: 44 }} />
                  <Box>
                    <Typography sx={{ color: '#f6f7fb', fontWeight: 900, fontSize: { xs: '1.6rem', md: '1.9rem' } }}>
                      {siteName}
                    </Typography>
                    <Typography sx={{ color: '#c8d2e8', fontWeight: 600, fontSize: '0.84rem', letterSpacing: '1px' }}>
                      MODERN QURAN LEARNING HUB
                    </Typography>
                  </Box>
                </Stack>

                <Chip
                  icon={<AutoAwesome sx={{ color: '#f8d078' }} />}
                  label="A different login experience"
                  sx={{
                    alignSelf: 'flex-start',
                    color: '#f8d078',
                    bgcolor: 'rgba(248,208,120,0.14)',
                    border: '1px solid rgba(248,208,120,0.35)',
                    fontWeight: 700,
                  }}
                />

                <Typography sx={{ color: '#e8eefc', lineHeight: 1.75, maxWidth: 520 }}>
                  Continue your Quran journey with a focused and elegant portal. Your lessons, progress,
                  and teacher updates are one sign-in away.
                </Typography>

                <Stack spacing={1.2}>
                  {['Live classes with certified Ulama', 'Progress reports for parents', 'Secure and easy access'].map((item) => (
                    <Stack key={item} direction="row" spacing={1.2} alignItems="center">
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#6ec8ff',
                          boxShadow: '0 0 10px rgba(110,200,255,0.7)',
                        }}
                      />
                      <Typography sx={{ color: '#d4dff5', fontWeight: 600, fontSize: '0.92rem' }}>{item}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Box>

            <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
              <Typography sx={{ color: '#f8faff', fontWeight: 900, fontSize: { xs: '1.5rem', md: '1.9rem' } }}>
                Welcome Back
              </Typography>
              <Typography sx={{ color: '#b6c4df', mt: 0.6, mb: 2.3 }}>
                Sign in to continue learning.
              </Typography>

              {errors.general && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.general}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    name="email"
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#9db2d9' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(255,255,255,0.05)',
                        borderRadius: 2,
                        color: '#f2f6ff',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.16)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.28)' },
                        '&.Mui-focused fieldset': { borderColor: '#6ec8ff' },
                      },
                      '& .MuiFormHelperText-root': { mx: 0 },
                    }}
                  />

                  <TextField
                    fullWidth
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#9db2d9' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword((prev) => !prev)} sx={{ color: '#b9c7df' }}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(255,255,255,0.05)',
                        borderRadius: 2,
                        color: '#f2f6ff',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.16)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.28)' },
                        '&.Mui-focused fieldset': { borderColor: '#6ec8ff' },
                      },
                      '& .MuiFormHelperText-root': { mx: 0 },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    disabled={isLoading || showSuccess}
                    variant="contained"
                    endIcon={
                      isLoading ? <CircularProgress size={18} color="inherit" /> : <LoginIcon />
                    }
                    sx={{
                      mt: 0.3,
                      py: 1.25,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: '1rem',
                      background: 'linear-gradient(90deg, #6e8dff 0%, #67c5ff 100%)',
                      color: '#0b1730',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #5f7fff 0%, #5ab9f4 100%)',
                      },
                    }}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </Stack>
              </Box>

              <Stack
                direction={isMobile ? 'column' : 'row'}
                justifyContent="space-between"
                spacing={1}
                sx={{ mt: 1.8, mb: 2.2 }}
              >
                <Link component={RouterLink} to="/forgot-password" sx={{ color: '#bdd0f0' }} underline="hover">
                  Forgot password?
                </Link>
                <Link component={RouterLink} to="/register" sx={{ color: '#84ccff', fontWeight: 700 }} underline="hover">
                  Create new account
                </Link>
              </Stack>

              <Typography sx={{ color: '#b6c4df', fontWeight: 600, fontSize: '0.88rem', mb: 1.1 }}>
                Quick Access
              </Typography>

              <Stack direction="row" flexWrap="wrap" gap={1}>
                {demoAccounts.map((demo) => (
                  <Button
                    key={demo.role}
                    variant="outlined"
                    onClick={() => quickLogin(demo.email, demo.password)}
                    startIcon={<demo.icon />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      color: demo.color,
                      borderColor: alpha(demo.color, 0.45),
                      backgroundColor: alpha(demo.color, 0.08),
                      '&:hover': {
                        borderColor: demo.color,
                        backgroundColor: alpha(demo.color, 0.15),
                      },
                    }}
                  >
                    {demo.role}
                  </Button>
                ))}
              </Stack>

              <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mt: 2, color: '#9db2d9' }}>
                <Typography sx={{ fontSize: '0.78rem' }}>Need help?</Typography>
                <ArrowOutward sx={{ fontSize: 14 }} />
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>Contact support</Typography>
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Container>

      {showSuccess && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(6,12,26,0.78)',
            backdropFilter: 'blur(4px)',
            p: 2,
          }}
        >
          <Paper
            component={motion.div}
            initial={{ opacity: 0, scale: 0.92, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            elevation={0}
            sx={{
              borderRadius: 3,
              p: 3,
              minWidth: { xs: '100%', sm: 380 },
              maxWidth: 420,
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.14)',
              bgcolor: 'rgba(12,28,56,0.95)',
            }}
          >
            <Celebration sx={{ color: '#f8d078', fontSize: 34 }} />
            <CheckCircle sx={{ color: '#72e0a6', fontSize: 56, mt: 0.6 }} />
            <Typography sx={{ color: '#f3f7ff', fontWeight: 900, mt: 1.3, fontSize: '1.2rem' }}>
              Login Successful
            </Typography>
            <Typography sx={{ color: '#b7c9e8', mt: 0.5, fontSize: '0.9rem' }}>
              Redirecting to your dashboard...
            </Typography>
            <Typography sx={{ color: '#9fb8dd', mt: 0.8, fontSize: '0.8rem' }}>
              Need help? {supportEmail}
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default Login;

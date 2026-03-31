import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  IconButton,
  InputAdornment,
  Alert,
  Stack,
  Chip,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Mosque,
  ArrowBack,
  ArrowForward,
  AutoAwesome,
  Person,
  School,
  Verified,
  CheckCircle,
  Celebration,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSystemSettings } from '../../context/SystemSettingsContext';

const steps = ['Account Type', 'Personal Info', 'Role Details'];

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    role: 'student',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: '',
    timezone: '',
    age: '',
    gender: 'male',
    expertise: [],
    experience: '',
    languages: ['english'],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const { register } = useAuth();
  const { settings } = useSystemSettings();
  const navigate = useNavigate();
  const siteName = settings?.general?.siteName || 'Quran Academy';
  const supportEmail = settings?.general?.contactEmail || 'support@quranacademy.com';
  const defaultTimezone = settings?.general?.timezone || 'Asia/Karachi';

  const countries = ['Pakistan', 'Saudi Arabia', 'USA', 'UK', 'UAE', 'India', 'Bangladesh'];
  const countryTimezoneMap = {
    Pakistan: 'Asia/Karachi',
    India: 'Asia/Kolkata',
    'Saudi Arabia': 'Asia/Riyadh',
    UAE: 'Asia/Dubai',
    UK: 'Europe/London',
    USA: 'America/New_York',
    Bangladesh: 'Asia/Dhaka',
  };

  const timezones = [
    { label: 'Pakistan (Asia/Karachi)', value: 'Asia/Karachi' },
    { label: 'India (Asia/Kolkata)', value: 'Asia/Kolkata' },
    { label: 'Saudi Arabia (Asia/Riyadh)', value: 'Asia/Riyadh' },
    { label: 'UAE (Asia/Dubai)', value: 'Asia/Dubai' },
    { label: 'UK (Europe/London)', value: 'Europe/London' },
    { label: 'USA - New York (America/New_York)', value: 'America/New_York' },
    { label: 'USA - Los Angeles (America/Los_Angeles)', value: 'America/Los_Angeles' },
    { label: 'USA - Chicago (America/Chicago)', value: 'America/Chicago' },
    { label: 'Bangladesh (Asia/Dhaka)', value: 'Asia/Dhaka' },
  ];

  const languagesList = ['english', 'urdu', 'arabic', 'french', 'spanish'];
  const expertiseList = ['nazra', 'hifz', 'tajweed', 'tafseer'];

  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: `${(i * 9) % 100}%`,
        top: `${(i * 11) % 100}%`,
        delay: i * 0.23,
      })),
    []
  );

  useEffect(() => {
    if (!formData.timezone) {
      setFormData((prev) => ({ ...prev, timezone: defaultTimezone }));
    }
  }, [defaultTimezone]);

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setFormData((prev) => ({
      ...prev,
      country,
      timezone: countryTimezoneMap[country] || defaultTimezone,
    }));

    if (errors.country || errors.timezone) {
      setErrors((prev) => ({ ...prev, country: '', timezone: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0 && !formData.role) {
      newErrors.role = 'Please select a role';
    }

    if (step === 1) {
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
      if (!formData.country) newErrors.country = 'Country is required';
      if (!formData.timezone) newErrors.timezone = 'Timezone is required';
    }

    if (step === 2) {
      if (formData.role === 'student') {
        if (!formData.age) newErrors.age = 'Age is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
      }

      if (formData.role === 'ulma') {
        if (!formData.expertise || formData.expertise.length === 0) {
          newErrors.expertise = 'Please select at least one expertise';
        }
        if (!formData.experience) newErrors.experience = 'Experience is required';
      }
    }

    return newErrors;
  };

  const handleNext = () => {
    const stepErrors = validateStep(activeStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setErrors({});
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'expertise') {
      const newExpertise = formData.expertise.includes(value)
        ? formData.expertise.filter((item) => item !== value)
        : [...formData.expertise, value];

      setFormData((prev) => ({ ...prev, expertise: newExpertise }));
    } else if (name === 'languages') {
      const newLanguages = formData.languages.includes(value)
        ? formData.languages.filter((item) => item !== value)
        : [...formData.languages, value];

      setFormData((prev) => ({ ...prev, languages: newLanguages }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const stepErrors = validateStep(2);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    const userData = {
      ...formData,
      age: formData.age ? parseInt(formData.age, 10) : undefined,
      experience: formData.experience ? parseInt(formData.experience, 10) : undefined,
    };

    const result = await register(userData);

    if (!result.success) {
      return;
    }

    const redirectPath =
      result.role === 'admin' ? '/admin/dashboard' : result.role === 'ulma' ? '/ulma/dashboard' : '/student/dashboard';

    setShowSuccess(true);
    setTimeout(() => {
      navigate(redirectPath);
    }, 1400);
  };

  const renderRoleCard = (value, title, desc, icon) => {
    const selected = formData.role === value;

    return (
      <Paper
        sx={{
          p: 2,
          borderRadius: 2,
          border: selected ? '2px solid #49b88f' : '1px solid #d8e5de',
          bgcolor: selected ? 'rgba(73,184,143,0.08)' : '#fff',
          transition: 'all 0.2s ease',
        }}
      >
        <FormControlLabel
          value={value}
          control={<Radio />}
          sx={{ alignItems: 'flex-start', m: 0 }}
          label={
            <Stack spacing={0.4}>
              <Stack direction="row" spacing={1} alignItems="center">
                {icon}
                <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
              </Stack>
              <Typography sx={{ color: '#4f6b60', fontSize: '0.86rem' }}>{desc}</Typography>
            </Stack>
          }
        />
      </Paper>
    );
  };

  const renderStepContent = (step) => {
    if (step === 0) {
      return (
        <Box sx={{ mt: 1 }}>
          <FormLabel component="legend" sx={{ mb: 1.5, fontWeight: 700, color: '#29463c' }}>
            Select Your Role
          </FormLabel>
          <RadioGroup name="role" value={formData.role} onChange={handleChange} sx={{ gap: 1.3 }}>
            {renderRoleCard('student', 'Student', 'Learn Quran with expert teachers worldwide', <Person sx={{ color: '#49b88f' }} />)}
            {renderRoleCard('ulma', 'Ulma (Teacher)', 'Teach students with your Quran expertise', <School sx={{ color: '#f4c95d' }} />)}
          </RadioGroup>
          {errors.role && <Alert severity="error" sx={{ mt: 1.5 }}>{errors.role}</Alert>}
        </Box>
      );
    }

    if (step === 1) {
      return (
        <Grid container spacing={1.8} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField fullWidth label="Full Name" name="name" value={formData.name} onChange={handleChange} error={!!errors.name} helperText={errors.name} required />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Confirm Password" name="confirmPassword" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} error={!!errors.confirmPassword} helperText={errors.confirmPassword} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} error={!!errors.phone} helperText={errors.phone} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Country" name="country" value={formData.country} onChange={handleCountryChange} error={!!errors.country} helperText={errors.country} required>
              {countries.map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField select fullWidth label="Timezone" name="timezone" value={formData.timezone} onChange={handleChange} error={!!errors.timezone} helperText={errors.timezone} required>
              {timezones.map((tz) => (
                <MenuItem key={tz.value} value={tz.value}>
                  {tz.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{ fontWeight: 700, color: '#29463c', mb: 0.8, fontSize: '0.9rem' }}>
              Languages You Speak
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.8}>
              {languagesList.map((lang) => (
                <Chip
                  key={lang}
                  clickable
                  label={lang.charAt(0).toUpperCase() + lang.slice(1)}
                  onClick={() => handleChange({ target: { name: 'languages', value: lang } })}
                  color={formData.languages.includes(lang) ? 'primary' : 'default'}
                  variant={formData.languages.includes(lang) ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Grid>
        </Grid>
      );
    }

    if (formData.role === 'student') {
      return (
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Age" name="age" type="number" value={formData.age} onChange={handleChange} error={!!errors.age} helperText={errors.age} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormLabel component="legend" sx={{ mb: 0.8, display: 'block', color: '#29463c', fontWeight: 700 }}>
              Gender
            </FormLabel>
            <RadioGroup row name="gender" value={formData.gender} onChange={handleChange}>
              <FormControlLabel value="male" control={<Radio />} label="Male" />
              <FormControlLabel value="female" control={<Radio />} label="Female" />
            </RadioGroup>
            {errors.gender && <Alert severity="error" sx={{ mt: 1 }}>{errors.gender}</Alert>}
          </Grid>
        </Grid>
      );
    }

    return (
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12}>
          <Typography sx={{ fontWeight: 700, color: '#29463c', mb: 0.8 }}>
            Quran Expertise
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.8}>
            {expertiseList.map((exp) => (
              <Chip
                key={exp}
                clickable
                label={exp.charAt(0).toUpperCase() + exp.slice(1)}
                onClick={() => handleChange({ target: { name: 'expertise', value: exp } })}
                color={formData.expertise.includes(exp) ? 'primary' : 'default'}
                variant={formData.expertise.includes(exp) ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>
          {errors.expertise && <Alert severity="error" sx={{ mt: 1.2 }}>{errors.expertise}</Alert>}
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Years of Teaching Experience"
            name="experience"
            type="number"
            value={formData.experience}
            onChange={handleChange}
            error={!!errors.experience}
            helperText={errors.experience}
            required
          />
        </Grid>
      </Grid>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background:
          'radial-gradient(1200px 460px at 100% -10%, rgba(73,184,143,0.25) 0%, rgba(73,184,143,0) 58%), radial-gradient(700px 340px at 0% 100%, rgba(244,201,93,0.25) 0%, rgba(244,201,93,0) 55%), linear-gradient(145deg, #f5fbf8 0%, #eef6f2 52%, #f8fcfa 100%)',
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            animate={{ opacity: [0.16, 0.45, 0.16], y: [0, -12, 0] }}
            transition={{ duration: 3.2 + (particle.id % 3), repeat: Infinity, delay: particle.delay }}
            style={{
              position: 'absolute',
              width: 4,
              height: 4,
              borderRadius: '50%',
              left: particle.left,
              top: particle.top,
              background: 'rgba(73,184,143,0.7)',
            }}
          />
        ))}
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, position: 'relative', zIndex: 2 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: { xs: 2.4, sm: 3, md: 4 },
            border: '1px solid rgba(12,56,43,0.12)',
            boxShadow: '0 28px 50px -30px rgba(12,56,43,0.35)',
            background: '#ffffff',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3.2 }}>
            <Stack direction="row" spacing={1.1} justifyContent="center" alignItems="center">
              <Mosque sx={{ color: '#1f6d57', fontSize: 38 }} />
              <Typography sx={{ fontWeight: 900, color: '#153c31', fontSize: { xs: '1.35rem', md: '1.8rem' } }}>
                Create Your Account
              </Typography>
            </Stack>
            <Typography sx={{ color: '#55786d', mt: 0.6 }}>
              Premium onboarding experience for {siteName}
            </Typography>
            <Chip
              icon={<AutoAwesome sx={{ color: '#f4c95d' }} />}
              label="New Beautiful UI"
              sx={{
                mt: 1.2,
                color: '#8b6517',
                bgcolor: alpha('#f4c95d', 0.25),
                border: '1px solid rgba(244,201,93,0.5)',
                fontWeight: 700,
              }}
            />
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 2.6 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box component="form" onSubmit={handleSubmit}>
            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3.4 }}>
              <Button disabled={activeStep === 0 || showSuccess} onClick={handleBack} startIcon={<ArrowBack />} sx={{ textTransform: 'none', fontWeight: 700 }}>
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button variant="contained" disabled={showSuccess} onClick={handleSubmit} endIcon={<Verified />} sx={{ textTransform: 'none', fontWeight: 800 }}>
                  Create Account
                </Button>
              ) : (
                <Button variant="contained" disabled={showSuccess} onClick={handleNext} endIcon={<ArrowForward />} sx={{ textTransform: 'none', fontWeight: 800 }}>
                  Next
                </Button>
              )}
            </Box>

            <Box sx={{ mt: 2.5, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#567a6f' }}>
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" sx={{ color: '#1f6d57', fontWeight: 700 }}>
                  Sign in here
                </Link>
              </Typography>
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
            background: 'rgba(5,27,21,0.68)',
            backdropFilter: 'blur(4px)',
            p: 2,
          }}
        >
          <Paper
            component={motion.div}
            initial={{ opacity: 0, scale: 0.92, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            elevation={0}
            sx={{
              borderRadius: 3,
              p: 3,
              minWidth: { xs: '100%', sm: 380 },
              maxWidth: 430,
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.25)',
              bgcolor: 'rgba(17,58,46,0.95)',
            }}
          >
            <Celebration sx={{ color: '#f4c95d', fontSize: 34 }} />
            <CheckCircle sx={{ color: '#8fd3c1', fontSize: 56, mt: 0.6 }} />
            <Typography sx={{ color: '#f3fbf8', fontWeight: 900, mt: 1.3, fontSize: '1.2rem' }}>
              Account Created
            </Typography>
            <Typography sx={{ color: '#c8e6dc', mt: 0.5, fontSize: '0.9rem' }}>
              Welcome to {siteName}. Redirecting to your dashboard...
            </Typography>
            <Typography sx={{ color: '#a6d6c8', mt: 0.8, fontSize: '0.8rem' }}>
              Support: {supportEmail}
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default Register;
